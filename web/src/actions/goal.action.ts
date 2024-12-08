"use server";

import { generateModelId } from "@/lib/generate-model-id";
import { FrequencyType, ScheduleType } from "@/types/enums";
import { Insertable } from "kysely";
import { z } from "zod";
import { DB } from "../database/db";
import { Goal } from "../database/db-generated-types";

const TEST_USER_ID = "e09e8811-03d4-4500-83a4-2293efc79fc9";

const frequencyTypeSchema = z.nativeEnum(FrequencyType);

const RawGoalSchema = z.object({
  description: z.string().min(1),
  stakeAmount: z.coerce.number().min(0),
  partnerEmail: z.string().email(),
  startToday: z.boolean().optional(),

  // existence of these implies scheduleType = RECURRING
  frequencyType: frequencyTypeSchema.optional(),
  scheduleDays: z.array(z.number()).optional(), // assume sorted

  // existence of this implies scheduleType = SINGLE
  dueDate: z.coerce.date().optional(),
});

export type RawGoal = z.infer<typeof RawGoalSchema>;

export const createGoal = async (data: any) => {
  const { success, error, data: rawGoal } = RawGoalSchema.safeParse(data);
  if (!success) {
    console.log(error.errors);
    return error.errors.map((e) => e.message).join(", ");
  }

  const goal: Insertable<Goal> = {
    id: generateModelId(),
    createdByUserId: TEST_USER_ID, // TODO: get user id from session
    description: rawGoal.description,
    stakeAmount: rawGoal.stakeAmount,
    partnerEmail: rawGoal.partnerEmail,
    scheduleType: rawGoal.dueDate
      ? ScheduleType.Single
      : ScheduleType.Recurring,
    scheduleDays:
      rawGoal.frequencyType === FrequencyType.CustomDays
        ? rawGoal.scheduleDays
        : rawGoal.frequencyType === FrequencyType.Daily
        ? [0, 1, 2, 3, 4, 5, 6]
        : null,
  };

  // const firstGoalEntry: Insertable<GoalEntry> = {
  //   id: generateModelId(),
  //   goalId: goal.id,
  //   dueAt: goal.scheduleType === ScheduleType.Single ? rawGoal.dueDate : null,
  //   status: GoalEntryStatus.Pending,
  // };

  DB.get().insertInto("goal").values(goal).execute();
};

const calculateNextDueDate = (rawGoal: RawGoal): Date => {
  if (rawGoal.dueDate) {
    return rawGoal.dueDate;
  }

  const today = new Date(new Date().setHours(23, 59, 0, 0));
  if (rawGoal.startToday) {
    return today;
  }

  if (rawGoal.scheduleDays) {
    const todayDay = today.getDay();
    let currDay = (todayDay + 1) % 7;
    let incCount = 0;
    while (incCount < 7) {
      if (rawGoal.scheduleDays.includes(currDay)) {
        const nextDueDate = new Date(today.setDate(today.getDate() + incCount));
        return nextDueDate;
      }

      currDay = (currDay + 1) % 7;
      incCount++;
    }
  }

  throw new Error("Next due date could not be calculated");
};
