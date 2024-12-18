import { Config } from "@/lib/config";
import { CompleteGoalEntry, mockCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { Body, Html } from "@react-email/components";
import { EmailCommitment, EmailSignOff } from "../common";

export default function CommitterFailEmail({
  goalEntry,
  useMockData = Config.NODE_ENV === "development",
}: {
  goalEntry: CompleteGoalEntry;
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
        The due date for your commitment has passed.
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
        Please send the stake amount of ${entry.goalStakeAmount} to your
        partner.
        <br />
        <br />
        {/* TODO if this is recurring have to state NEXT DUE DATE */}
        <EmailSignOff />
      </Body>
    </Html>
  );
}
