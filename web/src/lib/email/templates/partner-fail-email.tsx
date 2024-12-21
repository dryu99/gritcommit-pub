import { Config } from "@/lib/config";
import { CompleteGoalEntry, mockCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { Body, Html } from "@react-email/components";
import { EmailCommitment, EmailSignOff } from "../common";

export default function PartnerFailEmail({
  goalEntry,
}: {
  goalEntry: CompleteGoalEntry;
}) {
  const entry =
    !goalEntry && Config.NODE_ENV === "development"
      ? mockCompleteGoalEntry
      : goalEntry;

  const committerName = entry.userLastName
    ? `${entry.userFirstName} ${entry.userLastName}`
    : entry.userFirstName;

  return (
    <Html>
      <Body>
        Hi {entry.goalPartnerEmail},
        <br />
        <br />
        {committerName} wasn't able to complete their commitment in time:
        <br />
        <br />
        <EmailCommitment
          timezone={entry.userTimezone}
          dueAt={entry.dueAt}
          description={entry.goalDescription}
          stakeAmount={entry.goalStakeAmount}
          scheduleType={entry.goalScheduleType}
          scheduleDays={entry.goalScheduleDays}
        />
        <br />
        <br />
        They have been prompted to send you ${entry.goalStakeAmount}.
        <br />
        <br />
        <EmailSignOff />
      </Body>
    </Html>
  );
}
