import { CompleteGoalEntry, mockCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { Body, Html } from "@react-email/components";
import { EmailCommitment } from "../common";

interface CommitterVerifyApprovedEmailProps {
  goalEntry: CompleteGoalEntry;
}

export default function CommitterVerifyApprovedEmail({
  goalEntry = mockCompleteGoalEntry,
}: CommitterVerifyApprovedEmailProps) {
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
