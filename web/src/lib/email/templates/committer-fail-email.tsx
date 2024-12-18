import { Config } from "@/lib/config";
import { CompleteGoalEntry, mockCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { ScheduleType } from "@/types/enums";
import { Body, Html } from "@react-email/components";
import { EmailCommitment, EmailNextDueDate, EmailSignOff } from "../common";

export default function CommitterFailEmail({
  goalEntry,
  useMockData = Config.NODE_ENV === "development",
}: {
  goalEntry: CompleteGoalEntry;
  useMockData?: boolean;
}) {
  const entry = useMockData ? mockCompleteGoalEntry : goalEntry;

  const committerName = entry.userLastName
    ? `${entry.userFirstName} ${entry.userLastName}`
    : entry.userFirstName;

  return (
    <Html>
      <Body>
        Hi {committerName},
        <br />
        <br />
        The due date for your commitment has passed.
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
        Please send the stake amount of ${entry.goalStakeAmount} to your
        partner.
        <br />
        <br />
        {entry.goalScheduleType === ScheduleType.Recurring &&
          entry.goalScheduleDays && (
            <>
              <EmailNextDueDate
                timezone={entry.userTimezone}
                scheduleDays={entry.goalScheduleDays}
                prevDueDate={entry.dueAt}
              />
              <br />
              <br />
            </>
          )}
        <EmailSignOff />
      </Body>
    </Html>
  );
}
