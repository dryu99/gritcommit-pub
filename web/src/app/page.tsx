import { DAYS } from "@/lib/days";
import { fetchGoals } from "@/lib/goals/goal.helpers";
import { cn } from "@/ui/classnames";
import { ShowGoalFormButton } from "@/ui/components/show-goal-form-button";
import { ibmPlexMono } from "@/ui/fonts";

export default async function HomePage() {
  const goals = await fetchGoals();

  return (
    <div className="flex flex-col items-center">
      <h1 className={`${ibmPlexMono.className} mb-1 text-2xl font-bold`}>
        GritCommit
      </h1>
      <p className="mb-10 flex flex-col items-center gap-1 text-center text-sm text-gray-500 sm:flex-row sm:gap-2">
        Commit to your goals with grit <span>(and a buddy)</span>
      </p>
      <div>
        <ShowGoalFormButton />
      </div>
      <CommitLine />
      <div className="mb-8 flex w-full flex-col text-sm sm:w-[500px]">
        {goals.map((goal, i) => {
          const latestEntry = goal.entries[0];

          let recurringText = "No";
          if (goal.scheduleType === "RECURRING" && goal.scheduleDays) {
            recurringText =
              goal.scheduleDays.length === 7
                ? "Everyday"
                : goal.scheduleDays
                    .map(
                      (scheduleDay) =>
                        DAYS.find((day) => day.index === scheduleDay)?.short,
                    )
                    .join(", ");
          }

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
                        })}
                      >
                        {latestEntry.status === "PENDING"
                          ? "ONGOING"
                          : latestEntry.status}
                      </span>
                      <div
                        className={cn("h-2 w-2 rounded-full", {
                          "bg-red-500": latestEntry.status === "FAILED",
                          "bg-yellow-500": latestEntry.status === "PENDING",
                          "bg-green-500": latestEntry.status === "COMPLETED",
                        })}
                      />
                    </div>
                  )}
                </h3>
                <div className="text-gray-400">
                  <div className={`grid grid-cols-[100px_1fr]`}>
                    {latestEntry && (
                      <>
                        <div>Due Date:</div>
                        <div>
                          {new Date(latestEntry.dueAt).toLocaleString(
                            undefined,
                            {
                              year: "numeric",
                              month: "numeric",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                      </>
                    )}
                    <div>Recurring:</div>
                    <div>{recurringText}</div>
                    <div>Partner:</div>
                    <div>{goal.partnerEmail}</div>
                    <div>Staked:</div>
                    <div className="text-green-500">${goal.stakeAmount}</div>

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
              {i !== goals.length - 1 && <CommitLine />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const CommitLine = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="h-5 w-[2px] bg-gray-900" />
      {/* <div className="w-2 h-2 rounded-full border-2 border-gray-900 bg-gray-900" /> */}
      <div className="h-5 w-[2px] bg-gray-900" />
    </div>
  );
};
