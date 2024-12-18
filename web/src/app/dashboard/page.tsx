import { getSessionUser } from "@/lib/auth/auth.lib";
import { DateUtils, getScheduleText } from "@/lib/date";
import { fetchGoals } from "@/lib/goals/goal.lib";
import { GoalEntryStatus } from "@/types/enums";
import { cn } from "@/ui/classnames";
import { CommitGraph } from "@/ui/components/commit-graph";
import { ClientDate } from "@/ui/components/common/client-date";
import { Link } from "@/ui/components/common/link";
import { redirect } from "next/navigation";

type SearchParamStatus = "completed" | "dropped" | undefined;

export default async function DashboardPage(props: {
  searchParams: Promise<{ status?: SearchParamStatus }>;
}) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/");
  }

  const searchParams = await props.searchParams;

  const goals = await fetchGoals(sessionUser.id);

  // TODO would be nice to be able to do this at db level
  // TODO rn this only accounts for most recent goal entry which should be okay?
  const filteredGoals = goals.filter((goal) => {
    const latestEntry = goal.entries[0];
    if (!latestEntry) return false;

    return searchParams.status === "completed"
      ? latestEntry.status === GoalEntryStatus.Completed
      : searchParams.status === "dropped"
        ? latestEntry.status === GoalEntryStatus.Failed
        : [
            GoalEntryStatus.Pending,
            GoalEntryStatus.CommitterVerifying,
            GoalEntryStatus.PartnerVerifying,
          ].includes(latestEntry.status);
  });

  // TODO would prob be better to handle this at the db level
  //      also it should prob be immutable lol
  // filteredGoals.sort((a, b) => {
  //   if (a.entries[0] === undefined || b.entries[0] === undefined) return 0;

  //   const dueAtDiff =
  //     new Date(a.entries[0].dueAt).getTime() -
  //     new Date(b.entries[0].dueAt).getTime();

  //   return dueAtDiff !== 0
  //     ? dueAtDiff
  //     : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  // });

  return (
    <div className="flex flex-col items-center">
      <CommitGraph
        dates={goals.flatMap((goal) =>
          goal.entries.map((entry) => new Date(entry.createdAt)),
        )}
        includeNewGoalButton
      />
      <CommitLine height={20} includeNode />
      {goals.length > 0 ? (
        <>
          <GoalStatusFilters currentStatus={searchParams.status} />
          <CommitLine height={10} />
        </>
      ) : (
        <div className="mx-auto text-center text-2xl opacity-50">😴</div>
      )}
      <div className="mb-8 flex w-full flex-col text-xs sm:w-[500px]">
        {goals.length > 0 && filteredGoals.length === 0 && (
          <div className="mx-auto text-center text-2xl opacity-50">😴</div>
        )}
        {filteredGoals.map((goal, i) => {
          const latestEntry = goal.entries[0];
          const scheduleText = getScheduleText(goal);

          // TODO consider moving this to a client component like the ClientDate
          //      rn this will always show usertimezone date even if user is in diff timezone
          const daysLeft = latestEntry
            ? DateUtils.dayjs(latestEntry.dueAt)
                .tz(sessionUser.timezone)
                .diff(DateUtils.dayjs().tz(sessionUser.timezone), "day")
            : undefined;

          return (
            <div key={goal.id}>
              <div className="rounded-lg border border-neutral-300 p-4 sm:px-6 sm:py-5">
                <h3 className="mb-1 flex items-center justify-between text-brand">
                  <div>commit {goal.id.split("-")[0]}</div>
                  {latestEntry && (
                    <div className="flex items-center gap-2">
                      <span
                        className={cn({
                          "text-red-500": latestEntry.status === "FAILED",
                          "text-green-600": latestEntry.status === "COMPLETED",
                          "text-yellow-500": latestEntry.status === "PENDING",
                          "text-blue-500":
                            latestEntry.status === "COMMITTER_VERIFYING" ||
                            latestEntry.status === "PARTNER_VERIFYING",
                        })}
                      >
                        {latestEntry.status === "PENDING"
                          ? daysLeft === 1
                            ? "DUE TOMORROW"
                            : daysLeft === 0
                              ? "DUE TODAY"
                              : `${daysLeft} DAYS LEFT`
                          : latestEntry.status === "COMMITTER_VERIFYING"
                            ? "CHECK EMAIL"
                            : latestEntry.status === "PARTNER_VERIFYING"
                              ? "PARTNER VERIFYING"
                              : ""}
                      </span>
                      <div
                        className={cn("h-2 w-2 rounded-full", {
                          "bg-red-500": latestEntry.status === "FAILED",
                          "bg-yellow-500": latestEntry.status === "PENDING",
                          "bg-green-600": latestEntry.status === "COMPLETED",
                          "bg-blue-500":
                            latestEntry.status === "COMMITTER_VERIFYING" ||
                            latestEntry.status === "PARTNER_VERIFYING",
                        })}
                      />
                    </div>
                  )}
                </h3>
                <div className="text-primary">
                  <div
                    className={cn("grid", {
                      "grid-cols-[90px_1fr]":
                        goal.scheduleType === "ONCE" ||
                        goal.scheduleType === "RECURRING",
                    })}
                  >
                    {/* TODO add highlighting when due date gets closer */}
                    {latestEntry && (
                      <>
                        <div>Due:</div>
                        <div>
                          <ClientDate date={latestEntry.dueAt} />
                        </div>
                      </>
                    )}
                    <div>Stake:</div>
                    <div className="text-green-600">${goal.stakeAmount}</div>
                    <div>Partner:</div>
                    <div>{goal.partnerEmail}</div>
                    <div>Schedule:</div>
                    <div>{scheduleText}</div>

                    {/* <div>Start Date:</div>
                    <div>
                      {new Date(goal.createdAt).toLocaleString(undefined, {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div> */}
                  </div>

                  <div className="ml-6 mt-5 whitespace-pre-wrap text-primary">
                    {goal.description}
                  </div>
                </div>
              </div>
              {i !== filteredGoals.length - 1 && <CommitLine includeNode />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const CommitLine = ({
  height = 20,
  includeNode,
}: {
  height?: number;
  includeNode?: boolean;
}) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-[2px] bg-neutral-300"
        style={{ height: `${height}px` }}
      />
      {includeNode && (
        <div className="h-2 w-2 rounded-full border-2 border-neutral-300 bg-neutral-300" />
      )}
      <div
        className="w-[2px] bg-neutral-300"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};

// TODO clicking on links feels clunky because we're using SSR. to solve this we can either do client side rendering OR do some caching
const GoalStatusFilters = ({
  currentStatus,
}: {
  currentStatus?: SearchParamStatus;
}) => {
  const baseLinkStyles =
    "px-4 py-2 text-center text-xs transition-colors hover:bg-neutral-300 rounded-md flex items-center justify-center min-h-[32px]";
  const activeLinkStyles =
    "bg-primary font-medium text-primary hover:bg-primary";
  const inactiveLinkStyles = "text-gray-500 bg-neutral-200";

  return (
    <div className="grid w-full grid-cols-3 gap-1 rounded-md border border-neutral-300 bg-neutral-200 sm:w-[500px]">
      <Link
        href={`/dashboard`}
        className={cn(baseLinkStyles, {
          [activeLinkStyles]: currentStatus === undefined,
          [inactiveLinkStyles]: currentStatus !== undefined,
        })}
      >
        In Progress
      </Link>
      <Link
        href={`/dashboard?status=completed`}
        className={cn(baseLinkStyles, {
          [activeLinkStyles]: currentStatus === "completed",
          [inactiveLinkStyles]: currentStatus !== "completed",
        })}
      >
        Completed
      </Link>
      <Link
        href={`/dashboard?status=dropped`}
        className={cn(baseLinkStyles, {
          [activeLinkStyles]: currentStatus === "dropped",
          [inactiveLinkStyles]: currentStatus !== "dropped",
        })}
      >
        Dropped
      </Link>
    </div>
  );
};
