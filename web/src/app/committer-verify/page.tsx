import CommitterVerifyForm from "@/ui/components/committer-verify-form";

export default async function CommitterVerifyPage({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  // TODO fetch goal with token to see if user already verified (can check status)

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="mb-6 text-2xl font-bold">Verify Your Commitment</h1>

      <CommitterVerifyForm />
    </main>
  );
}
