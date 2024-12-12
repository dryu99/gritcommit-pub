import { DB } from "@/database/db";
import { GoalEntryStatus } from "@/types/enums";
import CommitterVerifyForm from "@/ui/components/committer-verify-form";

export default async function CommitterVerifyPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;
  if (!token) return <div>oops</div>;

  const goalEntry = await DB.get()
    .selectFrom("goalEntry")
    .select(["status"])
    .where("userVerificationToken", "=", token)
    .executeTakeFirst();

  if (!goalEntry || goalEntry.status !== GoalEntryStatus.CommitterVerifying)
    return <div>oops</div>;

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="mb-6 text-2xl font-bold">Verify Your Commitment</h1>

      <CommitterVerifyForm />
    </main>
  );
}
