import { Config } from "@/lib/config";
import { toFormattedDateText } from "@/lib/date";
import { CompleteGoalEntry, mockCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { ScheduleType } from "@/types/enums";
import { Body, Html } from "@react-email/components";
import { EmailCommitment, EmailSignOff } from "../common";

export default function CommitterNewGoalEmail({
  goalEntry,
}: {
  goalEntry: CompleteGoalEntry;
}) {
  const entry =
    !goalEntry && Config.NODE_ENV === "development"
      ? mockCompleteGoalEntry
      : goalEntry;

  const committerName = entry.userLastName
    ? `${entry.userFirstName} ${entry.userLastName}`
    : entry.userFirstName;

  return (
    <Html>
      <Body>
        Hi {committerName},
        <br />
        <br />
        You've started a new commitment:
        <br />
        <br />
        <EmailCommitment
          timezone={entry.userTimezone}
          dueAt={entry.dueAt}
          description={entry.goalDescription}
          stakeAmount={entry.goalStakeAmount}
          scheduleType={entry.goalScheduleType}
          scheduleDays={entry.goalScheduleDays}
          partnerEmail={entry.goalPartnerEmail}
        />
        <br />
        <br />
        If you miss{" "}
        {entry.goalScheduleType === "RECURRING" ? "a deadline" : "the deadline"}
        , you owe your partner ${entry.goalStakeAmount}.
        <br />
        <br />
        When{" "}
        {entry.goalScheduleType === "RECURRING"
          ? "a deadline"
          : "the deadline"}{" "}
        arrives, you'll receive an email to verify your completion status.
        <br />
        <br />
        {entry.goalScheduleType === ScheduleType.Recurring &&
          entry.goalScheduleDays && (
            <>
              Your first check-in is{" "}
              {toFormattedDateText(entry.dueAt, entry.userTimezone)}
              <br />
              <br />
            </>
          )}
        Good luck!
        <br />
        <br />
        <EmailSignOff />
      </Body>
    </Html>
  );
}
