import { toNextRecurringDueDate } from "@/lib/date";
import {
  sendEmail,
  toCommitterEmailSubject,
  toEmailHtml,
} from "@/lib/email/email.lib";
import CommitterFailEmail from "@/lib/email/templates/committer-fail-email";
import { generateModelId } from "@/lib/generate-model-id";
import {
  fetchCompleteGoalEntry,
  toExpiredGoalEntries,
} from "@/lib/goals/goal.lib";
import { GoalEntryStatus } from "@/types/enums";
import { DB } from "../database/db";

// this job runs every hour i.e. runs every MIDNIGHT somewhere in the world
const main = async () => {
  console.log("Checking expired goals START: ", new Date().toISOString());
  const pendingGoalEntries = await fetchCompleteGoalEntry({
    status: GoalEntryStatus.CommitterVerifying,
  });

  const expiredGoalEntries = toExpiredGoalEntries(pendingGoalEntries);
  console.log("Expired goal entries:", expiredGoalEntries.length);

  for (const goalEntry of expiredGoalEntries) {
    console.log("Processing goal entry:", {
      description: goalEntry.goalDescription,
      dueAt: goalEntry.dueAt,
      userEmail: goalEntry.userEmail,
      partnerEmail: goalEntry.goalPartnerEmail,
    });

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
        emailHtml: await toEmailHtml(CommitterFailEmail, {
          goalEntry,
        }),
      });
    } catch (error) {
      // TODO sentry
      console.error(`Failed to process goal entry ${goalEntry.id}:`, error);
    }
  }

  console.log("Done checking expired goal entries");
  process.exit(0);
};

main();
