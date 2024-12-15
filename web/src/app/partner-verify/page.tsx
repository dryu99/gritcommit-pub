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
  fetchGoalMessageMetaItems,
  GoalMessageMetaItem,
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

  const goalMessageMeta = await fetchGoalMessageMetaItems({
    partnerVerificationToken: token,
  });

  if (
    !goalMessageMeta ||
    goalMessageMeta.goalEntry.status !== GoalEntryStatus.PartnerVerifying
  )
    return <div>oops</div>;

  if (
    new Date() > toPartnerVerificationDeadline(goalMessageMeta.goalEntry.dueAt)
  )
    return <div>Verification deadline passed!</div>;

  // db and email stuff can happen async
  handlePartnerVerify({
    approved,
    goalMessageMeta,
  });

  return (
    <main className="mx-auto max-w-lg p-6">
      {approved ? (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Approved</h2>
          <p>
            {goalMessageMeta.user.firstName} has been notified of your approval.
            Thanks for being a good partner!
          </p>
        </div>
      ) : (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Rejected</h2>
          <p>
            {goalMessageMeta.user.firstName} has been notified of your
            rejection.
          </p>
        </div>
      )}
    </main>
  );
}

// TODO clean this shit up lol
const handlePartnerVerify = async ({
  goalMessageMeta,
  approved,
}: {
  goalMessageMeta: GoalMessageMetaItem;
  approved: boolean;
}) => {
  const { goalEntry, goal, user } = goalMessageMeta;

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
    recipientEmail: user.email,
    subject: toCommitterEmailSubject(goal.description),
    emailHtml: approved
      ? await toEmailHtml(CommitterVerifyApprovedEmail, {
          committerUser: user,
          goal,
          dueDate: new Date(goalEntry.dueAt),
        })
      : await toEmailHtml(CommitterVerifyDeniedEmail, {
          committerUser: user,
          goal,
          dueDate: new Date(goalEntry.dueAt),
        }),
  });
};
