"use server";

import { Config } from "@/lib/config";
import { generateModelId } from "@/lib/generate-model-id";
import { TEST_USER_ID } from "@/lib/goals/goals.helpers";
import { GoalEntryStatus, ScheduleType } from "@/types/enums";
import { Insertable } from "kysely";
import { z } from "zod";
import { DB } from "../database/db";
import { Goal, GoalEntry } from "../database/db-generated-types";

const RawGoalSchema = z.object({
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

export type RawGoal = z.infer<typeof RawGoalSchema>;

// TODO do auth check
export const createGoal = async (data: any) => {
  const { success, error, data: rawGoal } = RawGoalSchema.safeParse(data);
  if (!success) {
    console.log(error.errors);
    return error.errors.map((e) => e.message).join(", ");
  }

  // TODO validate that scheudlDays.length > 0 if CustomDays === true

  const goal: Insertable<Goal> = {
    id: generateModelId(),
    createdByUserId: TEST_USER_ID, // TODO: get user id from session
    description: rawGoal.description,
    stakeAmount: rawGoal.stakeAmount,
    partnerEmail: rawGoal.partnerEmail,
    scheduleType: rawGoal.dueDate // TODO consider passing schedule type from client. this feels prone to bugs
      ? ScheduleType.Once
      : ScheduleType.Recurring,
    scheduleDays: rawGoal.scheduleDays
      ? [...rawGoal.scheduleDays].sort((a, b) => a - b)
      : null,
  };

  const nextDueDate = calculateNextDueDate(rawGoal);

  const goalEntry: Insertable<GoalEntry> = {
    id: generateModelId(),
    goalId: goal.id,
    dueAt: nextDueDate,
    status: GoalEntryStatus.Pending,
  };

  if (Config.NODE_ENV === "development") {
    console.log("CREATE_GOAL");
    console.log("rawGoal", rawGoal);
    console.log("goal", goal);
    console.log("firstGoalEntry", goalEntry);
  }

  // TODO also have to send email if user is starting today and its past 12pm
  DB.get()
    .transaction()
    .execute(async (trx) => {
      await trx.insertInto("goal").values(goal).execute();
      await trx.insertInto("goalEntry").values(goalEntry).execute();
    });
};

const calculateNextDueDate = (rawGoal: RawGoal): Date => {
  // handle SINGLE
  if (rawGoal.dueDate) {
    const nextDueDate = new Date(
      rawGoal.dueDate.toLocaleString("en-US", { timeZone: rawGoal.timezone })
    );
    nextDueDate.setHours(23, 59, 0, 0);
    return nextDueDate;
  }

  // handle RECURRING
  const todayInClientTZ = new Date(
    new Date().toLocaleString("en-US", { timeZone: rawGoal.timezone })
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
