import { ScheduleType } from "@/types/enums";
import { Twilio } from "twilio";
import { Config } from "../config";
import { getScheduleText, toFormattedDateText } from "../date";
import { CompleteGoalEntry } from "../goals/goal.lib";
import { BASE_URL } from "../url";

export const TWILIO_PHONE_NUMBER = "+12542771936";

const TwilioClient = new Twilio(
  Config.TWILIO_ACCOUNT_SID,
  Config.TWILIO_AUTH_TOKEN,
);

export const sendSms = async ({
  phoneNumber,
  message,
  mediaUrls,
}: {
  phoneNumber: string;
  message: string;
  mediaUrls?: string[];
}) => {
  await TwilioClient.messages.create({
    to: phoneNumber,
    from: TWILIO_PHONE_NUMBER,
    body: message,
    mediaUrl: mediaUrls ? mediaUrls : undefined,
  });
};

// TODO set up webhook (install cli)
// TODO if its too annoying, then just go with same email url approach for now.
// sendSms({
//   phoneNumber: "+17788829595",
//   message: "Hello, world!",
//   mediaUrls: [
//     "https://raw.githubusercontent.com/dianephan/flask_upload_photos/main/UPLOADS/DRAW_THE_OWL_MEME.png",
//   ],
// })
//   .then((res) => console.log(res))
//   .catch((err) => console.error(err));

const commitmentSection = (goalEntry: CompleteGoalEntry) => {
  return (
    `🎯 Commitment: ${goalEntry.goalDescription} \n` +
    `💰 Stake: ${goalEntry.goalStakeAmount} \n` +
    `${
      goalEntry.goalScheduleType === ScheduleType.Recurring
        ? `📅 Schedule: ${getScheduleText({
            scheduleType: goalEntry.goalScheduleType,
            scheduleDays: goalEntry.goalScheduleDays,
          })}`
        : `📅 Deadline: ${toFormattedDateText(goalEntry.dueAt)}`
    } \n`
  );
};

export const CommitterNewGoalText = (goalEntry: CompleteGoalEntry) => {
  return (
    `You've started a new commitment: \n` +
    "\n" +
    commitmentSection(goalEntry) +
    `\n` +
    `We will send you a text ${
      goalEntry.goalScheduleType === ScheduleType.Recurring
        ? "for each check-in"
        : "when the deadline arrives"
    } \n\n`
  );
};

export const PartnerNewGoalText = (goalEntry: CompleteGoalEntry) => {
  return (
    `${goalEntry.userFirstName} has started a new commitment and has assigned you as their accountability partner: \n` +
    "\n" +
    commitmentSection(goalEntry) +
    `\n` +
    `We will send you a text ${
      goalEntry.goalScheduleType === ScheduleType.Recurring
        ? "for each check-in"
        : "when the deadline arrives"
    } to verify their completion. \n\n`
  );
};

export const CommitterVerifyText = (goalEntry: CompleteGoalEntry) => {
  return (
    `Your commitment is due today at 11:59pm. \n` +
    "\n" +
    commitmentSection(goalEntry) +
    `\n` +
    `Please verify your completion at ` +
    `${BASE_URL}/committer-verify?token=${goalEntry.userVerificationToken}`
  );
};

export const PartnerVerifyText = (goalEntry: CompleteGoalEntry) => {
  return (
    `${goalEntry.userFirstName} has completed commitment: \n` +
    "\n" +
    commitmentSection(goalEntry) +
    `\n` +
    `Please verify their completion: \n` +
    `\n` +
    `APPROVE: ${BASE_URL}/partner-verify?token=${goalEntry.partnerVerificationToken}&approved=true` +
    `\n` +
    `DENY: ${BASE_URL}/partner-verify?token=${goalEntry.partnerVerificationToken}`
  );
};

// You started a new commitment:
// commitment:
// stake:
// deadline:
// schedule:
// we will send you a text when the due date arrives

// Daniel started a new commitment and assigned you as their accountability partner!\
// commitment:
// stake:
// deadline:
// schedule:
// we will send you a text when Daniel completes his task

// The due date has arrived for your commitment:
// commitment:
// stake:
// deadline:
// schedule:
// Please open the link to verify your completion: www.gritcommit.app/verify?token=1uif039jfiowanivoejaw

// Daniel has completed commitment:
// commitment:
// stake:
// deadline:
// schedule:
//
// EVIDENCE: [photo]
//
// Please open the link to verify their completion: www.gritcommit.app/verify?token=1uif039jfiowanivoejaw

// TODO maybe handle these multiple cases later
// The due date has arrived for multiple of your commitments:
// [run more, do stretches]
// Please open the link to verify your completion: www.gritcommit.app/verify?token=1uif039jfiowanivoejaw

// ! think we need to batch together goal entries that are due on the same day
// Daniel has completed(/failed) multiple commitments:
// ✅ run more
// ❌ stretch more
// Please open the link to verify their completion: www.gritcommit.app/verify?token=1uif039jfiowanivoejaw
