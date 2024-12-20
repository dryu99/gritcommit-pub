import { toPartnerVerificationDeadline } from "@/lib/date";
import {
  sendEmail,
  toCommitterEmailSubject,
  toEmailHtml,
} from "@/lib/email/email.lib";
import CommitterVerifyApprovedEmail from "@/lib/email/templates/committer-verify-approved-email";
import CommitterVerifyDeniedEmail from "@/lib/email/templates/committer-verify-denied-email";
import {
  CompleteGoalEntry,
  fetchCompleteGoalEntry,
  finalizeGoalEntry,
} from "@/lib/goals/goal.lib";
import { GoalEntryStatus } from "@/types/enums";
import { Link } from "@/ui/components/common/link";

export default async function PartnerVerifyPage(props: {
  searchParams: Promise<{ token?: string; approved?: string }>;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  const approved = !!searchParams.approved;
  if (!token || typeof token !== "string")
    return (
      <div className="text-center">
        <p>Something went wrong...</p>
        <Link className="text-brand" href="/dashboard">
          Go back home
        </Link>
      </div>
    );

  const goalEntries = await fetchCompleteGoalEntry({
    partnerVerificationToken: token,
  });

  if (!goalEntries[0]) return <div>Commitment not found!</div>;
  const goalEntry = goalEntries[0];

  if (goalEntry.status !== GoalEntryStatus.PartnerVerifying)
    return (
      <div className="text-center">
        <p>Commitment already verified!</p>
        <Link className="text-brand" href="/dashboard">
          Go back home
        </Link>
      </div>
    );

  if (new Date() > toPartnerVerificationDeadline(goalEntry.dueAt))
    return (
      <div className="text-center">
        <p>Verification deadline passed!</p>
        <Link className="text-brand" href="/dashboard">
          Go back home
        </Link>
      </div>
    );

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
    await finalizeGoalEntry(
      goalEntry,
      approved ? GoalEntryStatus.Completed : GoalEntryStatus.Failed,
    );

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
