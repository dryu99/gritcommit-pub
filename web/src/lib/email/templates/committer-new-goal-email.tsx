import { CompleteGoalEntry, mockCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { Body, Html } from "@react-email/components";
import { EmailCommitment, EmailSignOff } from "../common";

interface CommitterNewGoalEmailProps {
  goalEntry: CompleteGoalEntry;
}

export default function CommitterNewGoalEmail({
  goalEntry = mockCompleteGoalEntry,
}: CommitterNewGoalEmailProps) {
  const committerName = goalEntry.userLastName
    ? `${goalEntry.userFirstName} ${goalEntry.userLastName}`
    : goalEntry.userFirstName;

  return (
    <Html>
      <Body>
        Hi {committerName},
        <br />
        <br />
        You've started a new commitment:
        <br />
        <br />
        <EmailCommitment
          dueAt={goalEntry.dueAt}
          description={goalEntry.goalDescription}
          stakeAmount={goalEntry.goalStakeAmount}
          scheduleType={goalEntry.goalScheduleType}
          scheduleDays={goalEntry.goalScheduleDays}
          partnerEmail={goalEntry.goalPartnerEmail}
        />
        <br />
        <br />
        If you miss{" "}
        {goalEntry.goalScheduleType === "RECURRING"
          ? "a deadline"
          : "the deadline"}
        , you owe your partner ${goalEntry.goalStakeAmount}.
        <br />
        <br />
        When{" "}
        {goalEntry.goalScheduleType === "RECURRING"
          ? "a deadline"
          : "the deadline"}{" "}
        arrives, you'll receive an email to verify your completion status.
        <br />
        <br />
        Good luck!
        <br />
        <br />
        <EmailSignOff />
      </Body>
    </Html>
  );
}
