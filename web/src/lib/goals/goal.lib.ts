import { DB } from "@/database/db";
import { Goal, GoalEntry, User } from "@/database/db-generated-types";
import { GoalEntryStatus, ScheduleType } from "@/types/enums";
import { Selectable } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import {
  DateUtils,
  toNextRecurringDueDate,
  toPartnerVerificationDeadline,
} from "../date";
import { generateModelId } from "../generate-model-id";

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
          .orderBy("goalEntry.dueAt", "desc"),
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
  partnerVerifiedAt: Selectable<GoalEntry>["partnerVerifiedAt"];
  userVerifiedAt: Selectable<GoalEntry>["userVerifiedAt"];
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
      "goalEntry.partnerVerifiedAt",
      "goalEntry.userVerifiedAt",

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
  partnerVerifiedAt: new Date("12/20/2024 16:00:00"),
  userVerifiedAt: new Date("12/20/2024 14:00:00"),

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

// TODO it should be okay these dont use timezones (we're just comparing whether date comes before) but double check
// TODO i think we can prob just consume a safedate + move this to date file
export const isGoalEntryExpired = (goalEntry: CompleteGoalEntry) => {
  const now = DateUtils.dayjs();
  const dueDate = DateUtils.dayjs(goalEntry.dueAt);
  return dueDate.isBefore(now);
};

export const isGoalEntryPartnerVerificationExpired = (
  goalEntry: CompleteGoalEntry,
) => {
  const now = DateUtils.dayjs();
  const partnerVerifyDueDate = DateUtils.dayjs(
    toPartnerVerificationDeadline(goalEntry.dueAt),
  );

  return partnerVerifyDueDate.isBefore(now);
};

export const canSendGoalEntryDueTodayEmail = (goalEntry: CompleteGoalEntry) => {
  const now = DateUtils.dayjs().tz(goalEntry.userTimezone);
  if (now.hour() !== 12) return false; // only send if its 12pm in users timezone

  const dueDate = DateUtils.dayjs.tz(goalEntry.dueAt, goalEntry.userTimezone);
  return dueDate.format("YYYY-MM-DD") === now.format("YYYY-MM-DD");
};

/**
 * This function does 2 things:
 * - updates status of goal entry
 * - creates new goal entry for recurring entries
 */
export async function finalizeGoalEntry(
  goalEntry: CompleteGoalEntry,
  newStatus: GoalEntryStatus,
) {
  await DB.get()
    .transaction()
    .execute(async (trx) => {
      // Update existing goal entry
      await trx
        .updateTable("goalEntry")
        .set({
          status: newStatus,
        })
        .where("id", "=", goalEntry.id)
        .execute();

      // Create next recurring entry if applicable
      if (
        goalEntry.goalScheduleType === "RECURRING" &&
        goalEntry.goalScheduleDays
      ) {
        await trx
          .insertInto("goalEntry")
          .values({
            id: generateModelId(),
            status: GoalEntryStatus.Pending,
            goalId: goalEntry.goalId,
            dueAt: toNextRecurringDueDate({
              timezone: goalEntry.userTimezone,
              scheduleDays: goalEntry.goalScheduleDays,
              prevDueDate: goalEntry.dueAt,
            }),
          })
          .execute();
      }
    });
}
