"use server";

import { Config } from "@/lib/config";
import { generateModelId } from "@/lib/generate-model-id";
import { GoalEntryStatus, ScheduleType } from "@/types/enums";
import { Insertable } from "kysely";
import { revalidatePath } from "next/cache";

import { z } from "zod";
import { DB } from "../../database/db";
import { Goal, GoalEntry } from "../../database/db-generated-types";
import { getSessionUser } from "../auth/auth.lib";
import { DateUtils } from "../date";
import { sendEmail, toEmailHtml } from "../email/email.lib";
import OwnerNewGoalEmail from "../email/templates/owner-new-goal-email";
import PartnerNewGoalEmail from "../email/templates/partner-new-goal-email";

const CreateGoalReqBodySchema = z.object({
  description: z.string().min(1),
  stakeAmount: z.coerce.number().min(0),
  partnerEmail: z.string().email(),
  timezone: z.string(),
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

  const nextDueDate = calculateNextDueDate(reqBody);
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

  // TODO handle email errors
  // TODO also have to send checkin emails if user is starting today and its past 12pm
  const emailDescription =
    newGoal.description.length > 50
      ? newGoal.description.slice(0, 47) + "..."
      : newGoal.description;

  sendEmail({
    recipientEmail: sessionUser.email,
    subject: `Your new commitment: "${emailDescription}"`,
    emailHtml: await toEmailHtml(OwnerNewGoalEmail, {
      ownerUser: sessionUser,
      goal: newGoal,
      nextDueDate: nextDueDate,
    }),
  });

  sendEmail({
    recipientEmail: reqBody.partnerEmail,
    subject: `${sessionUser.firstName} wants you to keep them accountable for "${emailDescription}"`,
    emailHtml: await toEmailHtml(PartnerNewGoalEmail, {
      ownerUser: sessionUser,
      goal: newGoal,
      nextDueDate: nextDueDate,
    }),
  });

  revalidatePath("/");
};

const calculateNextDueDate = (rawGoal: CreateGoalReqBody): Date => {
  // handle ONCE
  if (rawGoal.dueDate) {
    return DateUtils.dayjs(rawGoal.dueDate)
      .tz(rawGoal.timezone)
      .endOf("day")
      .toDate();
  }

  // handle RECURRING
  const clientToday = DateUtils.dayjs().tz(rawGoal.timezone);
  if (rawGoal.startToday) {
    return clientToday.endOf("day").toDate();
  }

  if (rawGoal.scheduleDays) {
    const todayDay = clientToday.day();

    for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
      const checkDay = (todayDay + daysAhead) % 7;
      if (rawGoal.scheduleDays.includes(checkDay)) {
        return clientToday.add(daysAhead, "day").endOf("day").toDate();
      }
    }
  }

  throw new Error("Next due date could not be calculated");
};
