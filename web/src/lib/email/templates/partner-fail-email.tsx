import { Config } from "@/lib/config";
import { CompleteGoalEntry, mockCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { Body, Html } from "@react-email/components";
import { EmailSignOff } from "../common";

export default function PartnerFailEmail({
  goalEntry,
  useMockData = Config.NODE_ENV === "development",
}: {
  goalEntry: CompleteGoalEntry;
  useMockData?: boolean;
}) {
  const entry = useMockData ? mockCompleteGoalEntry : goalEntry;

  const committerName = entry.userLastName
    ? `${entry.userFirstName} ${entry.userLastName}`
    : entry.userFirstName;

  return (
    <Html>
      <Body>
        Hi {entry.goalPartnerEmail},
        <br />
        <br />
        {committerName} failed to complete their commitment:
        <br />
        <br />
        🎯 <strong>Commitment:</strong> {entry.goalDescription}
        <br />
        💰 <strong>Stake:</strong> ${entry.goalStakeAmount}
        <br />
        <br />
        They have been prompted to send you ${entry.goalStakeAmount}.
        <br />
        <br />
        <EmailSignOff />
      </Body>
    </Html>
  );
}
