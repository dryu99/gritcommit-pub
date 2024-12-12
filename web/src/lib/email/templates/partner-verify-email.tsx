import { Goal, User } from "@/database/db-generated-types";
import { ScheduleType } from "@/types/enums";
import { Body, Button, Html, Section } from "@react-email/components";
import { Selectable } from "kysely";
import { getScheduleText, toFormattedDateText } from "../../days";
import { emailButtonStyle } from "../email.lib";

interface PartnerVerifyEmailProps {
  committerUser: Pick<User, "email" | "firstName" | "lastName">;
  goal: Pick<
    Selectable<Goal>,
    | "description"
    | "stakeAmount"
    | "scheduleType"
    | "id"
    | "partnerEmail"
    | "scheduleDays"
  >;
  dueDate: Date;
  verificationToken: string;
  committerMessage?: string;
  hasImage?: boolean;
}

export default function PartnerVerifyEmail({
  committerUser = {
    email: "committer@gmail.com",
    firstName: "John",
    lastName: "Doe",
  },
  goal = {
    description: "Run a marathon",
    stakeAmount: "100",
    scheduleType: ScheduleType.Recurring,
    scheduleDays: [1, 2, 3, 4, 5],
    id: "1",
    partnerEmail: "partner@gmail.com",
  },
  dueDate = new Date("12/20/2024 23:59:59"),
  verificationToken = "1234567890",
  committerMessage = "I did the thing",
  hasImage = true,
}: PartnerVerifyEmailProps) {
  const formattedDueDate = toFormattedDateText(dueDate);

  const committerName = committerUser.lastName
    ? `${committerUser.firstName} ${committerUser.lastName}`
    : committerUser.firstName;

  return (
    <Html>
      <Body>
        Hi {goal.partnerEmail},
        <br />
        <br />
        {committerName} has completed their commitment:
        <br />
        <br />
        🎯 <strong>Commitment:</strong> {goal.description}
        <br />
        💰 <strong>Stake:</strong> ${goal.stakeAmount}
        <br />
        {goal.scheduleType === "ONCE" && (
          <>
            📅 <strong>Due Date:</strong> {formattedDueDate}
            <br />
          </>
        )}
        {goal.scheduleType === "RECURRING" && (
          <>
            📅 <strong>Schedule:</strong> {getScheduleText(goal)}
            <br />
          </>
        )}
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
            href={`${process.env.NODE_ENV === "production" ? "https://gritcommit.app" : "http://localhost:3000"}/partner-verify?token=${verificationToken}&approved=true`}
            style={{ ...emailButtonStyle, marginRight: "24px" }}
          >
            Yes
          </Button>
          <Button
            href={`${process.env.NODE_ENV === "production" ? "https://gritcommit.app" : "http://localhost:3000"}/partner-verify?token=${verificationToken}`}
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
