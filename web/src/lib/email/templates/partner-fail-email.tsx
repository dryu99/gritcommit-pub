import { Goal, User } from "@/database/db-generated-types";
import { ScheduleType } from "@/types/enums";
import { Body, Html } from "@react-email/components";
import { Insertable } from "kysely";

interface PartnerFailConfirmEmailProps {
  committerUser: Insertable<User>;
  goal: Insertable<Goal>;
  nextDueDate: Date;
}

export default function PartnerFailConfirmEmail({
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
}: PartnerFailConfirmEmailProps) {
  const committerName = committerUser.lastName
    ? `${committerUser.firstName} ${committerUser.lastName}`
    : committerUser.firstName;

  return (
    <Html>
      <Body>
        Hi {goal.partnerEmail},
        <br />
        <br />
        {committerName} failed to complete their commitment:
        <br />
        <br />
        🎯 <strong>Commitment:</strong> {goal.description}
        <br />
        💰 <strong>Stake:</strong> ${goal.stakeAmount}
        <br />
        <br />
        They have been prompted to send you ${goal.stakeAmount}.
        <br />
        <br />
        Cheers,
        <br />
        The GritCommittee
      </Body>
    </Html>
  );
}
