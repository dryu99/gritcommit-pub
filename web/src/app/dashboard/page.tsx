import { getSessionUser } from "@/lib/auth/auth.lib";
import { getScheduleText } from "@/lib/days";
import { fetchGoals } from "@/lib/goals/goal.lib";
import { cn } from "@/ui/classnames";
import { ClientDate } from "@/ui/components/common/client-date";
import { ShowGoalFormButton } from "@/ui/components/show-goal-form-button";
import { ibmPlexMono } from "@/ui/fonts";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/");
  }

  const goals = await fetchGoals(sessionUser.id);

  return (
    <div className="flex flex-col items-center">
      <h1 className={`${ibmPlexMono.className} mb-1 text-2xl font-bold`}>
        GritCommit
      </h1>
      <p className="mb-10 text-sm text-gray-500">
        Commit with grit (and a buddy)
      </p>
      <div>
        <ShowGoalFormButton />
      </div>
      <CommitLine />
      <div className="mb-8 flex w-full flex-col text-sm sm:w-[500px]">
        {goals.map((goal, i) => {
          const latestEntry = goal.entries[0];
          const scheduleText = getScheduleText(goal);

          return (
            <div key={goal.id}>
              <div className="rounded-lg bg-gray-900 p-4 sm:px-6 sm:py-5">
                <h3 className="mb-1 flex items-center justify-between text-orange-500">
                  <div>commit #{goals.length - i}</div>
                  {latestEntry && (
                    <div className="flex items-center gap-2">
                      <span
                        className={cn({
                          "text-red-500": latestEntry.status === "FAILED",
                          "text-green-500": latestEntry.status === "COMPLETED",
                          "text-yellow-500": latestEntry.status === "PENDING",
                          "text-blue-500":
                            latestEntry.status === "COMMITTER_VERIFYING" ||
                            latestEntry.status === "PARTNER_VERIFYING",
                        })}
                      >
                        {latestEntry.status === "PENDING"
                          ? "ONGOING"
                          : latestEntry.status === "COMMITTER_VERIFYING"
                            ? "CHECK EMAIL"
                            : latestEntry.status === "PARTNER_VERIFYING"
                              ? "PARTNER VERIFYING"
                              : latestEntry.status}
                      </span>
                      <div
                        className={cn("h-2 w-2 rounded-full", {
                          "bg-red-500": latestEntry.status === "FAILED",
                          "bg-yellow-500": latestEntry.status === "PENDING",
                          "bg-green-500": latestEntry.status === "COMPLETED",
                          "bg-blue-500":
                            latestEntry.status === "COMMITTER_VERIFYING" ||
                            latestEntry.status === "PARTNER_VERIFYING",
                        })}
                      />
                    </div>
                  )}
                </h3>
                <div className="text-gray-400">
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
                    <div className="text-green-500">${goal.stakeAmount}</div>
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

                  <div className="ml-4 mt-4 whitespace-pre-wrap text-white">
                    {goal.description}
                  </div>
                </div>
              </div>
              <CommitLine />
            </div>
          );
        })}
        <div className="mx-auto text-center text-2xl">😴</div>
      </div>
    </div>
  );
}

const CommitLine = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="h-5 w-[2px] bg-gray-900" />
      <div className="h-2 w-2 rounded-full border-2 border-gray-900 bg-gray-900" />
      <div className="h-5 w-[2px] bg-gray-900" />
    </div>
  );
};
