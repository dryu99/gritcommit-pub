import { Config } from "@/lib/config";
import { CompleteGoalEntry, mockCompleteGoalEntry } from "@/lib/goals/goal.lib";
import { ScheduleType } from "@/types/enums";
import { Body, Html } from "@react-email/components";
import { EmailCommitment, EmailNextDueDate, EmailSignOff } from "../common";

export default function CommitterVerifyDeniedEmail({
  goalEntry,
  useMockData = Config.NODE_ENV === "development",
}: {
  goalEntry: CompleteGoalEntry;
  useMockData?: boolean;
}) {
  const entry = useMockData ? mockCompleteGoalEntry : goalEntry;

  const name = entry.userLastName
    ? `${entry.userFirstName} ${entry.userLastName}`
    : entry.userFirstName;

  return (
    <Html>
      <Body>
        Hi {name},
        <br />
        <br />
        Your accountability partner has denied your submission for the following
        commitment:
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
        {/* TODO inclyude links to etransfer */}
        As per the contract, please send your partner ${entry.goalStakeAmount}.
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
        {/* TODO maybe remove this */}
        Remember, achieving your goals requires patience and{" "}
        <strong>grit</strong>. Even though things didn't work out this time,
        keep pushing forward.
        <br />
        <br />
        <EmailSignOff />
      </Body>
    </Html>
  );
}

// https://secure.royalbank.com/statics/login-service-ui/index#/full/signin?LANGUAGE=ENGLISH
