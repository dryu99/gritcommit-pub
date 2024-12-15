import { DB } from "@/database/db";
import { Goal, GoalEntry, User } from "@/database/db-generated-types";
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

export type CompleteGoalEntry = {
  // goal entry
  id: Selectable<GoalEntry>["id"];
  status: Selectable<GoalEntry>["status"];
  dueAt: Selectable<GoalEntry>["dueAt"];

  // goal
  goalId: Selectable<Goal>["id"];
  // goalCreatedAt: Selectable<Goal>["createdAt"];
  goalDescription: Selectable<Goal>["description"];
  goalStakeAmount: Selectable<Goal>["stakeAmount"];
  goalScheduleType: Selectable<Goal>["scheduleType"];
  goalScheduleDays: Selectable<Goal>["scheduleDays"];
  goalPartnerEmail: Selectable<Goal>["partnerEmail"];

  // user
  userEmail: Selectable<User>["email"];
  userFirstName: Selectable<User>["firstName"];
  userLastName: Selectable<User>["lastName"];
};

export const fetchCompleteGoalEntry = async ({
  partnerVerificationToken,
  userVerificationToken,
}: {
  partnerVerificationToken?: string;
  userVerificationToken?: string;
}): Promise<CompleteGoalEntry[]> => {
  return DB.get()
    .selectFrom("goalEntry")
    .innerJoin("goal", "goal.id", "goalEntry.goalId")
    .innerJoin("user", "user.id", "goal.createdByUserId")
    .select([
      "goalEntry.status",
      "goalEntry.dueAt",
      "goalEntry.id",

      "goal.id as goalId",
      "goal.partnerEmail as goalPartnerEmail",
      "goal.scheduleDays as goalScheduleDays",
      "goal.scheduleType as goalScheduleType",
      "goal.stakeAmount as goalStakeAmount",
      "goal.description as goalDescription",
      "goal.createdAt as goalCreatedAt",

      "user.email as userEmail",
      "user.firstName as userFirstName",
      "user.lastName as userLastName",
    ])
    .$if(!!partnerVerificationToken, (eb) =>
      eb.where(
        "partnerVerificationToken",
        "=",
        partnerVerificationToken as string,
      ),
    )
    .$if(!!userVerificationToken, (eb) =>
      eb.where("userVerificationToken", "=", userVerificationToken as string),
    )
    .execute();
};
