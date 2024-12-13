import { DB } from "@/database/db";
import { getSessionUser } from "@/lib/auth/auth.lib";
import { CURRENT_YEAR, DAYS_IN_CURRENT_YEAR } from "@/lib/date";
import { CommitGraph } from "@/ui/components/commit-graph";
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

  const commitSquares = Array.from(
    { length: DAYS_IN_CURRENT_YEAR },
    (_, i) => ({
      date: new Date(CURRENT_YEAR, 0, i + 1),
      commits: 0,
    }),
  );

  for (const goalEntry of goalEntries) {
    const createdDate = new Date(goalEntry.createdAt);
    const dayOfYear = Math.floor(
      (createdDate.getTime() - new Date(CURRENT_YEAR, 0, 1).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const commitSquare = commitSquares[dayOfYear];
    if (commitSquare) {
      commitSquare.commits++;
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className={`${ibmPlexMono.className} mb-1 text-2xl font-bold`}>
        GritCommit
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Commit with grit (and a buddy)
      </p>
      <div className="mb-8">
        <CommitGraph commitSquares={commitSquares} />
      </div>
      <LoginForm />
    </div>
  );
}
