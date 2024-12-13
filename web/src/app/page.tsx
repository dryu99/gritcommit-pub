import { DB } from "@/database/db";
import { getSessionUser } from "@/lib/auth/auth.lib";
import { CURRENT_YEAR } from "@/lib/date";
import { CommitGraph, toCommitSquares } from "@/ui/components/commit-graph";
import { LoginForm } from "@/ui/components/login-form";
import { ibmPlexMono } from "@/ui/fonts";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    redirect("/dashboard");
  }

  const goalEntries = await DB.get()
    .selectFrom("goalEntry")
    .select(["createdAt"])
    .where("createdAt", ">=", new Date(CURRENT_YEAR, 0, 1))
    .where("createdAt", "<=", new Date(CURRENT_YEAR, 11, 31))
    .execute();

  const commitSquares = toCommitSquares(
    goalEntries.map((entry) => new Date(entry.createdAt)),
  );

  return (
    <div className="flex flex-col items-center">
      <h1 className={`${ibmPlexMono.className} mb-1 text-2xl font-bold`}>
        GritCommit
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Commit with grit (and a buddy)
      </p>
      <div className="mb-8 w-full">
        <CommitGraph commitSquares={commitSquares} />
      </div>
      <LoginForm />
    </div>
  );
}
