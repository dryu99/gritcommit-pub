import { ScheduleType } from "@/types/enums";
import { getScheduleText, SafeDate } from "../date";

import { toFormattedDateText } from "../date";

export const EmailCommitment = ({
  dueAt,
  description,
  stakeAmount,
  scheduleType,
  scheduleDays,
  partnerEmail,
}: {
  dueAt: SafeDate;
  description: string;
  stakeAmount: string;
  scheduleType: ScheduleType;
  scheduleDays: number[] | null;
  partnerEmail?: string;
}) => {
  const formattedDueDate = toFormattedDateText(dueAt);

  return (
    <>
      🎯 <strong>Commitment:</strong> {description}
      <br />
      💰 <strong>Stake:</strong> ${stakeAmount}
      {partnerEmail && (
        <>
          <br />
          🤝 <strong>Accountability Partner:</strong> {partnerEmail}
        </>
      )}
      {scheduleType === "ONCE" && (
        <>
          <br />
          📅 <strong>Due Date:</strong> {formattedDueDate}
        </>
      )}
      {scheduleType === "RECURRING" && (
        <>
          <br />
          📅 <strong>Schedule:</strong>{" "}
          {getScheduleText({ scheduleType, scheduleDays })}
        </>
      )}
    </>
  );
};
