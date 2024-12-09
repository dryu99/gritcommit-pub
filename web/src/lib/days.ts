import { ScheduleType } from "@/types/enums";

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

export const getScheduleText = (goal: {
  scheduleType: ScheduleType;
  scheduleDays?: number[] | null;
}) => {
  if (goal.scheduleType === "ONCE") {
    return "Once";
  }

  // assume: days only contains available days (ie length not always 7)
  if (goal.scheduleType === "RECURRING" && goal.scheduleDays) {
    return goal.scheduleDays.length === 7
      ? "Everyday"
      : goal.scheduleDays
          .map(
            (scheduleDay) =>
              DAYS.find((day) => day.index === scheduleDay)?.short,
          )
          .join(", ");
  }

  return "N/A";
};

// TODO pass in timezone? rn its not clear that this is using locale
export const toFormattedDateText = (date: Date | string) => {
  const formatted = new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });

  return formatted;
};
