import { DB } from "@/database/db";
import { Goal, GoalEntry, User } from "@/database/db-generated-types";
import { GoalEntryStatus, ScheduleType } from "@/types/enums";
import { Selectable } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { DateUtils } from "../date";

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
  userVerificationToken: Selectable<GoalEntry>["userVerificationToken"];
  partnerVerificationToken: Selectable<GoalEntry>["partnerVerificationToken"];

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
  userTimezone: Selectable<User>["timezone"];
};

export const fetchCompleteGoalEntry = async ({
  partnerVerificationToken,
  userVerificationToken,
  status,
}: {
  partnerVerificationToken?: string;
  userVerificationToken?: string;
  status?: GoalEntryStatus;
}): Promise<CompleteGoalEntry[]> => {
  return DB.get()
    .selectFrom("goalEntry")
    .innerJoin("goal", "goal.id", "goalEntry.goalId")
    .innerJoin("user", "user.id", "goal.createdByUserId")
    .select([
      "goalEntry.status",
      "goalEntry.dueAt",
      "goalEntry.id",
      "goalEntry.userVerificationToken",
      "goalEntry.partnerVerificationToken",

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
      "user.timezone as userTimezone",
    ])
    .$if(!!status, (eb) =>
      eb.where("goalEntry.status", "=", status as GoalEntryStatus),
    )
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

export const mockCompleteGoalEntry: CompleteGoalEntry = {
  dueAt: new Date("12/20/2024 23:59:59"),
  id: "1",
  status: GoalEntryStatus.Completed,
  userVerificationToken: "1234567890",
  partnerVerificationToken: "1234567890",

  goalId: "1",
  goalDescription: "Run a marathon",
  goalStakeAmount: "100",
  goalScheduleType: ScheduleType.Recurring,
  goalPartnerEmail: "partner@gmail.com",
  goalScheduleDays: [1, 2, 3, 4, 5],

  userEmail: "committer@gmail.com",
  userFirstName: "John",
  userLastName: "Doe",
  userTimezone: "America/Los_Angeles",
};

// recently expired = current time is past the due date by at most 1 hour
// we do 1 hour check to account for timezones
// e.g. it's 12am EST and we want to send email to those due dates that was due at 11:59pm EST
//      we don't want to send emails for people who's goals were due at 11:59pm PST (which is 8:59pm PST)
export const toRecentlyExpiredGoalEntries = (
  goalEntries: CompleteGoalEntry[],
) => {
  return goalEntries.filter((goalEntry) => {
    const userTimezone = goalEntry.userTimezone;
    const now = DateUtils.dayjs().tz(userTimezone);
    const oneHourAgo = now.subtract(1, "hour");

    const dueDate = DateUtils.dayjs.tz(goalEntry.dueAt, userTimezone);

    return dueDate.isAfter(oneHourAgo) && dueDate.isBefore(now);
  });
};
