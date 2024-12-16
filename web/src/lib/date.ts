import { ScheduleType } from "@/types/enums";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export const DateUtils = { dayjs };

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

export function toPartnerVerificationDeadline(dueAt: Date | string): Date {
  const HOURS_AFTER_DUE = 12;
  return new Date(new Date(dueAt).getTime() + HOURS_AFTER_DUE * 60 * 60 * 1000);
}

// normal year = 365, leap year = 366
const getDaysInYear = (year: number) => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
};

export const CURRENT_YEAR = 2024;
export const DAYS_IN_CURRENT_YEAR = getDaysInYear(CURRENT_YEAR);

export const toNextDueDate = ({
  timezone,
  dueDate,
  startToday,
  scheduleDays,
}: {
  timezone: string;
  dueDate?: Date | string;
  startToday?: boolean;
  scheduleDays?: number[];
}): Date => {
  // handle ONCE
  if (dueDate) {
    return DateUtils.dayjs(dueDate).tz(timezone).endOf("day").toDate();
  }

  // handle RECURRING
  const clientToday = DateUtils.dayjs().tz(timezone);
  if (startToday) {
    return clientToday.endOf("day").toDate();
  }

  if (scheduleDays) {
    const todayDay = clientToday.day();

    for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
      const checkDay = (todayDay + daysAhead) % 7;
      if (scheduleDays.includes(checkDay)) {
        return clientToday.add(daysAhead, "day").endOf("day").toDate();
      }
    }
  }

  throw new Error("Next due date could not be calculated");
};
