import { CompleteGoalEntry } from "@/lib/goals/goal.lib";
import { Body, Html } from "@react-email/components";
import { EmailCommitment } from "../common";

export default function CommitterFailEmail({
  goalEntry,
}: {
  goalEntry: CompleteGoalEntry;
}) {
  const committerName = goalEntry.userLastName
    ? `${goalEntry.userFirstName} ${goalEntry.userLastName}`
    : goalEntry.userFirstName;

  return (
    <Html>
      <Body>
        Hi {committerName},
        <br />
        <br />
        The due date for your commitment has passed.
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
        Please send the stake amount of ${goalEntry.goalStakeAmount} to your
        partner.
        <br />
        <br />
        {/* TODO if this is recurring have to state NEXT DUE DATE */}
        Cheers,
        <br />
        The GritCommittee
      </Body>
    </Html>
  );
}
