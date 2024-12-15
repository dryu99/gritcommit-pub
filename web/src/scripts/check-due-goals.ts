import {
  sendEmail,
  toCommitterEmailSubject,
  toEmailHtml,
} from "@/lib/email/email.lib";
import CommitterVerifyEmail from "@/lib/email/templates/committer-verify-email";
import { fetchCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { GoalEntryStatus } from "@/types/enums";
import { DB } from "../database/db";

// TODO figure out how this should work across timezones. run multiple times?
// this job runs everyday at 8am PST
const main = async () => {
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

      // TODO handle this error better?
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
