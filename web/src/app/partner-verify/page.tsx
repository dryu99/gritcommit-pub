import { DB } from "@/database/db";
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
} from "@/lib/goals/goal.lib";
import { GoalEntryStatus } from "@/types/enums";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function PartnerVerifyPage(props: {
  searchParams: SearchParams;
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

// TODO clean this shit up lol
const handlePartnerVerify = async ({
  goalEntry,
  approved,
}: {
  goalEntry: CompleteGoalEntry;
  approved: boolean;
}) => {
  // TODO have to create new goal entry if goal is recurring
  // TODO wrap in trycatch
  await DB.get()
    .updateTable("goalEntry")
    .set({
      status: approved ? GoalEntryStatus.Completed : GoalEntryStatus.Failed,
      partnerVerifiedAt: new Date(),
    })
    .where("id", "=", goalEntry.id)
    .execute();

  await sendEmail({
    recipientEmail: goalEntry.userEmail,
    subject: toCommitterEmailSubject(goalEntry.goalDescription),
    emailHtml: approved
      ? await toEmailHtml(CommitterVerifyApprovedEmail, { goalEntry })
      : await toEmailHtml(CommitterVerifyDeniedEmail, { goalEntry }),
  });
};
