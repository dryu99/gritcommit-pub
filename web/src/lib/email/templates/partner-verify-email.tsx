import { CompleteGoalEntry, mockCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { Body, Button, Html, Section } from "@react-email/components";
import { EmailCommitment } from "../common";
import { emailButtonStyle } from "../email.lib";

interface PartnerVerifyEmailProps {
  goalEntry: CompleteGoalEntry & {
    partnerVerificationToken: string;
  };
  committerMessage?: string;
  hasImage?: boolean;
}

export default function PartnerVerifyEmail({
  goalEntry = {
    ...mockCompleteGoalEntry,
    partnerVerificationToken: "1234567890",
  },
  committerMessage = "I did the thing",
  hasImage = true,
}: PartnerVerifyEmailProps) {
  const committerName = goalEntry.userLastName
    ? `${goalEntry.userFirstName} ${goalEntry.userLastName}`
    : goalEntry.userFirstName;

  return (
    <Html>
      <Body>
        Hi {goalEntry.goalPartnerEmail},
        <br />
        <br />
        {committerName} has completed their commitment:
        <br />
        <br />
        <EmailCommitment
          dueAt={goalEntry.dueAt}
          description={goalEntry.goalDescription}
          stakeAmount={goalEntry.goalStakeAmount}
          scheduleType={goalEntry.goalScheduleType}
          scheduleDays={goalEntry.goalScheduleDays}
        />
        <br />
        <br />
        {hasImage && (
          <>
            They sent you the following evidence:
            <br />
            <br />
            <img src="cid:evidence@goalentry.image" alt="Evidence" />
            <br />
            <br />
          </>
        )}
        {committerMessage && <>"{committerMessage}"</>}
        <br />
        <br />
        <br />
        Please verify their completion:
        <br />
        <br />
        <Section>
          <Button
            href={`${process.env.NODE_ENV === "production" ? "https://gritcommit.app" : "http://localhost:3000"}/partner-verify?token=${goalEntry.partnerVerificationToken}&approved=true`}
            style={{ ...emailButtonStyle, marginRight: "24px" }}
          >
            Yes
          </Button>
          <Button
            href={`${process.env.NODE_ENV === "production" ? "https://gritcommit.app" : "http://localhost:3000"}/partner-verify?token=${goalEntry.partnerVerificationToken}`}
            style={emailButtonStyle}
          >
            No
          </Button>
        </Section>
        <br />
        <br />
        Cheers,
        <br />
        The GritCommittee
      </Body>
    </Html>
  );
}
