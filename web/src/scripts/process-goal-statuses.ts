import {
  canSendGoalEntryDueTodayEmail,
  fetchCompleteGoalEntry,
  finalizeGoalEntry,
  isGoalEntryExpired,
  isGoalEntryPartnerVerificationExpired,
} from "@/lib/goals/goal.lib";
import { NotificationManager } from "@/lib/notifications/notification-manager";
import { GoalEntryStatus } from "@/types/enums";
import { DB } from "../database/db";

// TODO add logging

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
      await finalizeGoalEntry(goalEntry, GoalEntryStatus.Completed);
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

  const dueTodayGoalEntries = pendingGoalEntries.filter(
    canSendGoalEntryDueTodayEmail,
  );

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

      await NotificationManager.sendCommitterVerify(
        "email",
        goalEntry,
        newVerificationToken,
      );
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
      await finalizeGoalEntry(goalEntry, GoalEntryStatus.Failed);

      // TODO can remove await maybe
      await Promise.all([
        NotificationManager.sendCommitterFail("email", goalEntry),
        NotificationManager.sendPartnerFail("email", goalEntry),
      ]);
    } catch (error) {
      // TODO sentry
      console.error(`> Failed to process expired goal ${goalEntry.id}:`, error);
    }
  }
};

/**
 * This job runs every hour.
 *
 * Order of operations here is important. Mainly partner_expiry_check has to come before due_goals_check.
 * This is because partner_expiry_check can produce new goal entries which might be due today (and we want to send an email for).
 *
 * goal_expiry_check order shouldn't matter as much. even though due_goals_check can set status to COMMITTER_VERIFYING,
 * the goal shouldn't be expired yet and won't be processed by goal_expiry_check
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
