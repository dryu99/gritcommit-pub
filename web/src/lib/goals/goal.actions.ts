"use server";

import { Config } from "@/lib/config";
import { generateModelId } from "@/lib/generate-model-id";
import { GoalEntryStatus, ScheduleType } from "@/types/enums";
import { Insertable } from "kysely";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { z } from "zod";
import { DB } from "../../database/db";
import { Goal, GoalEntry } from "../../database/db-generated-types";
import { getSessionUser } from "../auth/auth.lib";
import { toNextDueDate } from "../date";
import {
  sendEmail,
  toCommitterEmailSubject,
  toEmailHtml,
  toPartnerEmailSubject,
} from "../email/email.lib";
import CommitterNewGoalEmail from "../email/templates/committer-new-goal-email";
import PartnerNewGoalEmail from "../email/templates/partner-new-goal-email";
import PartnerVerifyEmail from "../email/templates/partner-verify-email";
import { CompleteGoalEntry, fetchCompleteGoalEntry } from "./goal.lib";

const CreateGoalReqBodySchema = z.object({
  description: z.string().min(1),
  stakeAmount: z.coerce.number().min(0),
  partnerEmail: z.string().email(),
  startToday: z.boolean().optional(),

  // existence implies scheduleType = RECURRING
  scheduleDays: z.array(z.number()).optional(), // assume sorted

  // existence implies scheduleType = ONCE
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in yyyy-mm-dd format")
    .optional(),
});

export type CreateGoalReqBody = z.infer<typeof CreateGoalReqBodySchema>;

// TODO do auth check
export const createGoal = async (data: any) => {
  const {
    success,
    error,
    data: reqBody,
  } = CreateGoalReqBodySchema.safeParse(data);
  if (!success) {
    console.log(error.errors);
    return error.errors.map((e) => e.message).join(", ");
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    throw new Error("User not found");
  }

  // TODO validate that date isnt in past
  // TODO validate startToday isn't true if scheduleDays doesnt match
  // TODO validate that scheudlDays.length > 0 if CustomDays === true
  const newGoal: Insertable<Goal> = {
    id: generateModelId(),
    createdByUserId: sessionUser.id,
    description: reqBody.description,
    stakeAmount: reqBody.stakeAmount,
    partnerEmail: reqBody.partnerEmail,
    scheduleType: reqBody.dueDate // TODO consider passing schedule type from client. this feels prone to bugs
      ? ScheduleType.Once
      : ScheduleType.Recurring,
    scheduleDays: reqBody.scheduleDays
      ? [...reqBody.scheduleDays].sort((a, b) => a - b)
      : null,
  };

  const nextDueDate = toNextDueDate({
    timezone: sessionUser.timezone,
    dueDate: reqBody.dueDate,
    startToday: reqBody.startToday,
    scheduleDays: reqBody.scheduleDays,
  });
  const newGoalEntry: Insertable<GoalEntry> = {
    id: generateModelId(),
    goalId: newGoal.id,
    dueAt: nextDueDate,
    status: GoalEntryStatus.Pending,
  };

  if (Config.NODE_ENV === "development") {
    console.log("CREATE_GOAL");
    console.log("rawGoal", reqBody);
    console.log("goal", newGoal);
    console.log("firstGoalEntry", newGoalEntry);
  }

  await DB.get()
    .transaction()
    .execute(async (trx) => {
      await trx.insertInto("goal").values(newGoal).execute();
      await trx.insertInto("goalEntry").values(newGoalEntry).execute();
    });

  const completeGoalEntry: CompleteGoalEntry = {
    id: newGoalEntry.id,
    status: newGoalEntry.status,
    dueAt: newGoalEntry.dueAt,
    userVerificationToken: null,
    partnerVerificationToken: null,

    goalId: newGoal.id,
    goalDescription: newGoal.description,
    goalStakeAmount: String(newGoal.stakeAmount),
    goalScheduleType: newGoal.scheduleType,
    goalScheduleDays: newGoal.scheduleDays ?? null,
    goalPartnerEmail: newGoal.partnerEmail,

    userEmail: sessionUser.email,
    userFirstName: sessionUser.firstName,
    userLastName: sessionUser.lastName,
    userTimezone: sessionUser.timezone,
  };

  // TODO handle email errors
  // TODO also have to send checkin emails if user is starting today and its past 12pm
  sendEmail({
    recipientEmail: sessionUser.email,
    subject: toCommitterEmailSubject(newGoal.description),
    emailHtml: await toEmailHtml(CommitterNewGoalEmail, {
      goalEntry: completeGoalEntry,
    }),
  });

  sendEmail({
    recipientEmail: reqBody.partnerEmail,
    subject: toPartnerEmailSubject(sessionUser.firstName, newGoal.description),
    emailHtml: await toEmailHtml(PartnerNewGoalEmail, {
      goalEntry: completeGoalEntry,
    }),
  });

  revalidatePath("/");
};

const CommitterVerifyReqBodySchema = z.object({
  token: z.string(),
  message: z.string().optional(),
  image: z
    .instanceof(File)
    .refine(
      (file) => {
        // Validate file type
        return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
      },
      {
        message: "File must be a valid image (JPEG, PNG, or WebP)",
      },
    )
    .refine(
      (file) => {
        // Validate file size (e.g., 3MB limit)
        return file.size <= 3 * 1024 * 1024;
      },
      {
        message: "File size must be less than 3MB",
      },
    )
    .optional(),
});

export type CommitterVerifyReqBody = z.infer<
  typeof CommitterVerifyReqBodySchema
>;

// TODO confirm whether we acutally need formdata, it might be good enough to use body
// this endpoint takes in form data instead of json to handle images
export const handleCommitterVerify = async (formData: FormData) => {
  const {
    success,
    error,
    data: reqBody,
  } = CommitterVerifyReqBodySchema.safeParse({
    token: formData.get("token"),
    message: formData.get("message"),
    image: formData.get("image"),
  });

  if (!success) {
    console.log(error.errors);
    return error.errors.map((e) => e.message).join(", ");
  }

  const goalEntries = await fetchCompleteGoalEntry({
    userVerificationToken: reqBody.token,
  });

  if (!goalEntries[0]) throw new Error("Goal entry not found");
  const goalEntry = goalEntries[0];

  if (goalEntry.status !== GoalEntryStatus.CommitterVerifying)
    throw new Error("Goal entry is not in verifying state");
  if (new Date() > new Date(goalEntry.dueAt))
    throw new Error("Goal entry is expired");

  const partnerVerifyToken = crypto.randomUUID();

  try {
    await DB.get()
      .updateTable("goalEntry")
      .set({
        partnerVerificationToken: partnerVerifyToken,
        status: GoalEntryStatus.PartnerVerifying,
        userVerifiedAt: new Date(),
      })
      .where("id", "=", goalEntry.id)
      .execute();

    await sendEmail({
      recipientEmail: goalEntry.goalPartnerEmail,
      subject: toPartnerEmailSubject(
        goalEntry.userFirstName,
        goalEntry.goalDescription,
      ),
      emailHtml: await toEmailHtml(PartnerVerifyEmail, {
        goalEntry: {
          ...goalEntry,
          partnerVerificationToken: partnerVerifyToken,
        },
        committerMessage: reqBody.message,
        hasImage: !!reqBody.image,
      }),
      attachments: reqBody.image
        ? [
            {
              Name: "evidence.jpeg",
              Content: await reqBody.image
                .arrayBuffer()
                .then((buffer) =>
                  sharp(Buffer.from(buffer))
                    .resize(800, 600, {
                      fit: "inside",
                      withoutEnlargement: true,
                    })
                    .jpeg({ quality: 80 })
                    .toBuffer(),
                )
                .then((resizedBuffer) => resizedBuffer.toString("base64")),
              ContentID: "cid:evidence@goalentry.image",
              ContentType: "image/jpeg",
            },
          ]
        : undefined,
    });
  } catch (e) {
    console.error(e);

    // TODO handle transaction better
    await DB.get()
      .updateTable("goalEntry")
      .set({
        status: GoalEntryStatus.CommitterVerifying,
        partnerVerificationToken: null,
      })
      .where("id", "=", goalEntry.id)
      .execute();

    throw e;
  }
};
