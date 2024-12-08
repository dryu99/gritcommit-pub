"use server";

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
  frequencyType: frequencyTypeSchema.optional(),
  scheduleDays: z.array(z.number()).optional(),
  dueDate: z.coerce.date().optional(),
  startToday: z.boolean().optional(),
});

export type RawGoal = z.infer<typeof RawGoalSchema>;

export const createGoal = async (data: any) => {
  const { success, error, data: rawGoal } = RawGoalSchema.safeParse(data);
  if (!success) {
    console.log(error.errors);
    return error.errors.map((e) => e.message).join(", ");
  }

  const goal: Insertable<Goal> = {
    id: crypto.randomUUID(),
    createdByUserId: TEST_USER_ID, // TODO: get user id from session
    description: rawGoal.description,
    stakeAmount: rawGoal.stakeAmount,
    partnerEmail: rawGoal.partnerEmail,
    scheduleType: ScheduleType.Single,
    scheduleDays:
      rawGoal.frequencyType === FrequencyType.CustomDays
        ? rawGoal.scheduleDays
        : rawGoal.frequencyType === FrequencyType.Daily
        ? [0, 1, 2, 3, 4, 5, 6]
        : null,
  };

  DB.get().insertInto("goal").values(goal).execute();
};
