import { DB } from "@/database/db";
import { getSessionUser } from "@/lib/auth/auth.lib";
import { CURRENT_YEAR } from "@/lib/date";
import { CommitGraph } from "@/ui/components/commit-graph";
import { CommitLine } from "@/ui/components/common/commit-line";
import { ShowGoalFormButton } from "@/ui/components/show-goal-form-button";
import { redirect } from "next/navigation";

export const revalidate = 120;

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

  return (
    <div className="flex flex-col items-center">
      <h1 className={`mb-1 text-2xl font-bold`}>GritCommit</h1>
      <p className={`mb-8 text-center text-sm text-gray-500`}>
        Commit to your goals with grit (and a buddy)
      </p>
      <div className="w-full">
        <CommitGraph
          dates={goalEntries.map((entry) => new Date(entry.createdAt))}
        />
      </div>
      <CommitLine includeNode height={40} />
      <div className={`mx-[100px] h-[2px] w-[580px] bg-neutral-300`} />
      <div className={`flex w-[800px] justify-between`}>
        <div>
          <CommitLine height={20} />
          <div className="h-[400px] w-[220px] rounded-md border border-neutral-300 p-2">
            <h3 className="mb-4 min-h-[48px] text-center font-bold">
              Start a commitment
            </h3>
            <p className="mb-4 text-center text-xs">
              Set a meaningful goal and invite a friend as your accountability
              partner. Optionally add a financial stake to boost your
              commitment.
            </p>
            <div className="flex justify-center">
              <ShowGoalFormButton title="Try it out" />
            </div>
          </div>
        </div>

        <div>
          <CommitLine height={20} />
          <div className="h-[400px] w-[220px] rounded-md border border-neutral-300 p-2">
            <h3 className="mb-4 min-h-[48px] text-center font-bold">
              Receive email/SMS check-ins
            </h3>
            <p className="text-center text-xs">
              Get email/SMS reminders on due dates. Mark your tasks complete,
              and your accountability partner will verify your progress.
            </p>
          </div>
        </div>

        <div>
          <CommitLine height={20} />
          <div className="h-[400px] w-[220px] rounded-md border border-neutral-300 p-2">
            <h3 className="mb-4 min-h-[48px] text-center font-bold">
              Build lasting habits
            </h3>
            <p className="text-center text-xs">
              Stay on track with regular check-ins from your accountability
              buddy. Watch your progress grow as you achieve your goals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
