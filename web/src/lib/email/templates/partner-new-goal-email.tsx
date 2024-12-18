import { Config } from "@/lib/config";
import { CompleteGoalEntry, mockCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { Body, Html } from "@react-email/components";
import { EmailCommitment, EmailSignOff } from "../common";

export default function PartnerNewGoalEmail({
  goalEntry = mockCompleteGoalEntry,
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
        Hi {entry.goalPartnerEmail},
        <br />
        <br />
        {committerName} has started a new commitment and has assigned you as
        their accountability partner:
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
        If they miss{" "}
        {entry.goalScheduleType === "RECURRING" ? "a deadline" : "the deadline"}
        , {committerName} owes you ${entry.goalStakeAmount}.
        <br />
        <br />
        When{" "}
        {entry.goalScheduleType === "RECURRING"
          ? "a deadline"
          : "the deadline"}{" "}
        arrives, you'll receive an email to verify whether they completed their
        commitment.
        <br />
        <br />
        Help keep them accountable!
        <br />
        <br />
        <EmailSignOff />
      </Body>
    </Html>
  );
}
