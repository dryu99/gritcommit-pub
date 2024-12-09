import { DB } from "@/database/db";
import { Goal, GoalEntry } from "@/database/db-generated-types";
import { Selectable } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";

export const TEST_USER_ID = "e09e8811-03d4-4500-83a4-2293efc79fc9";

export type GoalWithEntries = Pick<
  Selectable<Goal>,
  | "id"
  | "createdByUserId"
  | "createdAt"
  | "partnerEmail"
  | "description"
  | "scheduleType"
  | "scheduleDays"
  | "stakeAmount"
> & {
  entries: Pick<
    Selectable<GoalEntry>,
    "id" | "createdAt" | "status" | "dueAt"
  >[];
};

export const fetchGoals = async (
  userId: string,
): Promise<GoalWithEntries[]> => {
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
      "goal.stakeAmount",
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
          .orderBy("goalEntry.createdAt", "desc"),
      ).as("entries"),
    ])
    .where("goal.createdByUserId", "=", userId)
    .orderBy("goal.createdAt", "desc")
    .execute();

  return goals;
};
