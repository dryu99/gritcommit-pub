import {
  sendEmail,
  toCommitterEmailSubject,
  toEmailHtml,
  toPartnerEmailSubject,
} from "../email/email.lib";
import CommitterFailEmail from "../email/templates/committer-fail-email";
import CommitterVerifyEmail from "../email/templates/committer-verify-email";
import PartnerFailEmail from "../email/templates/partner-fail-email";
import { CompleteGoalEntry } from "../goals/goal.lib";

interface NotificationStrategy {
  sendCommitterFail(goalEntry: CompleteGoalEntry): Promise<void>;
  sendPartnerFail(goalEntry: CompleteGoalEntry): Promise<void>;
  sendCommitterVerify(
    goalEntry: CompleteGoalEntry,
    newVerificationToken: string,
  ): Promise<void>;
}

const emailStrategy: NotificationStrategy = {
  async sendCommitterFail(goalEntry: CompleteGoalEntry): Promise<void> {
    await sendEmail({
      recipientEmail: goalEntry.userEmail,
      subject: toCommitterEmailSubject(goalEntry.goalDescription),
      emailHtml: await toEmailHtml(CommitterFailEmail, { goalEntry }),
    });
  },

  async sendPartnerFail(goalEntry: CompleteGoalEntry): Promise<void> {
    await sendEmail({
      recipientEmail: goalEntry.goalPartnerEmail,
      subject: toPartnerEmailSubject(
        goalEntry.goalDescription,
        goalEntry.userFirstName,
      ),
      emailHtml: await toEmailHtml(PartnerFailEmail, { goalEntry }),
    });
  },

  async sendCommitterVerify(
    goalEntry: CompleteGoalEntry,
    newVerificationToken: string,
  ): Promise<void> {
    await sendEmail({
      recipientEmail: goalEntry.userEmail,
      subject: toCommitterEmailSubject(goalEntry.goalDescription),
      emailHtml: await toEmailHtml(CommitterVerifyEmail, {
        goalEntry: {
          ...goalEntry,
          userVerificationToken: newVerificationToken,
        },
      }),
    });
  },
};

const smsStrategy: NotificationStrategy = {
  async sendCommitterFail(goalEntry: CompleteGoalEntry): Promise<void> {
    // SMS implementation
  },
  async sendPartnerFail(goalEntry: CompleteGoalEntry): Promise<void> {
    // SMS implementation
  },
  async sendCommitterVerify(
    goalEntry: CompleteGoalEntry,
    newVerificationToken: string,
  ): Promise<void> {
    // SMS implementation
  },
};

const strategies = {
  email: emailStrategy,
  sms: smsStrategy,
} as const;

export class NotificationManager {
  static sendCommitterFail(
    type: keyof typeof strategies,
    goalEntry: CompleteGoalEntry,
  ): Promise<void> {
    return strategies[type].sendCommitterFail(goalEntry);
  }

  static sendPartnerFail(
    type: keyof typeof strategies,
    goalEntry: CompleteGoalEntry,
  ): Promise<void> {
    return strategies[type].sendPartnerFail(goalEntry);
  }

  static sendCommitterVerify(
    type: keyof typeof strategies,
    goalEntry: CompleteGoalEntry,
    newVerificationToken: string,
  ): Promise<void> {
    return strategies[type].sendCommitterVerify(
      goalEntry,
      newVerificationToken,
    );
  }
}
