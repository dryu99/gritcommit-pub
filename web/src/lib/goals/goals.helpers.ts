import { DB } from "@/database/db";
import { jsonArrayFrom } from "kysely/helpers/postgres";

export const TEST_USER_ID = "e09e8811-03d4-4500-83a4-2293efc79fc9";

export const fetchGoals = async () => {
  const goals = await DB.get()
    .selectFrom("goal")
    .select((eb) => [
      "goal.id",
      "goal.createdByUserId",
      "goal.createdAt",
      "goal.partnerEmail",
      "goal.description",
      "goal.scheduleType",
      "goal.scheduleDays",
      jsonArrayFrom(
        eb
          .selectFrom("goalEntry")
          .select([
            "goalEntry.id",
            "goalEntry.createdAt",
            "goalEntry.status",
            "goalEntry.dueAt",
          ])
          .whereRef("goal.id", "=", "goalEntry.goalId")
          .orderBy("goalEntry.createdAt", "desc")
      ).as("entries"),
    ])
    .where("goal.createdByUserId", "=", TEST_USER_ID)
    .orderBy("goal.createdAt", "desc")
    .execute();

  return goals;
};
