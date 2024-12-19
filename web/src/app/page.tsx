import { DB } from "@/database/db";
import { getSessionUser } from "@/lib/auth/auth.lib";
import { CURRENT_YEAR, MINI_COMMIT_GRAPH_YEAR } from "@/lib/date";
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
          <div className="h-[400px] w-[220px] rounded-md border border-neutral-300 px-3 py-4">
            <div className="mb-2 text-center text-sm">1</div>
            <h3 className="mb-4 min-h-[48px] text-center font-bold">
              Start a commitment
            </h3>
            <p className="mb-6 text-center text-sm">
              Set a deadline, assign an accountability partner, and add
              financial stake for motivation.
            </p>
            <div className="flex justify-center">
              {/* TODO analytics */}
              <ShowGoalFormButton title="Try adding a goal" />
            </div>
          </div>
          <CommitLine height={20} />
        </div>

        <div>
          <CommitLine height={20} />
          <div className="h-[400px] w-[220px] rounded-md border border-neutral-300 px-3 py-4">
            <div className="mb-2 text-center text-sm">2</div>
            <h3 className="mb-4 min-h-[48px] text-center font-bold">
              Receive email/SMS check-ins
            </h3>
            <p className="text-center text-sm">
              Get reminders and verify your progress. Your partner confirms your
              achievements.
            </p>
          </div>
          <CommitLine height={20} />
        </div>

        <div>
          <CommitLine height={20} />
          <div className="h-[400px] w-[220px] rounded-md border border-neutral-300 px-3 py-4">
            <div className="mb-2 text-center text-sm">3</div>
            <h3 className="mb-4 min-h-[48px] text-center font-bold">
              Build lasting habits
            </h3>
            <p className={`text-center text-sm`}>
              Build consistency with partner check-ins and watch your progress
              grow.
            </p>
            <div>
              <CommitGraph isMini dates={miniCommitGraphDates} />
            </div>
          </div>
          <CommitLine height={20} />
        </div>
      </div>
      <div className={`mx-[100px] mb-8 h-[2px] w-[580px] bg-neutral-300`} />
    </div>
  );
}

const createDatesByArray = (counts: number[]) => {
  return counts.flatMap((count, index) =>
    count > 0
      ? Array(count)
          .fill(null)
          .map(() => new Date(MINI_COMMIT_GRAPH_YEAR, 0, index + 1))
      : [],
  );
};

const miniCommitGraphDates = createDatesByArray([
  // Jan 1-10
  3, 0, 2, 5, 0, 4, 6, 0, 2, 5,
  // Jan 11-20
  7, 0, 8, 4, 0, 1, 9, 0, 2, 7,
  // Jan 21-30
  4, 0, 3, 6, 0, 2, 5, 0, 4, 8,
  // Jan 31
  0,
  // Feb 1-10
  6, 0, 3, 7, 0, 8, 4, 0, 1, 7,
  // Feb 11-20
  3, 0, 2, 6, 0, 4, 5, 0, 2, 8,
  // Feb 21-25
  3, 0, 9, 0, 7,
]);
