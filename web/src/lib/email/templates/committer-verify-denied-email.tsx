import { getScheduleText, toFormattedDateText } from "@/lib/date";
import { CompleteGoalEntry } from "@/lib/goals/goal.lib";
import { GoalEntryStatus, ScheduleType } from "@/types/enums";
import { Body, Html } from "@react-email/components";

interface CommitterVerifyDeniedEmailProps {
  goalEntry: CompleteGoalEntry;
}

export default function CommitterVerifyDeniedEmail({
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
}: CommitterVerifyDeniedEmailProps) {
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
        Your accountability partner has denied your submission for the following
        commitment:
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
        {/* TODO inclyude links to etransfer */}
        {/* TODO this should be differentg based onr ecurring and once */}
        As per the contract, please send your partner $
        {goalEntry.goalStakeAmount}.
        <br />
        <br />
        Remember, achieving your goals requires patience and{" "}
        <strong>grit</strong>. Even though things didn't work out this time,
        keep pushing forward.
        <br />
        <br />
        Cheers,
        <br />
        The GritCommittee
      </Body>
    </Html>
  );
}

// https://secure.royalbank.com/statics/login-service-ui/index#/full/signin?LANGUAGE=ENGLISH
