import { Goal, User } from "@/database/db-generated-types";
import { getScheduleText, toFormattedDateText } from "@/lib/date";
import { ScheduleType } from "@/types/enums";
import { Body, Html } from "@react-email/components";
import { Selectable } from "kysely";

interface CommitterVerifyApprovedEmailProps {
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
}

export default function CommitterVerifyApprovedEmail({
  committerUser = {
    email: "committer@gmail.com",
    firstName: "John",
    lastName: "Doe",
  },
  goal = {
    description: "Run a marathon",
    stakeAmount: "100",
    scheduleType: ScheduleType.Recurring,
    id: "1",
    partnerEmail: "partner@gmail.com",
    scheduleDays: [1, 2, 3, 4, 5],
  },
  dueDate = new Date("12/20/2024 23:59:59"),
}: CommitterVerifyApprovedEmailProps) {
  const formattedDueDate = toFormattedDateText(dueDate);

  const name = committerUser.lastName
    ? `${committerUser.firstName} ${committerUser.lastName}`
    : committerUser.firstName;

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
