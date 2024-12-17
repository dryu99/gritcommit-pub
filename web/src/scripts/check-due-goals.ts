import { toNextRecurringDueDate } from "@/lib/date";
import {
  sendEmail,
  toCommitterEmailSubject,
  toEmailHtml,
} from "@/lib/email/email.lib";
import CommitterVerifyEmail from "@/lib/email/templates/committer-verify-email";
import { generateModelId } from "@/lib/generate-model-id";
import {
  fetchCompleteGoalEntry,
  isGoalEntryDueToday,
  isGoalEntryPartnerVerificationExpired,
} from "@/lib/goals/goal.lib";
import { GoalEntryStatus } from "@/types/enums";
import { DB } from "../database/db";

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

/**
 * This job runs every hour i.e. runs every 12PM somewhere in the world
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

  console.log("Done checking due today goals");
  process.exit(0);
};

main();
