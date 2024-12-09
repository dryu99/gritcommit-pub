import { Goal } from "@/database/db-generated-types";
import { ScheduleType } from "@/types/enums";
import { Body, Html } from "@react-email/components";
import { Insertable } from "kysely";
import { getScheduleText } from "../days";

interface PartnerNewGoalEmailProps {
  ownerEmail: string;
  goal: Insertable<Goal>;
  nextDueDate: Date;
}

export const PartnerNewGoalEmail = ({
  ownerEmail = "owner@gmail.com",
  goal = {
    description: "Run a marathon",
    stakeAmount: 100,
    scheduleType: ScheduleType.Once,
    createdByUserId: "1",
    id: "1",
    partnerEmail: "partner@gmail.com",
  },
  nextDueDate = new Date("12/20/2024 11:59:59"),
}: PartnerNewGoalEmailProps) => {
  const formattedDate = nextDueDate.toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Html>
      <Body>
        Hi {goal.partnerEmail},
        <br />
        <br />
        {ownerEmail} has started a new commitment and has assigned you as their
        accountability partner:
        <br />
        <br />
        🎯 <strong>Commitment:</strong> {goal.description}
        <br />
        {goal.scheduleType === "ONCE" && (
          <>
            📅 <strong>Due Date:</strong> {formattedDate}
            <br />
          </>
        )}
        💰 <strong>Stake:</strong> ${goal.stakeAmount}
        <br />
        {goal.scheduleType === "RECURRING" && (
          <>
            🔁 <strong>Schedule:</strong> {getScheduleText(goal)}
            <br />
          </>
        )}
        <br />
        If they miss{" "}
        {goal.scheduleType === "RECURRING"
          ? "a check-in"
          : "the deadline"}, {ownerEmail} owes you ${goal.stakeAmount}.
        <br />
        <br />
        When {goal.scheduleType === "RECURRING"
          ? "a check-in"
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
};

export default PartnerNewGoalEmail;
