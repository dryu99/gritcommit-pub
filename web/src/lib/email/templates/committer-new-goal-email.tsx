import { Goal, User } from "@/database/db-generated-types";
import { getScheduleText, toFormattedDateText } from "@/lib/date";
import { ScheduleType } from "@/types/enums";
import { Body, Html } from "@react-email/components";
import { Insertable } from "kysely";

interface CommitterNewGoalEmailProps {
  committerUser: Insertable<User>;
  goal: Insertable<Goal>;
  nextDueDate: Date;
}

export default function CommitterNewGoalEmail({
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
}: CommitterNewGoalEmailProps) {
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
        You've started a new commitment:
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
        If you miss{" "}
        {goal.scheduleType === "RECURRING" ? "a deadline" : "the deadline"}, you
        owe your partner ${goal.stakeAmount}.
        <br />
        <br />
        When {goal.scheduleType === "RECURRING"
          ? "a deadline"
          : "the deadline"}{" "}
        arrives, you'll receive an email to verify your completion status.
        <br />
        <br />
        Good luck!
        <br />
        <br />
        Cheers,
        <br />
        The GritCommittee
      </Body>
    </Html>
  );
}
