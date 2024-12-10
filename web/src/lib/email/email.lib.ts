import { Config } from "@/lib/config";
import { render } from "@react-email/components";
import { ServerClient } from "postmark";
import React from "react";

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
