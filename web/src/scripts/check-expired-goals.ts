import {
  fetchCompleteGoalEntry,
  toRecentlyExpiredGoalEntries,
} from "@/lib/goals/goal.lib";
import { GoalEntryStatus } from "@/types/enums";
import { DB } from "../database/db";

// this job runs everyday at 12:00am PST
const main = async () => {
  const pendingGoalEntries = await fetchCompleteGoalEntry({
    status: GoalEntryStatus.CommitterVerifying,
  });

  const expiredGoalEntries = toRecentlyExpiredGoalEntries(pendingGoalEntries);
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
        .updateTable("goalEntry")
        .set({
          status: GoalEntryStatus.Failed,
        })
        .where("id", "=", goalEntry.id)
        .execute();

      // TODO send fail email
      // await sendEmail({
      //   recipientEmail: goalEntry.userEmail,
      //   subject: toCommitterEmailSubject(goalEntry.description),
      //   emailHtml: await toEmailHtml(CommitterVerifyEmail, {
      //     committerUser: {
      //       email: goalEntry.userEmail,
      //       firstName: goalEntry.userFirstName,
      //       lastName: goalEntry.userLastName,
      //     },
      //     goal: {
      //       id: goalEntry.id,
      //       description: goalEntry.description,
      //       stakeAmount: goalEntry.stakeAmount,
      //       scheduleType: goalEntry.scheduleType,
      //       scheduleDays: goalEntry.scheduleDays,
      //       partnerEmail: goalEntry.partnerEmail,
      //     },
      //     dueDate: new Date(goalEntry.dueAt),
      //   }),
      // });
    } catch (error) {
      console.error(`Failed to process goal entry ${goalEntry.id}:`, error);
    }
  }

  console.log("Done checking expired goal entries");
  process.exit(0);
};

main();
