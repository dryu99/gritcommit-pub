import { Config } from "@/lib/config";
import { ServerClient } from "postmark";
import { GoalWithEntries } from "./goals/goal.helpers";

export const EmailClient = new ServerClient(Config.POSTMARK_API_KEY);

export const sendGoalStartedEmail = async ({
  email,
  goal,
}: {
  email: string;
  goal: GoalWithEntries;
}) => {
  const latestEntry = goal.entries[0];
  if (!latestEntry) {
    throw new Error("No entries found for goal");
  }

  const formattedDate = latestEntry.dueAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return EmailClient.sendEmail({
    From: "officialgritcommit@gmail.com",
    To: email,
    ReplyTo: "officialgritcommit@gmail.com",
    Subject: ``,
    HtmlBody: `
<p>
Hi,<br/><br/>

Your commitment has been created! Here are the details:<br/><br/>

🎯 <strong>Commitment:</strong> ${goal.description}<br/>
📅 <strong>Due Date:</strong> ${formattedDate}<br/>
💰 <strong>Stake Amount:</strong> $${goal.stakeAmount}<br/>
👥 <strong>Accountability Partner:</strong> ${goal.partnerEmail}<br/><br/>

We'll send you reminders as your due date approaches.<br/><br/>

Remember, if you don't complete your commitment by the deadline, you'll need to send $${goal.stakeAmount} to your accountability partner!<br/><br/>

Good luck!<br/><br/>

Cheers,<br/>
The GritCommittee
</p>
`,
  });
};
