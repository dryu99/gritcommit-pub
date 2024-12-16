import { DB } from "@/database/db";
import {
  toNextRecurringDueDate,
  toPartnerVerificationDeadline,
} from "@/lib/date";
import {
  sendEmail,
  toCommitterEmailSubject,
  toEmailHtml,
} from "@/lib/email/email.lib";
import CommitterVerifyApprovedEmail from "@/lib/email/templates/committer-verify-approved-email";
import CommitterVerifyDeniedEmail from "@/lib/email/templates/committer-verify-denied-email";
import { generateModelId } from "@/lib/generate-model-id";
import {
  CompleteGoalEntry,
  fetchCompleteGoalEntry,
} from "@/lib/goals/goal.lib";
import { GoalEntryStatus } from "@/types/enums";

export default async function PartnerVerifyPage(props: {
  searchParams: Promise<{ token?: string; approved?: string }>;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  const approved = !!searchParams.approved;
  if (!token || typeof token !== "string") return <div>oops</div>;

  const goalEntries = await fetchCompleteGoalEntry({
    partnerVerificationToken: token,
  });

  if (!goalEntries[0]) return <div>oops</div>;
  const goalEntry = goalEntries[0];

  if (goalEntry.status !== GoalEntryStatus.PartnerVerifying)
    return <div>oops</div>;

  if (new Date() > toPartnerVerificationDeadline(goalEntry.dueAt))
    return <div>Verification deadline passed!</div>;

  // db and email stuff can happen async
  handlePartnerVerify({
    approved,
    goalEntry,
  });

  return (
    <main className="mx-auto max-w-lg p-6">
      {approved ? (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Approved</h2>
          <p>
            {goalEntry.userFirstName} has been notified of your approval. Thanks
            for being a good partner!
          </p>
        </div>
      ) : (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Rejected</h2>
          <p>
            {goalEntry.userFirstName} has been notified of your rejection.
            rejection.
          </p>
        </div>
      )}
    </main>
  );
}

const handlePartnerVerify = async ({
  goalEntry,
  approved,
}: {
  goalEntry: CompleteGoalEntry;
  approved: boolean;
}) => {
  try {
    await DB.get()
      .transaction()
      .execute(async (trx) => {
        // Update existing goal entry
        await trx
          .updateTable("goalEntry")
          .set({
            status: approved
              ? GoalEntryStatus.Completed
              : GoalEntryStatus.Failed,
            partnerVerifiedAt: new Date(),
          })
          .where("id", "=", goalEntry.id)
          .execute();

        // Create next recurring entry if applicable
        if (
          goalEntry.goalScheduleType === "RECURRING" &&
          goalEntry.goalScheduleDays
        ) {
          await trx
            .insertInto("goalEntry")
            .values({
              id: generateModelId(),
              status: GoalEntryStatus.Pending,
              goalId: goalEntry.goalId,
              dueAt: toNextRecurringDueDate({
                timezone: goalEntry.userTimezone,
                scheduleDays: goalEntry.goalScheduleDays,
                prevDueDate: goalEntry.dueAt,
              }),
            })
            .execute();
        }
      });

    // Send email after transaction succeeds
    await sendEmail({
      recipientEmail: goalEntry.userEmail,
      subject: toCommitterEmailSubject(goalEntry.goalDescription),
      emailHtml: approved
        ? await toEmailHtml(CommitterVerifyApprovedEmail, { goalEntry })
        : await toEmailHtml(CommitterVerifyDeniedEmail, { goalEntry }),
    });
  } catch (error) {
    // TODO sentry
    console.error("Failed to process partner verification:", error);
  }
};
