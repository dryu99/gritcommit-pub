import { DB } from "@/database/db";
import { toPartnerVerificationDeadline } from "@/lib/days";
import { GoalEntryStatus } from "@/types/enums";
import CommitterVerifyForm from "@/ui/components/committer-verify-form";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function PartnerVerifyPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  if (!token || typeof token !== "string") return <div>oops</div>;

  const goalEntry = await DB.get()
    .selectFrom("goalEntry")
    .select(["status", "dueAt"])
    .where("partnerVerificationToken", "=", token)
    .executeTakeFirst();

  if (!goalEntry || goalEntry.status !== GoalEntryStatus.PartnerVerifying)
    return <div>oops</div>;

  if (new Date() > toPartnerVerificationDeadline(goalEntry.dueAt))
    return <div>Verification deadline passed!</div>;

  return (
    <main className="mx-auto max-w-lg p-6">
      <CommitterVerifyForm token={token} />
    </main>
  );
}
