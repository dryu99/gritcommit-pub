import { DB } from "@/database/db";
import { getSessionUser } from "@/lib/auth/auth.lib";
import { cn } from "@/ui/classnames";
import { LoginForm } from "@/ui/components/login-form";
import { ibmPlexMono } from "@/ui/fonts";
import { redirect } from "next/navigation";

// TODO move this
// normal year = 365, leap year = 366
const getDaysInYear = (year: number) => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
};

const CURRENT_YEAR = 2024;
const DAYS_IN_CURRENT_YEAR = getDaysInYear(CURRENT_YEAR);
const MONTHS = [
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

  const firstDateOfTheYear = commitSquares[0]!.date;

  // TODO fetch all goal entries with status complete from the current year (hardcode to 2024).

  const dayIndexCommitSquareMatrix = commitSquares.reduce(
    (acc, commit) => {
      const dayIndex = commit.date.getDay();
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
    <div className="flex flex-col items-center">
      <h1 className={`${ibmPlexMono.className} mb-1 text-2xl font-bold`}>
        GritCommit
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Commit with grit (and a buddy)
      </p>
      <div className="mb-8 w-full">
        <div className="mx-auto max-w-[740px]">
          <h4 className="text-sm text-gray-500">
            {totalCommits} commits in {CURRENT_YEAR}
          </h4>
          <div className="overflow-x-auto rounded-lg border border-neutral-300 p-4 pl-8 pr-2">
            <div className="-mb-[1px] flex w-[698px] justify-between">
              {MONTHS.map((month) => (
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
                    commitSquares[0]!.date.getDate() >
                    // days in first week
                    7 - firstDateOfTheYear.getDay();

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
                            title={`${commitSquare.date.toLocaleDateString()}: ${commitSquare.commits} commits`}
                            className={cn(
                              "h-[10px] w-[10px] min-w-[10px]",
                              "rounded-sm",
                              `opacity-${opacity * 100}`,
                              commitSquare.commits > 0
                                ? "bg-green-400"
                                : "bg-neutral-300",
                            )}
                          />
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
      <LoginForm />
    </div>
  );
}
