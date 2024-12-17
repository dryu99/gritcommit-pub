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
  toExpiredPartnerVerificationDeadlineEntries,
} from "@/lib/goals/goal.lib";
import { GoalEntryStatus } from "@/types/enums";
import { DB } from "../database/db";

// this job runs every hour i.e. runs every 12PM somewhere in the world
const main = async () => {
  console.log("Checking due goals START: ", new Date().toISOString());

  /**
   * Check for goal entries with status PARTNER_VERIFYING
   *
   * at this point, partner missed the deadline to verify
   * - automatically approve the goal entry (set status). if recurring, create the next goal entry
   * - send email to partner saying they missed the due date? (maybe in the partner-verify email to avoid fatigue)
   *  - we can do a null check on partnerVerifiedAt
   * - in committer verify email, add condition to say (your partner missed the deadline to verify so we auto verified you)
   */
  console.log("Checking for expired partner verifications");
  const entriesAwaitingPartnerVerification = await fetchCompleteGoalEntry({
    status: GoalEntryStatus.PartnerVerifying,
  });

  const entriesWithExpiredPartnerDeadline =
    toExpiredPartnerVerificationDeadlineEntries(
      entriesAwaitingPartnerVerification,
    );

  for (const goalEntry of entriesWithExpiredPartnerDeadline) {
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
      console.error(`Failed to process goal entry ${goalEntry.id}:`, error);
    }
  }

  /**
   * Check for goals that are due today
   * - set status to COMMITTER_VERIFYING
   * - send email
   */
  console.log("Checking for goals due today");
  const pendingGoalEntries = await fetchCompleteGoalEntry({
    status: GoalEntryStatus.Pending,
  });

  // TODO does this timezone logic make sense... lets say we were running script in another server
  // TODO figure out how to do this filter in sql
  const dueTodayGoalEntries = pendingGoalEntries.filter((goalEntry) => {
    const entryDueDate = new Date(goalEntry.dueAt);
    return entryDueDate.getDate() === new Date().getDate();
  });

  console.log("Due today goal entries:", dueTodayGoalEntries.length);

  for (const goalEntry of dueTodayGoalEntries) {
    console.log("Processing goal entry:", {
      description: goalEntry.goalDescription,
      dueAt: goalEntry.dueAt,
      userEmail: goalEntry.userEmail,
      partnerEmail: goalEntry.goalPartnerEmail,
    });
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
      console.error(`Failed to process goal entry ${goalEntry.id}:`, error);

      // TODO sentry
      // revert goalEntry update from before
      await DB.get()
        .updateTable("goalEntry")
        .set({
          status: GoalEntryStatus.Pending,
          userVerificationToken: null,
        })
        .where("id", "=", goalEntry.id)
        .execute();
    }
  }

  console.log("Done checking due today goals");
  process.exit(0);
};

main();
