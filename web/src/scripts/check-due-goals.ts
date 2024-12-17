import { toNextRecurringDueDate } from "@/lib/date";
import {
  sendEmail,
  toCommitterEmailSubject,
  toEmailHtml,
} from "@/lib/email/email.lib";
import CommitterFailEmail from "@/lib/email/templates/committer-fail-email";
import CommitterVerifyEmail from "@/lib/email/templates/committer-verify-email";
import { generateModelId } from "@/lib/generate-model-id";
import {
  fetchCompleteGoalEntry,
  isGoalEntryDueToday,
  isGoalEntryExpired,
  isGoalEntryPartnerVerificationExpired,
} from "@/lib/goals/goal.lib";
import { GoalEntryStatus } from "@/types/enums";
import { DB } from "../database/db";

// PARTNER_VERIFYING -> COMPLETED + PENDING(recurring)
async function processExpiredPartnerVerifications() {
  console.log("Checking for expired partner verifications");
  const partnerVerifyingEntries = await fetchCompleteGoalEntry({
    status: GoalEntryStatus.PartnerVerifying,
  });

  const expiredPartnerVerifyingEntries = partnerVerifyingEntries.filter(
    isGoalEntryPartnerVerificationExpired,
  );

  console.log("Entries to process:", expiredPartnerVerifyingEntries.length);

  for (const goalEntry of expiredPartnerVerifyingEntries) {
    console.log("> Processing expired partner verification:", goalEntry.id);
    try {
      await DB.get()
        .transaction()
        .execute(async (trx) => {
          // Update existing goal entry
          await DB.get()
            .updateTable("goalEntry")
            .set({
              status: GoalEntryStatus.Completed,
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
    } catch (error) {
      // TODO sentry
      console.error(
        `> Failed to process expired partner verification ${goalEntry.id}:`,
        error,
      );
    }
  }
}

// PENDING -> COMMITTER_VERIFYING
async function processGoalsDueToday() {
  console.log("Checking for goals due today");
  const pendingGoalEntries = await fetchCompleteGoalEntry({
    status: GoalEntryStatus.Pending,
  });

  const dueTodayGoalEntries = pendingGoalEntries.filter(isGoalEntryDueToday);

  console.log("Entries to process:", dueTodayGoalEntries.length);
  for (const goalEntry of dueTodayGoalEntries) {
    console.log("> Processing goal entry:", goalEntry.id);

    try {
      const newVerificationToken = crypto.randomUUID();

      await DB.get()
        .updateTable("goalEntry")
        .set({
          userVerificationToken: newVerificationToken,
          status: GoalEntryStatus.CommitterVerifying,
        })
        .where("id", "=", goalEntry.id)
        .execute();

      await sendEmail({
        recipientEmail: goalEntry.userEmail,
        subject: toCommitterEmailSubject(goalEntry.goalDescription),
        emailHtml: await toEmailHtml(CommitterVerifyEmail, {
          goalEntry: {
            ...goalEntry,
            userVerificationToken: newVerificationToken,
          },
        }),
      });
    } catch (error) {
      console.error(`> Failed to process goal entry ${goalEntry.id}:`, error);
      // TODO sentry
    }
  }
}

// COMMITTER_VERIFYING -> FAILED + PENDING(recurring)
const processExpiredGoals = async () => {
  console.log("Checking for expired goals");
  const pendingGoalEntries = await fetchCompleteGoalEntry({
    status: GoalEntryStatus.CommitterVerifying,
  });

  const expiredGoalEntries = pendingGoalEntries.filter(isGoalEntryExpired);
  console.log("Entries to process:", expiredGoalEntries.length);

  for (const goalEntry of expiredGoalEntries) {
    console.log("> Processing goal entry:", goalEntry.id);

    try {
      await DB.get()
        .transaction()
        .execute(async (trx) => {
          // Update existing goal entry
          await DB.get()
            .updateTable("goalEntry")
            .set({
              status: GoalEntryStatus.Failed,
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

      // TODO can remove await maybe
      await sendEmail({
        recipientEmail: goalEntry.userEmail,
        subject: toCommitterEmailSubject(goalEntry.goalDescription),
        emailHtml: await toEmailHtml(CommitterFailEmail, { goalEntry }),
      });
    } catch (error) {
      // TODO sentry
      console.error(`> Failed to process expired goal ${goalEntry.id}:`, error);
    }
  }
};

/**
 * This job runs every hour i.e. runs every 12PM or MIDNIGHT somewhere in the world
 */
const main = async () => {
  console.log("Checking due goals START: ", new Date().toISOString());

  // TODO add error handling

  /**
   * Check for goal entries with status PARTNER_VERIFYING
   *
   * At this point, partner missed the deadline to verify
   * - automatically approve the goal entry (set status). if recurring, create the next goal entry
   * - send email to partner saying they missed the due date? (maybe in the partner-verify email to avoid fatigue)
   *  - we can do a null check on partnerVerifiedAt
   * - in committer verify email, add condition to say (your partner missed the deadline to verify so we auto verified you)
   */
  await processExpiredPartnerVerifications();

  /**
   * Check for goals that are due today
   * - set status to COMMITTER_VERIFYING
   * - send email
   */
  await processGoalsDueToday();

  // TODO confirm that order is okay
  /**
   * Check for goals that are expired
   * - set status to FAILED
   * - send email
   * - if recurring, create the next goal entry
   */
  await processExpiredGoals();

  console.log("Done checking due today goals");
  process.exit(0);
};

main();
