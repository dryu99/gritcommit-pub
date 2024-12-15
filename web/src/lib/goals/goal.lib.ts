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

export type GoalNotificationContext = {
  goalEntry: Pick<Selectable<GoalEntry>, "status" | "dueAt" | "id">;
  goal: Pick<
    Selectable<Goal>,
    | "id"
    | "createdAt"
    | "description"
    | "stakeAmount"
    | "scheduleType"
    | "scheduleDays"
    | "partnerEmail"
  >;
  user: Pick<Selectable<User>, "email" | "firstName" | "lastName">;
};

export const fetchGoalNotificationContexts = async ({
  partnerVerificationToken,
  userVerificationToken,
}: {
  partnerVerificationToken?: string;
  userVerificationToken?: string;
}): Promise<GoalNotificationContext[]> => {
  const items = await DB.get()
    .selectFrom("goalEntry")
    .innerJoin("goal", "goal.id", "goalEntry.goalId")
    .innerJoin("user", "user.id", "goal.createdByUserId")
    .select([
      "goalEntry.status as goalEntryStatus",
      "goalEntry.dueAt as goalEntryDueAt",
      "goalEntry.id as goalEntryId",

      "goal.id as goalId",
      "goal.partnerEmail",
      "goal.scheduleDays",
      "goal.scheduleType",
      "goal.stakeAmount",
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

  return items.map((item) => ({
    goalEntry: {
      status: item.goalEntryStatus,
      dueAt: item.goalEntryDueAt,
      id: item.goalEntryId,
    },
    goal: {
      id: item.goalId,
      description: item.goalDescription,
      stakeAmount: item.stakeAmount,
      scheduleType: item.scheduleType,
      scheduleDays: item.scheduleDays,
      partnerEmail: item.partnerEmail,
      createdAt: item.goalCreatedAt,
    },
    user: {
      email: item.userEmail,
      firstName: item.userFirstName,
      lastName: item.userLastName,
    },
  }));
};
