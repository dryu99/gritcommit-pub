import { Goal } from "@/database/db-generated-types";
import { Config } from "@/lib/config";
import { Insertable } from "kysely";
import { ServerClient } from "postmark";
import { getRecurringDaysText } from "./days";

export const EmailClient = new ServerClient(Config.POSTMARK_API_KEY);

const ADMIN_EMAIL = "notifications@gritcommit.app";

export const sendGoalStartedEmailToOwner = async ({
  email, // TODO should pass name too
  goal,
  nextDueDate,
}: {
  email: string;
  goal: Insertable<Goal>; // TODO this should really be selectable lol
  nextDueDate: Date;
}) => {
  const formattedDate = nextDueDate.toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return EmailClient.sendEmail({
    From: ADMIN_EMAIL,
    To: email,
    ReplyTo: ADMIN_EMAIL,
    Subject: `New commitment created!`,
    HtmlBody: `
<p>
Hi,<br/><br/>

Your commitment has been created! Here are the details:<br/><br/>

🎯 <strong>Commitment:</strong> ${goal.description}<br/>
📅 <strong>${
      goal.scheduleType === "RECURRING" ? "Next Check-in:" : "Due Date:"
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

export const sendGoalStartedEmailToPartner = async ({
  ownerEmail,
  partnerEmail,
  goal,
  nextDueDate,
}: {
  ownerEmail: string; // TODO should pass name too
  partnerEmail: string;
  goal: Insertable<Goal>;
  nextDueDate: Date;
}) => {
  const formattedDate = nextDueDate.toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return EmailClient.sendEmail({
    From: ADMIN_EMAIL,
    To: partnerEmail,
    ReplyTo: ADMIN_EMAIL,
    Subject: `You've been assigned as an accountability partner!`,
    HtmlBody: `
<p>
Hi,<br/><br/>

${ownerEmail} has created a new commitment! Here are the details:<br/><br/>

🎯 <strong>Commitment:</strong> ${goal.description}<br/>
📅 <strong>${
      goal.scheduleType === "RECURRING" ? "Next Check-in:" : "Due Date:"
    }</strong> ${formattedDate}<br/>
🔁 <strong>Recurring:</strong> ${
      goal.scheduleType === "RECURRING" && goal.scheduleDays
        ? getRecurringDaysText(goal.scheduleDays)
        : "No"
    }<br/>
💰 <strong>Stake Amount:</strong> $${goal.stakeAmount}<br/>
👥 <strong>Accountability Partner:</strong> You!<br/><br/>

If ${ownerEmail} doesn't complete their commitment by the deadline, they'll need to send $${goal.stakeAmount} to you!<br/><br/>

Keep them accountable 🤝<br/><br/>

Cheers,<br/>
The GritCommittee
</p>
`,
  });
};
