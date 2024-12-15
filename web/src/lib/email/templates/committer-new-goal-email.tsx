import { getScheduleText, toFormattedDateText } from "@/lib/date";
import { CompleteGoalEntry } from "@/lib/goals/goal.lib";
import { GoalEntryStatus, ScheduleType } from "@/types/enums";
import { Body, Html } from "@react-email/components";

interface CommitterNewGoalEmailProps {
  goalEntry: CompleteGoalEntry;
}

export default function CommitterNewGoalEmail({
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
