import { getSessionUser } from "@/lib/auth/auth.lib";
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

const DEFAULT_COMMIT_SQUARES = Array.from(
  { length: DAYS_IN_CURRENT_YEAR },
  (_, i) => ({
    date: new Date(CURRENT_YEAR, 0, i + 1),
    commits: Math.floor(Math.random() * 10),
  }),
);

export default async function HomePage() {
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    redirect("/dashboard");
  }

  const commitSquares = DEFAULT_COMMIT_SQUARES;
  const firstDateOfTheYear = commitSquares[0]!.date;

  // TODO fetch all goal entries with status complete from the current year (hardcode to 2024).
  //

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

  return (
    <div className="flex flex-col items-center">
      <h1 className={`${ibmPlexMono.className} mb-1 text-2xl font-bold`}>
        GritCommit
      </h1>
      <p className="mb-10 text-sm text-gray-500">
        Commit with grit (and a buddy)
      </p>
      <LoginForm />
      <div className="mt-8 rounded-lg p-4">
        <div className="text-xs">
          <tr>
            <td className="h-6" />
          </tr>
          <tr>Mon</tr>
          <tr>
            <td className="h-6" />
          </tr>
          <tr>Wed</tr>
          <tr>
            <td className="h-6" />
          </tr>
          <tr>Fri</tr>
          <tr>
            <td className="h-6" />
          </tr>
        </div>
        <div>
          {dayIndexCommitSquareMatrix.map((commitSquares, dayIndex) => {
            const startsOnSecondWeek =
              commitSquares[0]!.date.getDate() >
              // days in first week
              7 - firstDateOfTheYear.getDay();

            return (
              <tr key={dayIndex}>
                {startsOnSecondWeek && <td className="h-6" />}
                {commitSquares.map((commitSquare) => {
                  const opacity =
                    (commitSquare.commits / maxCommits) * 0.8 + 0.2;
                  return (
                    <td
                      title={`${commitSquare.date.toLocaleDateString()}: ${commitSquare.commits} commits`}
                      className="h-6 w-6"
                      style={{
                        backgroundColor: `rgba(74, 222, 128, ${opacity})`,
                      }}
                    />
                  );
                })}
              </tr>
            );
          })}

          {/* tues */}
          <tr></tr>
        </div>
      </div>
    </div>
  );
}
