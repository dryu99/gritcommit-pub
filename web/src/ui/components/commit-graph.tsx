"use client";

import { CURRENT_YEAR, DAYS_IN_CURRENT_YEAR } from "@/lib/date";
import { cn } from "../classnames";

export type CommitSquare = {
  date: Date;
  commits: number;
};

const COMMIT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "",
];

export const CommitGraph = ({ dates }: { dates: Date[] }) => {
  const commitSquares = toCommitSquares(dates);
  const firstDateOfTheYear = commitSquares[0]!.date;

  const dayIndexCommitSquareMatrix = commitSquares.reduce(
    (acc, commit) => {
      const dayIndex = commit.date.getUTCDay();
      if (!acc[dayIndex]) acc[dayIndex] = [];
      acc[dayIndex].push(commit);
      return acc;
    },
    [] as (typeof commitSquares)[],
  );

  const maxCommits = Math.max(...commitSquares.map((c) => c.commits));
  const totalCommits = commitSquares.reduce(
    (acc, commit) => acc + commit.commits,
    0,
  );

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[740px]">
        <h4 className="text-sm text-gray-500">
          {totalCommits} commitment{totalCommits === 1 ? "" : "s"} in{" "}
          {CURRENT_YEAR}
        </h4>
        <div className="overflow-x-auto rounded-lg border border-neutral-300 p-4 pl-8 pr-2">
          <div className="-mb-[1px] flex w-[698px] justify-between">
            {COMMIT_MONTHS.map((month) => (
              <span
                key={month}
                className="whitespace-nowrap text-xs text-primary"
              >
                {month}
              </span>
            ))}
          </div>

          <table className="border-separate border-spacing-[3px]">
            <tbody>
              {dayIndexCommitSquareMatrix.map((commitSquares, dayIndex) => {
                const startsOnSecondWeek =
                  commitSquares[0]!.date.getUTCDate() >
                  // days in first week
                  7 - firstDateOfTheYear.getUTCDay();

                return (
                  <tr key={dayIndex} className="relative">
                    {[0, 2, 4, 6].includes(dayIndex) && (
                      <td className="absolute -left-6 h-[10px]" />
                    )}
                    {dayIndex === 1 && (
                      <td className="absolute -left-6 bottom-1 h-[10px] text-xs text-primary">
                        Mon
                      </td>
                    )}
                    {dayIndex === 3 && (
                      <td className="absolute -left-6 bottom-1 h-[10px] text-xs text-primary">
                        Wed
                      </td>
                    )}
                    {dayIndex === 5 && (
                      <td className="absolute -left-6 bottom-1 h-[10px] text-xs text-primary">
                        Fri
                      </td>
                    )}
                    {startsOnSecondWeek && <td className="h-[10px]" />}
                    {commitSquares.map((commitSquare) => {
                      const opacity =
                        (commitSquare.commits / maxCommits) * 0.8 + 0.2;
                      return (
                        <td
                          key={commitSquare.date.toISOString()}
                          className={cn(
                            "group relative h-[10px] w-[10px] min-w-[10px]",
                            "rounded-sm",
                            `opacity-${opacity * 100}`,
                            commitSquare.commits > 0
                              ? "bg-green-400"
                              : "bg-neutral-300",
                          )}
                          onMouseEnter={(e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const x = rect.left + rect.width / 2;
                            const y = rect.top;
                            document.documentElement.style.setProperty(
                              "--tooltip-x",
                              `${x}px`,
                            );
                            document.documentElement.style.setProperty(
                              "--tooltip-y",
                              `${y}px`,
                            );
                          }}
                        >
                          <div
                            className={cn(
                              "pointer-events-none fixed z-50 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white",
                              "opacity-0 transition-[opacity] delay-150 duration-150",
                              "invisible group-hover:visible group-hover:opacity-100",
                              "left-[var(--tooltip-x)] top-[var(--tooltip-y)]",
                              "-translate-x-1/2 -translate-y-7",
                            )}
                          >
                            {`${commitSquare.date.toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              timeZone: "UTC",
                              timeZoneName: "short",
                            })}: ${commitSquare.commits} commitment${
                              commitSquare.commits === 1 ? "" : "s"
                            }`}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const toCommitSquares = (dates: Date[]): CommitSquare[] => {
  const commitSquares = Array.from(
    { length: DAYS_IN_CURRENT_YEAR },
    (_, i) => ({
      date: new Date(CURRENT_YEAR, 0, i + 1),
      commits: 0,
    }),
  );

  for (const date of dates) {
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(CURRENT_YEAR, 0, 1).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const commitSquare = commitSquares[dayOfYear];
    if (commitSquare) {
      commitSquare.commits++;
    }
  }

  return commitSquares;
};
