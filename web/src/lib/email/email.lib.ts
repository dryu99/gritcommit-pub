import { Goal } from "@/database/db-generated-types";
import { Config } from "@/lib/config";
import { render } from "@react-email/components";
import { Insertable } from "kysely";
import { ServerClient } from "postmark";
import React from "react";
import { getScheduleText } from "../days";

export const EmailClient = new ServerClient(Config.POSTMARK_API_KEY);

const ADMIN_EMAIL = "notifications@gritcommit.app";

export const sendEmail = async ({
  recipientEmail,
  subject,
  emailHtml,
}: {
  recipientEmail: string;
  subject: string;
  emailHtml: string;
}) => {
  return EmailClient.sendEmail({
    From: ADMIN_EMAIL,
    To: recipientEmail,
    ReplyTo: ADMIN_EMAIL,
    Subject: subject,
    HtmlBody: emailHtml,
  });
};

export async function toEmailHtml<P extends object>(
  EmailComponent: React.ComponentType<P>,
  props: P,
): Promise<string> {
  return render(React.createElement(EmailComponent, props));
}

export const sendGoalDueTodayEmailToOwner = async ({
  email,
  goal,
  nextDueDate,
}: {
  email: string;
  goal: Insertable<Goal>;
  nextDueDate: Date;
}) => {
  return EmailClient.sendEmail({
    From: ADMIN_EMAIL,
    To: email,
    ReplyTo: ADMIN_EMAIL,
    Subject:
      goal.scheduleType === "RECURRING"
        ? `Commitment check-in`
        : `Commitment deadline approaching`,
    HtmlBody: `
<p>
Hi ${email},<br/><br/>

Your commitment is due today at 11:59pm:

🎯 <strong>Commitment:</strong> ${goal.description}<br/>
💰 <strong>Stake:</strong> $${goal.stakeAmount}<br/>
👥 <strong>Accountability Partner:</strong> ${goal.partnerEmail}<br/><br/>
🔁 <strong>Schedule:</strong> ${getScheduleText(goal)}<br/><br/>

Remember, if you don't complete your commitment by the deadline, you'll need to send $${goal.stakeAmount} to your partner!<br/><br/>

Good luck!<br/><br/>

Cheers,<br/>
The GritCommittee
</p>
`,
  });
};
