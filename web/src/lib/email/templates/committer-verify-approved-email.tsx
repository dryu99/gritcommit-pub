import { getScheduleText, toFormattedDateText } from "@/lib/date";
import { CompleteGoalEntry } from "@/lib/goals/goal.lib";
import { GoalEntryStatus, ScheduleType } from "@/types/enums";
import { Body, Html } from "@react-email/components";

interface CommitterVerifyApprovedEmailProps {
  goalEntry: CompleteGoalEntry;
}

export default function CommitterVerifyApprovedEmail({
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
    goalCreatedAt: new Date(),

    userEmail: "committer@gmail.com",
    userFirstName: "John",
    userLastName: "Doe",
  },
}: CommitterVerifyApprovedEmailProps) {
  const formattedDueDate = toFormattedDateText(goalEntry.dueAt);

  const name = goalEntry.userLastName
    ? `${goalEntry.userFirstName} ${goalEntry.userLastName}`
    : goalEntry.userFirstName;

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
        {/* TODO this should be differentg based onr ecurring and once */}
        Congratulations! You've completed your commitment.
        <br />
        <br />
        Stay Gritty.
        <br />
        <br />
        {/* TODO insert link to dashboard */}
        {/* TODO insert fun fact e.g. % or number of people who completed goals today */}
        Cheers,
        <br />
        The GritCommittee
      </Body>
    </Html>
  );
}
