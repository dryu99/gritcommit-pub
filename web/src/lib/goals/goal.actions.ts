"use server";

import { Config } from "@/lib/config";
import { generateModelId } from "@/lib/generate-model-id";
import { GoalEntryStatus, ScheduleType } from "@/types/enums";
import { Insertable } from "kysely";
import { revalidatePath } from "next/cache";

import { z } from "zod";
import { DB } from "../../database/db";
import { Goal, GoalEntry } from "../../database/db-generated-types";
import { getSessionUser } from "../auth";
import { sendGoalStartedEmail } from "../email.service";

const CreateGoalReqBodySchema = z.object({
  description: z.string().min(1),
  stakeAmount: z.coerce.number().min(0),
  partnerEmail: z.string().email(),
  timezone: z.string(),
  startToday: z.boolean().optional(),

  // existence implies scheduleType = RECURRING
  scheduleDays: z.array(z.number()).optional(), // assume sorted

  // existence implies scheduleType = SINGLE
  dueDate: z.coerce.date().optional(),
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

  // TODO also have to send email if user is starting today and its past 12pm
  await DB.get()
    .transaction()
    .execute(async (trx) => {
      await trx.insertInto("goal").values(newGoal).execute();
      await trx.insertInto("goalEntry").values(newGoalEntry).execute();
    });

  revalidatePath("/");

  await sendGoalStartedEmail({
    goal: newGoal,
    nextDueDate,
    user: sessionUser,
  });
};

const calculateNextDueDate = (rawGoal: CreateGoalReqBody): Date => {
  // handle SINGLE
  if (rawGoal.dueDate) {
    const nextDueDate = new Date(
      rawGoal.dueDate.toLocaleString("en-US", { timeZone: rawGoal.timezone }),
    );
    nextDueDate.setHours(23, 59, 0, 0);
    return nextDueDate;
  }

  // handle RECURRING
  const todayInClientTZ = new Date(
    new Date().toLocaleString("en-US", { timeZone: rawGoal.timezone }),
  );
  todayInClientTZ.setHours(23, 59, 0, 0);
  if (rawGoal.startToday) {
    return todayInClientTZ;
  }

  if (rawGoal.scheduleDays) {
    const todayDay = todayInClientTZ.getDay();

    for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
      const checkDay = (todayDay + daysAhead) % 7;
      if (rawGoal.scheduleDays.includes(checkDay)) {
        const nextDueDate = new Date(todayInClientTZ);
        nextDueDate.setDate(todayInClientTZ.getDate() + daysAhead);
        return nextDueDate;
      }
    }
  }

  throw new Error("Next due date could not be calculated");
};
