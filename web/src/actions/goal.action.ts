"use server";

import { FrequencyType, ScheduleType } from "@/types/enums";
import { Insertable } from "kysely";
import { z } from "zod";
import { DB } from "../database/db";
import { Goal } from "../database/db-generated-types";

const TEST_USER_ID = "e09e8811-03d4-4500-83a4-2293efc79fc9";

const frequencyTypeSchema = z.nativeEnum(FrequencyType);

const GoalSchema = z.object({
  description: z.string().min(1),
  stakeAmount: z.coerce.number().min(0),
  partnerEmail: z.string().email(),
  frequencyType: frequencyTypeSchema.optional(),
  scheduleDays: z.array(z.number()).optional(),
  dueDate: z.coerce.date().optional(),
});

export const createGoal = async (formData: FormData) => {
  const rawFormData = { ...Object.fromEntries(formData) };

  const parsedGoal = GoalSchema.safeParse(rawFormData);
  if (!parsedGoal.success) {
    console.log(parsedGoal.error.errors);
    return parsedGoal.error.errors.map((e) => e.message).join(", ");
  }

  const goal: Insertable<Goal> = {
    id: crypto.randomUUID(),
    createdByUserId: TEST_USER_ID, // TODO: get user id from session
    description: parsedGoal.data.description,
    stakeAmount: parsedGoal.data.stakeAmount,
    partnerEmail: parsedGoal.data.partnerEmail,
    scheduleType: ScheduleType.Single,
  };

  DB.get().insertInto("goal").values(goal).execute();
};
