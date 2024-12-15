import { getScheduleText, toFormattedDateText } from "@/lib/date";
import { CompleteGoalEntry, mockCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { Body, Button, Html } from "@react-email/components";
import { emailButtonStyle } from "../email.lib";

interface CommitterVerifyEmailProps {
  goalEntry: CompleteGoalEntry & {
    userVerificationToken: string;
  };
}

export default function CommitterVerifyEmail({
  goalEntry = {
    ...mockCompleteGoalEntry,
    userVerificationToken: "1234567890",
  },
}: CommitterVerifyEmailProps) {
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
        Your commitment is due today at 11:59pm.
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
        Click the button below to mark your commitment as complete.
        <br />
        <br />
        <Button
          href={`${process.env.NODE_ENV === "production" ? "https://gritcommit.app" : "http://localhost:3000"}/committer-verify?token=${goalEntry.userVerificationToken}`}
          style={emailButtonStyle}
        >
          Done
        </Button>
        <br />
        <br />
        Otherwise, what are you waiting for?
        <br />
        <br />
        There's still time!
        <br />
        <br />${goalEntry.goalStakeAmount} is at stake!
        <br />
        <br />
        You've got this!
        <br />
        <br />
        Go!
        <br />
        <br />
        Cheers,
        <br />
        The GritCommittee
      </Body>
    </Html>
  );
}
