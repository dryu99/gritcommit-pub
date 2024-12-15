import { Config } from "@/lib/config";
import { render } from "@react-email/components";
import { Attachment, ServerClient } from "postmark";
import React from "react";

export const EmailClient = new ServerClient(Config.POSTMARK_API_KEY);

const FROM_EMAIL = "notifications@gritcommit.app";
const REPLY_TO_EMAIL =
  "d131a38dc79441cf4d361088ef6486a6@inbound.postmarkapp.com";

export const toCommitterEmailSubject = (goalDescription: string) => {
  const shortDescription =
    goalDescription.length > 50
      ? goalDescription.slice(0, 47) + "..."
      : goalDescription;

  return `Your new commitment: "${shortDescription}"`;
};

export const toPartnerEmailSubject = (
  committerName: string,
  goalDescription: string,
) => {
  const shortDescription =
    goalDescription.length > 50
      ? goalDescription.slice(0, 47) + "..."
      : goalDescription;

  return `${committerName} wants you to keep them accountable for "${shortDescription}"`;
};

export const sendEmail = async ({
  recipientEmail,
  subject,
  emailHtml,
  attachments,
}: {
  recipientEmail: string;
  subject: string;
  emailHtml: string;
  attachments?: Attachment[];
}) => {
  return EmailClient.sendEmail({
    From: FROM_EMAIL,
    To: recipientEmail,
    ReplyTo: REPLY_TO_EMAIL,
    Subject: subject,
    HtmlBody: emailHtml,
    Attachments: attachments,
  });
};

export async function toEmailHtml<P extends object>(
  EmailComponent: React.ComponentType<P>,
  props: P,
): Promise<string> {
  // this is needed when executed server-side
  if (typeof global.React === "undefined") {
    global.React = React;
  }

  return render(React.createElement(EmailComponent, props));
}

export const emailButtonStyle: React.CSSProperties = {
  backgroundColor: "#ea580c",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: "5px",
  textDecoration: "none",
  fontFamily: "monospace",
  fontSize: "16px",
};
