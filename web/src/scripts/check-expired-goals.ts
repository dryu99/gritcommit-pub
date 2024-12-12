import { GoalEntryStatus } from "@/types/enums";
import { DB } from "../database/db";

// this job runs everyday at 12:00am PST
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
    .where("status", "=", GoalEntryStatus.CommitterVerifying)
    .execute();

  const dueTodayGoalEntries = pendingGoalEntries.filter((goalEntry) => {
    const entryDueDate = new Date(goalEntry.dueAt);
    return entryDueDate.getDate() === new Date().getDate();
  });

  console.log("Due today goal entries:", dueTodayGoalEntries.length);

  for (const goalEntry of dueTodayGoalEntries) {
    console.log("Processing goal entry:", {
      description: goalEntry.description,
      dueAt: goalEntry.dueAt,
      userEmail: goalEntry.userEmail,
      partnerEmail: goalEntry.partnerEmail,
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
