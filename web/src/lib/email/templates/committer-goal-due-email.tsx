import { Goal, User } from "@/database/db-generated-types";
import { ScheduleType } from "@/types/enums";
import { Body, Html } from "@react-email/components";
import { Insertable } from "kysely";
import { getScheduleText, toFormattedDateText } from "../../days";

interface CommitterGoalDueEmailProps {
  committerUser: Insertable<User>;
  goal: Insertable<Goal>;
  nextDueDate: Date;
}

export default function CommitterGoalDueEmail({
  committerUser = {
    email: "committer@gmail.com",
    firstName: "John",
    lastName: "Doe",
    id: "1",
  },
  goal = {
    description: "Run a marathon",
    stakeAmount: 100,
    scheduleType: ScheduleType.Recurring,
    scheduleDays: [1, 2, 3, 4, 5],
    createdByUserId: "1",
    id: "1",
    partnerEmail: "partner@gmail.com",
  },
  nextDueDate = new Date("12/20/2024 23:59:59"),
}: CommitterGoalDueEmailProps) {
  const formattedDate = toFormattedDateText(nextDueDate);

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
        {goal.scheduleType === "ONCE" && (
          <>
            📅 <strong>Due Date:</strong> {formattedDate}
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
        <strong>Reply "Y"</strong> to this email if you've completed your
        commitment (feel free to also include photos as evidence). Your partner
        will verify your response.
        <br />
        <br />
        If you haven't completed your commitment yet, what are you waiting for?
        There's still time! ${goal.stakeAmount} is at stake! Go! You've got
        this!
        <br />
        <br />
        Cheers,
        <br />
        The GritCommittee
      </Body>
    </Html>
  );
}
