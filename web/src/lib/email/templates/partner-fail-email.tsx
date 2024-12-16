import { CompleteGoalEntry } from "@/lib/goals/goal.lib";
import { Body, Html } from "@react-email/components";

export default function PartnerFailEmail({
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
        Hi {goalEntry.goalPartnerEmail},
        <br />
        <br />
        {committerName} failed to complete their commitment:
        <br />
        <br />
        🎯 <strong>Commitment:</strong> {goalEntry.goalDescription}
        <br />
        💰 <strong>Stake:</strong> ${goalEntry.goalStakeAmount}
        <br />
        <br />
        They have been prompted to send you ${goalEntry.goalStakeAmount}.
        <br />
        <br />
        Cheers,
        <br />
        The GritCommittee
      </Body>
    </Html>
  );
}
