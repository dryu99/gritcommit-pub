export type Day = {
  narrow: string;
  short: string;
  index: number; // Mon start
  displayIndex: number; // Sun start
};

export const DAYS: Day[] = [
  { narrow: "M", short: "Mon", index: 1, displayIndex: 0 },
  { narrow: "T", short: "Tue", index: 2, displayIndex: 1 },
  { narrow: "W", short: "Wed", index: 3, displayIndex: 2 },
  { narrow: "T", short: "Thu", index: 4, displayIndex: 3 },
  { narrow: "F", short: "Fri", index: 5, displayIndex: 4 },
  { narrow: "S", short: "Sat", index: 6, displayIndex: 5 },
  { narrow: "S", short: "Sun", index: 0, displayIndex: 6 },
];

// assume: input only contains available days (ie length not always 7)
export const getRecurringDaysText = (days: number[]) => {
  return days.length === 7
    ? "Everyday"
    : days
        .map(
          (scheduleDay) => DAYS.find((day) => day.index === scheduleDay)?.short,
        )
        .join(", ");
};
