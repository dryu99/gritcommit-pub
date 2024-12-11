import { Config } from "@/lib/config";
import { render } from "@react-email/components";
import { ServerClient } from "postmark";
import React from "react";

export const EmailClient = new ServerClient(Config.POSTMARK_API_KEY);

const FROM_EMAIL = "notifications@gritcommit.app";
const REPLY_TO_EMAIL =
  "d131a38dc79441cf4d361088ef6486a6@inbound.postmarkapp.com";

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
    From: FROM_EMAIL,
    To: recipientEmail,
    ReplyTo: REPLY_TO_EMAIL,
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
