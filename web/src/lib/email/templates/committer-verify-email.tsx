import { Config } from "@/lib/config";
import { CompleteGoalEntry, mockCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { Body, Button, Html } from "@react-email/components";
import { EmailCommitment, EmailSignOff } from "../common";
import { emailButtonStyle } from "../email.lib";

export default function CommitterVerifyEmail({
  goalEntry = {
    ...mockCompleteGoalEntry,
    userVerificationToken: "1234567890",
  },
  useMockData = Config.NODE_ENV === "development",
}: {
  goalEntry: CompleteGoalEntry & {
    userVerificationToken: string;
  };
  useMockData?: boolean;
}) {
  const entry = useMockData ? mockCompleteGoalEntry : goalEntry;

  const committerName = entry.userLastName
    ? `${entry.userFirstName} ${entry.userLastName}`
    : entry.userFirstName;

  return (
    <Html>
      <Body>
        Hi {committerName},
        <br />
        <br />
        Your commitment is due today at 11:59pm.
        <br />
        <br />
        <EmailCommitment
          dueAt={entry.dueAt}
          description={entry.goalDescription}
          stakeAmount={entry.goalStakeAmount}
          scheduleType={entry.goalScheduleType}
          scheduleDays={entry.goalScheduleDays}
          partnerEmail={entry.goalPartnerEmail}
        />
        <br />
        <br />
        Click the button below to mark your commitment as complete.
        <br />
        <br />
        <Button
          href={`${process.env.NODE_ENV === "production" ? "https://gritcommit.app" : "http://localhost:3000"}/committer-verify?token=${entry.userVerificationToken}`}
          style={emailButtonStyle}
        >
          Done
        </Button>
        <br />
        <br />
        Otherwise, what are you waiting for?
        <br />
        <br />
        There's still time!
        <br />
        <br />${entry.goalStakeAmount} is at stake!
        <br />
        <br />
        You've got this!
        <br />
        <br />
        Go!
        <br />
        <br />
        <EmailSignOff />
      </Body>
    </Html>
  );
}
