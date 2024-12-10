import { Goal, User } from "@/database/db-generated-types";
import { ScheduleType } from "@/types/enums";
import { Body, Html } from "@react-email/components";
import { Insertable } from "kysely";
import { getScheduleText, toFormattedDateText } from "../../days";

interface PartnerNewGoalEmailProps {
  committerUser: Insertable<User>;
  goal: Insertable<Goal>;
  nextDueDate: Date;
}

export default function PartnerNewGoalEmail({
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
}: PartnerNewGoalEmailProps) {
  const formattedDate = toFormattedDateText(nextDueDate);

  const committerName = committerUser.lastName
    ? `${committerUser.firstName} ${committerUser.lastName}`
    : committerUser.firstName;

  return (
    <Html>
      <Body>
        Hi {goal.partnerEmail},
        <br />
        <br />
        {committerName} has started a new commitment and has assigned you as
        their accountability partner:
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
        If they miss{" "}
        {goal.scheduleType === "RECURRING"
          ? "a deadline"
          : "the deadline"}, {committerName} owes you ${goal.stakeAmount}.
        <br />
        <br />
        When {goal.scheduleType === "RECURRING"
          ? "a deadline"
          : "the deadline"}{" "}
        arrives, you'll receive an email to verify whether they completed their
        commitment.
        <br />
        <br />
        Help keep them accountable!
        <br />
        <br />
        Cheers,
        <br />
        The GritCommittee
      </Body>
    </Html>
  );
}
