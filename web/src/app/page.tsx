import { DB } from "@/database/db";
import { getSessionUser } from "@/lib/auth/auth.lib";
import { CURRENT_YEAR, MINI_COMMIT_GRAPH_YEAR } from "@/lib/date";
import { cn } from "@/ui/classnames";
import { CommitGraph } from "@/ui/components/commit-graph";
import { buttonStyle } from "@/ui/components/common/button";
import { CommitLine } from "@/ui/components/common/commit-line";
import { Link } from "@/ui/components/common/link";
import { LoginForm } from "@/ui/components/login-form";
import { ShowGoalFormButton } from "@/ui/components/show-goal-form-button";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";

export const revalidate = 120;

export default async function HomePage() {
  const sessionUser = await getSessionUser();

  const goalEntries = await DB.get()
    .selectFrom("goalEntry")
    .select(["createdAt"])
    .where("createdAt", ">=", new Date(CURRENT_YEAR, 0, 1))
    .where("createdAt", "<=", new Date(CURRENT_YEAR, 11, 31))
    .execute();

  return (
    <div className="flex flex-col items-center">
      <div className="mb-16">
        <h1 className={`mb-4 text-center text-5xl font-bold`}>
          Email/SMS <br className="hidden sm:block" />
          Commitment Contracts
        </h1>
        <p className="text-center text-gray-600">
          Stay accountable through email or SMS reminders.{" "}
          <br className="hidden sm:block" />
          No apps, no downloads — just simple accountability.
        </p>
      </div>

      <div className="w-full">
        <CommitGraph
          dates={goalEntries.map((entry) => new Date(entry.createdAt))}
          isOnHomePage
        />
      </div>
      <CommitLine includeNode height={20} />
      <Link
        href={sessionUser ? `/dashboard` : `/signup`}
        className={cn(buttonStyle, "px-5 py-2 text-sm")}
      >
        {sessionUser ? "Go to dashboard" : "Get started"}
      </Link>
      <CommitLine includeNode height={20} />
      <HorizontalCommitLine />
      <div
        className={`flex flex-col items-center sm:w-[800px] sm:flex-row sm:justify-between`}
      >
        <div>
          <CommitLine hideOnMobile height={20} />
          <div className="h-[300px] w-full rounded-md border border-neutral-300 px-3 py-4 sm:h-[400px] sm:w-[220px]">
            <div className="mb-2 text-center text-sm">1</div>
            <h3 className="mb-4 min-h-[48px] text-center font-bold">
              Start a commitment
            </h3>
            <p className="mb-12 text-center text-sm">
              Set a deadline, assign an accountability partner, and add
              financial stake for motivation.
            </p>
            <div className="flex justify-center">
              {/* TODO analytics */}
              <ShowGoalFormButton title="Try it out" isDemo />
            </div>
          </div>
          <CommitLine height={20} />
        </div>

        <div>
          <CommitLine hideOnMobile height={20} />
          <div className="h-[300px] w-full rounded-md border border-neutral-300 px-3 py-4 sm:h-[400px] sm:w-[220px]">
            <div className="mb-2 text-center text-sm">2</div>
            <h3 className="mb-4 min-h-[48px] text-center font-bold">
              Receive email/SMS check-ins
            </h3>
            <p className="mb-10 text-center text-sm">
              Get reminders and verify your progress. Your partner confirms your
              achievements.
            </p>
            <div className="my-auto flex justify-center gap-4">
              <EnvelopeIcon className="h-10 w-10" />
              <PhoneIcon className="h-10 w-10" />
            </div>
          </div>
          <CommitLine height={20} />
        </div>

        <div>
          <CommitLine hideOnMobile height={20} />
          <div className="h-[300px] w-full rounded-md border border-neutral-300 px-3 py-4 sm:h-[400px] sm:w-[220px]">
            <div className="mb-2 text-center text-sm">3</div>
            <h3 className="mb-4 min-h-[48px] text-center font-bold">
              Build lasting habits
            </h3>
            <p className={`mb-4 text-center text-sm`}>
              Build consistency with partner check-ins and watch your progress
              grow.
            </p>
            <div>
              <CommitGraph isMini dates={miniCommitGraphDates} />
            </div>
          </div>
          <CommitLine height={20} hideOnMobile />
        </div>
      </div>
      <HorizontalCommitLine />
      <CommitLine height={20} includeNode />

      <div
        className={`mb-8 w-full rounded-md border border-neutral-300 p-6 sm:w-[400px]`}
      >
        <LoginForm />
      </div>
    </div>
  );
}

const HorizontalCommitLine = () => {
  return (
    <div
      className={`mx-[100px] hidden h-[2px] w-[580px] bg-neutral-300 sm:block`}
    />
  );
};

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
  // Jan 1-10 (lots of gaps)
  1, 0, 0, 0, 0, 1, 0, 0, 1, 0,
  // Jan 11-20 (still inconsistent)
  1, 0, 0, 0, 0, 0, 0, 1, 0, 2,
  // Jan 21-31 (starting to be more regular)
  1, 0, 2, 0, 1, 1, 0, 1, 0, 2, 0,
  // Feb 1-10 (more consistent)
  1, 2, 1, 0, 2, 1, 2, 1, 0, 2,
  // Feb 11-20 (very consistent)
  1, 2, 1, 2, 1, 2, 1, 2, 1, 2,
  // Feb 21-25 (maintained consistency)
  1, 2, 1, 2, 1,
]);
