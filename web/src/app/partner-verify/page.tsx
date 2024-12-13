import { DB } from "@/database/db";
import { Goal, GoalEntry, User } from "@/database/db-generated-types";
import { toPartnerVerificationDeadline } from "@/lib/date";
import {
  sendEmail,
  toCommitterEmailSubject,
  toEmailHtml,
} from "@/lib/email/email.lib";
import CommitterVerifyApprovedEmail from "@/lib/email/templates/committer-verify-approved-email";
import CommitterVerifyDeniedEmail from "@/lib/email/templates/committer-verify-denied-email";
import { GoalEntryStatus } from "@/types/enums";
import { Selectable } from "kysely";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function PartnerVerifyPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  const approved = !!searchParams.approved;
  if (!token || typeof token !== "string") return <div>oops</div>;

  const goalEntry = await DB.get()
    .selectFrom("goalEntry")
    .innerJoin("goal", "goal.id", "goalEntry.goalId")
    .innerJoin("user", "user.id", "goal.createdByUserId")
    .select([
      "status",
      "dueAt",
      "id",
      "description",

      "goal.id as goalId",
      "goal.partnerEmail",
      "goal.scheduleDays",
      "goal.scheduleType",
      "goal.stakeAmount",

      "user.email as userEmail",
      "user.firstName as userFirstName",
      "user.lastName as userLastName",
    ])
    .where("partnerVerificationToken", "=", token)
    .executeTakeFirst();

  if (!goalEntry || goalEntry.status !== GoalEntryStatus.PartnerVerifying)
    return <div>oops</div>;

  if (new Date() > toPartnerVerificationDeadline(goalEntry.dueAt))
    return <div>Verification deadline passed!</div>;

  // db and email stuff can happen async
  handlePartnerVerify({
    approved,
    committerUser: {
      email: goalEntry.userEmail,
      firstName: goalEntry.userFirstName,
      lastName: goalEntry.userLastName,
    },
    goal: {
      description: goalEntry.description,
      id: goalEntry.id,
      partnerEmail: goalEntry.partnerEmail,
      scheduleDays: goalEntry.scheduleDays,
      scheduleType: goalEntry.scheduleType,
      stakeAmount: goalEntry.stakeAmount,
    },
    goalEntry: {
      id: goalEntry.id,
      dueAt: goalEntry.dueAt,
    },
  });

  return (
    <main className="mx-auto max-w-lg p-6">
      {approved ? (
        <div>
          <h2>Approved</h2>
          <p>
            The committer has been notified of your approval. Thanks for being a
            good partner!
          </p>
        </div>
      ) : (
        <div>
          <h2>Rejected</h2>
          <p>
            The committer has been notified of your rejection. Thanks for being
            a good partner!
          </p>
        </div>
      )}
    </main>
  );
}

// TODO clean this shit up lol
const handlePartnerVerify = async ({
  committerUser,
  goal,
  goalEntry,
  approved,
}: {
  committerUser: Pick<Selectable<User>, "email" | "firstName" | "lastName">;
  goal: Pick<
    Selectable<Goal>,
    | "description"
    | "id"
    | "partnerEmail"
    | "scheduleDays"
    | "scheduleType"
    | "stakeAmount"
  >;
  goalEntry: Pick<Selectable<GoalEntry>, "id" | "dueAt">;
  approved: boolean;
}) => {
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
    recipientEmail: committerUser.email,
    subject: toCommitterEmailSubject(goal.description),
    emailHtml: approved
      ? await toEmailHtml(CommitterVerifyApprovedEmail, {
          committerUser,
          goal,
          dueDate: new Date(goalEntry.dueAt),
        })
      : await toEmailHtml(CommitterVerifyDeniedEmail, {
          committerUser,
          goal,
          dueDate: new Date(goalEntry.dueAt),
        }),
  });
};
