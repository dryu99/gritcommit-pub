"use server";

import { Insertable } from "kysely";
import { z } from "zod";
import { DB } from "../database/db";
import { Goal } from "../database/db-generated-types";

const TEST_USER_ID = "143c8754-b7c8-4502-bd10-02464a4941ed";

const GoalSchema = z.object({
  description: z.string().min(1),
  stakeAmount: z.coerce.number().min(0),
  dueDate: z.coerce.date(),
});

export const createGoal = async (
  prevState: string | undefined,
  formData: FormData
) => {
  const rawFormData = {
    ...Object.fromEntries(formData),
  };

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
    dueDate: parsedGoal.data.dueDate,
  };

  console.log(goal);

  await DB.getDb().insertInto("goal").values(goal).execute();
};
