import { Config } from "@/lib/config";
import { CompleteGoalEntry, mockCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { Body, Html } from "@react-email/components";
import { EmailCommitment, EmailSignOff } from "../common";

export default function CommitterVerifyApprovedEmail({
  goalEntry,
  useMockData = Config.NODE_ENV === "development",
}: {
  goalEntry: CompleteGoalEntry;
  useMockData?: boolean;
}) {
  const entry = useMockData ? mockCompleteGoalEntry : goalEntry;

  const name = entry.userLastName
    ? `${entry.userFirstName} ${entry.userLastName}`
    : entry.userFirstName;

  return (
    <Html>
      <Body>
        Hi {name},
        <br />
        <br />
        Your accountability partner has approved your submission for the
        following commitment:
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
        {/* TODO this should be differentg based onr ecurring and once */}
        Congratulations! You've completed your commitment.
        <br />
        <br />
        Stay Gritty.
        <br />
        <br />
        {/* TODO insert link to dashboard */}
        {/* TODO insert fun fact e.g. % or number of people who completed goals today */}
        <EmailSignOff />
      </Body>
    </Html>
  );
}
