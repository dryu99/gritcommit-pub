import { ScheduleType } from "@/types/enums";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export const DateUtils = { dayjs };

// we have this since dates from db can sometimes be string (if json parsing was used)
export type SafeDate = Date | string;

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

// TODO use dayjs instead?
/**
 * If no timezone is given, use locale timezone
 */
export const toFormattedDateText = (date: SafeDate, timezone?: string) => {
  const formatted = new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
    timeZone: timezone,
  });

  return formatted;
};

export function toPartnerVerificationDeadline(dueAt: SafeDate): Date {
  const HOURS_AFTER_DUE = 12;
  return new Date(new Date(dueAt).getTime() + HOURS_AFTER_DUE * 60 * 60 * 1000);
}

// normal year = 365, leap year = 366
const getDaysInYear = (year: number) => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
};

export const CURRENT_YEAR = 2024;
export const DAYS_IN_CURRENT_YEAR = getDaysInYear(CURRENT_YEAR);

/**
 * Calculates the initial due date when creating a new recurring goal
 * Uses the current date as a starting point
 */
export const toInitialRecurringDueDate = ({
  timezone,
  scheduleDays,
  startToday,
}: {
  timezone: string;
  scheduleDays: number[];
  startToday?: boolean;
}): Date => {
  const today = DateUtils.dayjs().tz(timezone);

  if (startToday) {
    return today.endOf("day").toDate();
  }

  return findNextScheduledDay(today, scheduleDays);
};

/**
 * Calculates the next due date for an existing recurring goal
 */
export const toNextRecurringDueDate = ({
  timezone,
  scheduleDays,
  prevDueDate,
}: {
  timezone: string;
  scheduleDays: number[];
  prevDueDate: SafeDate;
}): Date => {
  const lastDue = DateUtils.dayjs.tz(prevDueDate, timezone);
  return findNextScheduledDay(lastDue, scheduleDays);
};

/**
 * Helper function to find the next available scheduled day
 */
function findNextScheduledDay(
  fromDate: dayjs.Dayjs,
  scheduleDays: number[],
): Date {
  const startDay = fromDate.day();

  for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
    const checkDay = (startDay + daysAhead) % 7;
    if (scheduleDays.includes(checkDay)) {
      return fromDate.add(daysAhead, "day").endOf("day").toDate();
    }
  }

  throw new Error("No scheduled days available");
}
