import {
  sendEmail,
  toCommitterEmailSubject,
  toEmailHtml,
  toPartnerEmailSubject,
} from "../email/email.lib";
import CommitterFailEmail from "../email/templates/committer-fail-email";
import PartnerFailEmail from "../email/templates/partner-fail-email";
import { CompleteGoalEntry } from "../goals/goal.lib";

// notificaiotn_Type = sms | email
// completeGoalEntry
// notification_message = "partner fail" | "new goal" | etc
// images?

class NotificationManager {
  constructor(
    private readonly goalEntry: CompleteGoalEntry,
    private readonly notificationType: "sms" | "email",
  ) {}

  public async sendCommitterFail() {
    if (this.notificationType === "sms") {
      // const message = CommitterFailSms(this.goalEntry);
      // sendSms({
      //   phoneNumber: this.goalEntry.userPhoneNumber,
      //   message: message,
      // });
    } else if (this.notificationType === "email") {
      await sendEmail({
        recipientEmail: this.goalEntry.userEmail,
        subject: toCommitterEmailSubject(this.goalEntry.goalDescription),
        emailHtml: await toEmailHtml(CommitterFailEmail, {
          goalEntry: this.goalEntry,
        }),
      });
    }
  }

  public async sendPartnerFail() {
    if (this.notificationType === "sms") {
      // const message = PartnerFailSms(this.goalEntry);
      // sendSms({
      //   phoneNumber: this.goalEntry.userPhoneNumber,
      //   message: message,
      // });
    } else if (this.notificationType === "email") {
      sendEmail({
        recipientEmail: this.goalEntry.goalPartnerEmail,
        subject: toPartnerEmailSubject(
          this.goalEntry.goalDescription,
          this.goalEntry.userFirstName,
        ),
        emailHtml: await toEmailHtml(PartnerFailEmail, {
          goalEntry: this.goalEntry,
        }),
      });
    }
  }
}
