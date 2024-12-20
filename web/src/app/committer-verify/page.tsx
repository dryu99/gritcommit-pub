import { DB } from "@/database/db";
import { GoalEntryStatus } from "@/types/enums";
import CommitterVerifyForm from "@/ui/components/committer-verify-form";
import { Link } from "@/ui/components/common/link";

export default async function CommitterVerifyPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  if (!token || typeof token !== "string") return <div>oops</div>;

  const goalEntry = await DB.get()
    .selectFrom("goalEntry")
    .select(["status", "dueAt"])
    .where("userVerificationToken", "=", token)
    .executeTakeFirst();

  if (!goalEntry)
    return (
      <div className="text-center">
        <p>
          Something went wrong... Please contact admin@gritcommit.app for help
        </p>
        <Link className="text-brand" href="/dashboard">
          Go back home
        </Link>
      </div>
    );

  if (goalEntry.status !== GoalEntryStatus.CommitterVerifying)
    return (
      <div className="text-center">
        <p>You've already verified this commitment!</p>
        <Link className="text-brand" href="/dashboard">
          Go back home
        </Link>
      </div>
    );

  // this is UTC to UTC comparison so it should be fine
  if (new Date() > new Date(goalEntry.dueAt))
    return (
      <div className="text-center">
        <p>Due date passed!</p>
        <Link className="text-brand" href="/dashboard">
          Go back home
        </Link>
      </div>
    );

  return (
    <main className="mx-auto max-w-lg p-6">
      <CommitterVerifyForm token={token} goalEntry={goalEntry} />
    </main>
  );
}
