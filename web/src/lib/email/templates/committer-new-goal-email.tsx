import { getScheduleText, toFormattedDateText } from "@/lib/date";
import { CompleteGoalEntry, mockCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { Body, Html } from "@react-email/components";

interface CommitterNewGoalEmailProps {
  goalEntry: CompleteGoalEntry;
}

export default function CommitterNewGoalEmail({
  goalEntry = mockCompleteGoalEntry,
}: CommitterNewGoalEmailProps) {
  const formattedDueDate = toFormattedDateText(goalEntry.dueAt);

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
        🎯 <strong>Commitment:</strong> {goalEntry.goalDescription}
        <br />
        💰 <strong>Stake:</strong> ${goalEntry.goalStakeAmount}
        <br />
        🤝 <strong>Accountability Partner:</strong> {goalEntry.goalPartnerEmail}
        <br />
        {goalEntry.goalScheduleType === "ONCE" && (
          <>
            📅 <strong>Due Date:</strong> {formattedDueDate}
            <br />
          </>
        )}
        {goalEntry.goalScheduleType === "RECURRING" && (
          <>
            📅 <strong>Schedule:</strong>{" "}
            {getScheduleText({
              scheduleType: goalEntry.goalScheduleType,
              scheduleDays: goalEntry.goalScheduleDays,
            })}
            <br />
          </>
        )}
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
        Cheers,
        <br />
        The GritCommittee
      </Body>
    </Html>
  );
}
