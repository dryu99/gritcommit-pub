import { Goal, User } from "@/database/db-generated-types";
import { getScheduleText, toFormattedDateText } from "@/lib/date";
import { ScheduleType } from "@/types/enums";
import { Body, Button, Html } from "@react-email/components";
import { Selectable } from "kysely";
import { emailButtonStyle } from "../email.lib";

interface CommitterVerifyEmailProps {
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
}

export default function CommitterVerifyEmail({
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
}: CommitterVerifyEmailProps) {
  const formattedDueDate = toFormattedDateText(dueDate);

  const committerName = committerUser.lastName
    ? `${committerUser.firstName} ${committerUser.lastName}`
    : committerUser.firstName;

  return (
    <Html>
      <Body>
        Hi {committerName},
        <br />
        <br />
        Your commitment is due today at 11:59pm.
        <br />
        <br />
        🎯 <strong>Commitment:</strong> {goal.description}
        <br />
        💰 <strong>Stake:</strong> ${goal.stakeAmount}
        <br />
        🤝 <strong>Accountability Partner:</strong> {goal.partnerEmail}
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
        Click the button below to mark your commitment as complete.
        <br />
        <br />
        <Button
          href={`${process.env.NODE_ENV === "production" ? "https://gritcommit.app" : "http://localhost:3000"}/committer-verify?token=${verificationToken}`}
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
        <br />${goal.stakeAmount} is at stake!
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
