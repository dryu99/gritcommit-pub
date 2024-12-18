import { Config } from "@/lib/config";
import { CompleteGoalEntry, mockCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { Body, Button, Html, Section } from "@react-email/components";
import { EmailCommitment, EmailSignOff } from "../common";
import { emailButtonStyle } from "../email.lib";

export default function PartnerVerifyEmail({
  goalEntry,
  committerMessage,
  hasImage,
  useMockData = Config.NODE_ENV === "development",
}: {
  goalEntry: CompleteGoalEntry & {
    partnerVerificationToken: string;
  };
  committerMessage?: string;
  hasImage?: boolean;
  useMockData?: boolean;
}) {
  const entry = useMockData ? mockCompleteGoalEntry : goalEntry;
  const realMessage = useMockData ? "I did the thing" : committerMessage;
  const realHasImage = useMockData ? true : hasImage;

  const committerName = entry.userLastName
    ? `${entry.userFirstName} ${entry.userLastName}`
    : entry.userFirstName;

  return (
    <Html>
      <Body>
        Hi {entry.goalPartnerEmail},
        <br />
        <br />
        {committerName} has completed their commitment:
        <br />
        <br />
        <EmailCommitment
          dueAt={entry.dueAt}
          description={entry.goalDescription}
          stakeAmount={entry.goalStakeAmount}
          scheduleType={entry.goalScheduleType}
          scheduleDays={entry.goalScheduleDays}
        />
        <br />
        <br />
        {realHasImage && (
          <>
            They sent you the following evidence:
            <br />
            <br />
            <img src="cid:evidence@entry.image" alt="Evidence" />
            <br />
            <br />
          </>
        )}
        {realMessage && <>"{realMessage}"</>}
        <br />
        <br />
        <br />
        Please verify their completion:
        <br />
        <br />
        <Section>
          <Button
            href={`${process.env.NODE_ENV === "production" ? "https://gritcommit.app" : "http://localhost:3000"}/partner-verify?token=${entry.partnerVerificationToken}&approved=true`}
            style={{ ...emailButtonStyle, marginRight: "24px" }}
          >
            Yes
          </Button>
          <Button
            href={`${process.env.NODE_ENV === "production" ? "https://gritcommit.app" : "http://localhost:3000"}/partner-verify?token=${entry.partnerVerificationToken}`}
            style={emailButtonStyle}
          >
            No
          </Button>
        </Section>
        <br />
        <br />
        <EmailSignOff />
      </Body>
    </Html>
  );
}
