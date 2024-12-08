import { DB } from "@/database/db";

export const TEST_USER_ID = "e09e8811-03d4-4500-83a4-2293efc79fc9";

export const fetchGoals = async () => {
  const goals = await DB.get()
    .selectFrom("goal")
    .selectAll()
    .where("goal.createdByUserId", "=", TEST_USER_ID)
    .execute();

  return goals;
};
