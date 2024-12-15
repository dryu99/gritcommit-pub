import { getScheduleText, toFormattedDateText } from "@/lib/date";
import { CompleteGoalEntry } from "@/lib/goals/goal.lib";
import { GoalEntryStatus, ScheduleType } from "@/types/enums";
import { Body, Html } from "@react-email/components";

interface PartnerNewGoalEmailProps {
  goalEntry: CompleteGoalEntry;
}

export default function PartnerNewGoalEmail({
  goalEntry = {
    dueAt: new Date("12/20/2024 23:59:59"),
    id: "1",
    status: GoalEntryStatus.Completed,

    goalId: "1",
    goalDescription: "Run a marathon",
    goalStakeAmount: "100",
    goalScheduleType: ScheduleType.Recurring,
    goalPartnerEmail: "partner@gmail.com",
    goalScheduleDays: [1, 2, 3, 4, 5],

    userEmail: "committer@gmail.com",
    userFirstName: "John",
    userLastName: "Doe",
  },
}: PartnerNewGoalEmailProps) {
  const formattedDueDate = toFormattedDateText(goalEntry.dueAt);

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
        🎯 <strong>Commitment:</strong> {goalEntry.goalDescription}
        <br />
        💰 <strong>Stake:</strong> ${goalEntry.goalStakeAmount}
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
