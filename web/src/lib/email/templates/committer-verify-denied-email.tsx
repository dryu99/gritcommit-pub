import { CompleteGoalEntry, mockCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { Body, Html } from "@react-email/components";
import { EmailCommitment } from "../common";

interface CommitterVerifyDeniedEmailProps {
  goalEntry: CompleteGoalEntry;
}

export default function CommitterVerifyDeniedEmail({
  goalEntry = mockCompleteGoalEntry,
}: CommitterVerifyDeniedEmailProps) {
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
