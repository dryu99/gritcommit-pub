import { Goal, User } from "@/database/db-generated-types";
import { Config } from "@/lib/config";
import { Insertable, Selectable } from "kysely";
import { ServerClient } from "postmark";
import { getRecurringDaysText } from "./days";

export const EmailClient = new ServerClient(Config.POSTMARK_API_KEY);

export const sendGoalStartedEmail = async ({
  user,
  goal,
  nextDueDate,
}: {
  user: Selectable<User>;
  goal: Insertable<Goal>; // TODO this should really be selectable lol
  nextDueDate: Date;
}) => {
  const formattedDate = nextDueDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return EmailClient.sendEmail({
    From: "officialgritcommit@gmail.com",
    To: user.email,
    ReplyTo: "officialgritcommit@gmail.com",
    Subject: `New commitment created!`,
    HtmlBody: `
<p>
Hi,<br/><br/>

Your commitment has been created! Here are the details:<br/><br/>

🎯 <strong>Commitment:</strong> ${goal.description}<br/>
📅 <strong>${
      goal.scheduleType === "RECURRING" ? "Next Due Date:" : "Due Date:"
    }</strong> ${formattedDate}<br/>
🔁 <strong>Recurring:</strong> ${
      goal.scheduleType === "RECURRING" && goal.scheduleDays
        ? getRecurringDaysText(goal.scheduleDays)
        : "No"
    }<br/>
💰 <strong>Stake Amount:</strong> $${goal.stakeAmount}<br/>
👥 <strong>Accountability Partner:</strong> ${goal.partnerEmail}<br/><br/>

We'll send you reminders as your due date approaches.<br/><br/>

Remember, if you don't complete your commitment by the deadline, you'll need to send $${goal.stakeAmount} to your partner!<br/><br/>

Good luck!<br/><br/>

Cheers,<br/>
The GritCommittee
</p>
`,
  });
};
