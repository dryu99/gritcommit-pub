import { CompleteGoalEntry, mockCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { Body, Html } from "@react-email/components";
import { EmailCommitment } from "../common";

interface PartnerNewGoalEmailProps {
  goalEntry: CompleteGoalEntry;
}

export default function PartnerNewGoalEmail({
  goalEntry = mockCompleteGoalEntry,
}: PartnerNewGoalEmailProps) {
  const committerName = goalEntry.userLastName
    ? `${goalEntry.userFirstName} ${goalEntry.userLastName}`
    : goalEntry.userFirstName;

  return (
    <Html>
      <Body>
        Hi {goalEntry.goalPartnerEmail},
        <br />
        <br />
        {committerName} has started a new commitment and has assigned you as
        their accountability partner:
        <br />
        <br />
        <EmailCommitment
          dueAt={goalEntry.dueAt}
          description={goalEntry.goalDescription}
          stakeAmount={goalEntry.goalStakeAmount}
          scheduleType={goalEntry.goalScheduleType}
          scheduleDays={goalEntry.goalScheduleDays}
        />
        <br />
        <br />
        If they miss{" "}
        {goalEntry.goalScheduleType === "RECURRING"
          ? "a deadline"
          : "the deadline"}
        , {committerName} owes you ${goalEntry.goalStakeAmount}.
        <br />
        <br />
        When{" "}
        {goalEntry.goalScheduleType === "RECURRING"
          ? "a deadline"
          : "the deadline"}{" "}
        arrives, you'll receive an email to verify whether they completed their
        commitment.
        <br />
        <br />
        Help keep them accountable!
        <br />
        <br />
        Cheers,
        <br />
        The GritCommittee
      </Body>
    </Html>
  );
}
