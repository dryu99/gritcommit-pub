import { Goal } from "@/database/db-generated-types";
import { ScheduleType } from "@/types/enums";
import { Body, Html } from "@react-email/components";
import { Insertable } from "kysely";
import { getScheduleText, toFormattedDateText } from "../../days";

interface OwnerGoalDueEmailProps {
  ownerEmail: string;
  goal: Insertable<Goal>;
  nextDueDate: Date;
}

export default function OwnerGoalDueEmail({
  ownerEmail = "owner@gmail.com",
  goal = {
    description: "Run a marathon",
    stakeAmount: 100,
    scheduleType: ScheduleType.Once,
    scheduleDays: [1, 2, 3, 4, 5],
    createdByUserId: "1",
    id: "1",
    partnerEmail: "partner@gmail.com",
  },
  nextDueDate = new Date("12/20/2024 23:59:59"),
}: OwnerGoalDueEmailProps) {
  const formattedDate = toFormattedDateText(nextDueDate);

  return (
    <Html>
      <Body>
        Hi {ownerEmail},
        <br />
        <br />
        Your commitment is due today at 11:59pm:
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
        Please reply to this email before the end of the day with:
        <br />
        <ul>
          <li>
            <strong>Y</strong> - if you completed your commitment
            <ul style={{ margin: "8px 0" }}>
              <li>
                Your partner will verify your response and we'll let you know
                the outcome
              </li>
            </ul>
          </li>
          <li>
            <strong>N</strong> - if you did not complete your commitment.
            <ul style={{ margin: "8px 0" }}>
              <li>
                In this case, please send ${goal.stakeAmount} to your partner at{" "}
                {goal.partnerEmail}.
              </li>
            </ul>
          </li>
        </ul>
        Remember, achieving goals takes time and <strong>grit</strong>. Whether
        you succeeded or not today, keep pushing forward.
        <br />
        <br />
        Cheers,
        <br />
        The GritCommittee
      </Body>
    </Html>
  );
}
