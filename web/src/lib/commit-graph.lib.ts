import { CURRENT_YEAR, DAYS_IN_CURRENT_YEAR } from "./date";

export type CommitSquare = {
  date: Date;
  commits: number;
};

export const toCommitSquares = (dates: Date[]): CommitSquare[] => {
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
