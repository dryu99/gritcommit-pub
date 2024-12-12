import { DB } from "@/database/db";
import { GoalEntryStatus } from "@/types/enums";
import CommitterVerifyForm from "@/ui/components/committer-verify-form";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function CommitterVerifyPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  if (!token || typeof token !== "string") return <div>oops</div>;

  const goalEntry = await DB.get()
    .selectFrom("goalEntry")
    .select(["status", "dueAt"])
    .where("userVerificationToken", "=", token)
    .executeTakeFirst();

  if (!goalEntry || goalEntry.status !== GoalEntryStatus.CommitterVerifying)
    return <div>oops</div>;

  if (new Date() > new Date(goalEntry.dueAt))
    return <div>Due date passed!</div>;

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="mb-6 text-2xl font-bold">Verify Your Commitment</h1>

      <CommitterVerifyForm token={token} />
    </main>
  );
}
