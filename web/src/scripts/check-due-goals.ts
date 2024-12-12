import {
  sendEmail,
  toCommitterEmailSubject,
  toEmailHtml,
} from "@/lib/email/email.lib";
import CommitterVerifyEmail from "@/lib/email/templates/committer-verify-email";
import { GoalEntryStatus } from "@/types/enums";
import { DB } from "../database/db";

// TODO figure out how this should work across timezones. run multiple times?
// this job runs everyday at 8am PST
const main = async () => {
  const pendingGoalEntries = await DB.get()
    .selectFrom("goalEntry")
    .innerJoin("goal", "goal.id", "goalEntry.goalId")
    .innerJoin("user", "user.id", "goal.createdByUserId")
    .select([
      "goalEntry.id",
      "goalEntry.status",
      "goalEntry.dueAt",

      "user.email as userEmail",
      "user.firstName as userFirstName",
      "user.lastName as userLastName",

      "goal.description",
      "goal.stakeAmount",
      "goal.partnerEmail",
      "goal.scheduleType",
      "goal.scheduleDays",
      "goal.createdAt",
    ])
    .where("status", "=", GoalEntryStatus.Pending)
    .execute();

  // TODO does this timezone logic make sense... lets say we were running script in another server
  // TODO figure out how to do this filter in sql
  console.log("Current date (local):", new Date().getDate());
  const dueTodayGoalEntries = pendingGoalEntries.filter((goalEntry) => {
    const entryDueDate = new Date(goalEntry.dueAt);
    console.log("Goal entry due date (local):", entryDueDate.getDate());
    return entryDueDate.getDate() === new Date().getDate();
  });

  console.log("Due today goal entries:", dueTodayGoalEntries);

  for (const goalEntry of dueTodayGoalEntries) {
    console.log("Processing goal entry:", {
      description: goalEntry.description,
      dueAt: goalEntry.dueAt,
      userEmail: goalEntry.userEmail,
      partnerEmail: goalEntry.partnerEmail,
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
        subject: toCommitterEmailSubject(goalEntry.description),
        emailHtml: await toEmailHtml(CommitterVerifyEmail, {
          committerUser: {
            email: goalEntry.userEmail,
            firstName: goalEntry.userFirstName,
            lastName: goalEntry.userLastName,
          },
          goal: {
            id: goalEntry.id,
            description: goalEntry.description,
            stakeAmount: goalEntry.stakeAmount,
            scheduleType: goalEntry.scheduleType,
            scheduleDays: goalEntry.scheduleDays,
            partnerEmail: goalEntry.partnerEmail,
          },
          dueDate: new Date(goalEntry.dueAt),
          verificationToken: newVerificationToken,
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
};

main();
