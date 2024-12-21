import { ScheduleType } from "@/types/enums";
import { getScheduleText, SafeDate, toNextRecurringDueDate } from "../date";

import { Link } from "@react-email/components";
import { toFormattedDateText } from "../date";

export const EmailCommitment = ({
  dueAt,
  description,
  stakeAmount,
  scheduleType,
  scheduleDays,
  partnerEmail,
  timezone,
}: {
  dueAt: SafeDate;
  description: string;
  stakeAmount: string;
  scheduleType: ScheduleType;
  scheduleDays: number[] | null;
  partnerEmail?: string;
  timezone?: string;
}) => {
  const formattedDueDate = toFormattedDateText(dueAt, timezone);

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

export const EmailSignOff = () => {
  return (
    <>
      Cheers,
      <br />
      The GritCommittee
      <br />
      --
      <br />
      <Link href="https://www.gritcommit.app">www.gritcommit.app</Link>
    </>
  );
};

export const EmailNextDueDate = ({
  timezone,
  scheduleDays,
  prevDueDate,
}: {
  timezone: string;
  scheduleDays: number[];
  prevDueDate: SafeDate;
}) => {
  return (
    <>
      The next check-in is{" "}
      {toFormattedDateText(
        toNextRecurringDueDate({
          timezone,
          scheduleDays,
          prevDueDate,
        }),
        timezone,
      )}
    </>
  );
};
