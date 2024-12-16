import { afterEach, describe, expect, test, vi } from "vitest";
import {
  DateUtils,
  toInitialRecurringDueDate,
  toNextRecurringDueDate,
} from "./date";

describe("toInitialRecurringDueDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("returns end of today when startToday is true", () => {
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-19 12:00:00.000", "America/Los_Angeles") // Tuesday noon
        .toDate(),
    );

    const result = toInitialRecurringDueDate({
      timezone: "America/Los_Angeles",
      scheduleDays: [1, 3, 5], // Mon, Wed, Fri
      startToday: true,
    });

    // Should return end of Tuesday (today)
    expect(result).toEqual(
      DateUtils.dayjs
        .tz("2024-03-19 23:59:59.999", "America/Los_Angeles")
        .toDate(),
    );
  });

  test("finds next scheduled day when current day (Tuesday) is between scheduled days", () => {
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-19 12:00:00.000", "America/Los_Angeles") // Tuesday noon
        .toDate(),
    );

    const result = toInitialRecurringDueDate({
      timezone: "America/Los_Angeles",
      scheduleDays: [1, 3, 5], // Mon, Wed, Fri
      startToday: false,
    });

    // Should return end of Wednesday
    expect(result).toEqual(
      DateUtils.dayjs
        .tz("2024-03-20 23:59:59.999", "America/Los_Angeles")
        .toDate(),
    );
  });

  test("finds next scheduled day when current day is after all scheduled days", () => {
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-20 12:00:00.000", "America/Los_Angeles") // Wednesday noon
        .toDate(),
    );

    const result = toInitialRecurringDueDate({
      timezone: "America/Los_Angeles",
      scheduleDays: [1, 3], // Monday and Wednesday
      startToday: false,
    });

    expect(result).toEqual(
      DateUtils.dayjs
        .tz("2024-03-25 23:59:59.999", "America/Los_Angeles") // Next Monday EOD
        .toDate(),
    );
  });

  test("handles timezone differences correctly", () => {
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-18 12:00:00.000", "Asia/Tokyo") // Monday noon
        .toDate(),
    );

    const result = toInitialRecurringDueDate({
      timezone: "Asia/Tokyo",
      scheduleDays: [1, 2], // Monday and Tuesday
      startToday: false,
    });

    expect(result).toEqual(
      DateUtils.dayjs
        .tz("2024-03-19 23:59:59.999", "Asia/Tokyo") // Tuesday EOD
        .toDate(),
    );
  });
});

describe("toNextRecurringDueDate", () => {
  test("returns next scheduled day when current day is before any scheduled days", () => {
    const result = toNextRecurringDueDate({
      timezone: "America/New_York",
      scheduleDays: [3, 5], // Wednesday and Friday
      prevDueDate: DateUtils.dayjs
        .tz("2024-03-18 23:59:59", "America/New_York") // Monday EOD
        .toDate(),
    });

    expect(result).toEqual(
      DateUtils.dayjs
        .tz("2024-03-20 23:59:59.999", "America/New_York") // Wednesday EOD
        .toDate(),
    );
  });

  test("returns next scheduled day when current day is after all scheduled days", () => {
    const result = toNextRecurringDueDate({
      timezone: "America/New_York",
      scheduleDays: [2, 4], // Tuesday and Thursday
      prevDueDate: DateUtils.dayjs
        .tz("2024-03-22 23:59:59", "America/New_York") // Friday EOD
        .toDate(),
    });

    expect(result).toEqual(
      DateUtils.dayjs
        .tz("2024-03-26 23:59:59.999", "America/New_York") // Next Tuesday EOD
        .toDate(),
    );
  });

  test("returns next scheduled day when current day is on scheduled day (instead of returning current day)", () => {
    const result = toNextRecurringDueDate({
      timezone: "America/Los_Angeles",
      scheduleDays: [1], // Monday
      prevDueDate: DateUtils.dayjs
        .tz("2024-03-18 23:59:59", "America/Los_Angeles") // Monday EOD
        .toDate(),
    });

    expect(result).toEqual(
      DateUtils.dayjs
        .tz("2024-03-25 23:59:59.999", "America/Los_Angeles") // Next Monday EOD
        .toDate(),
    );
  });

  test("handles timezone differences correctly", () => {
    const result = toNextRecurringDueDate({
      timezone: "Asia/Tokyo",
      scheduleDays: [1, 2], // Monday and Tuesday
      prevDueDate: DateUtils.dayjs
        .tz("2024-03-18 23:59:59", "Asia/Tokyo") // Monday EOD
        .toDate(),
    });

    expect(result).toEqual(
      DateUtils.dayjs
        .tz("2024-03-19 23:59:59.999", "Asia/Tokyo") // Tuesday EOD
        .toDate(),
    );
  });

  test("handles daylight savings time correctly (winter)", () => {
    const result = toNextRecurringDueDate({
      timezone: "America/Los_Angeles",
      scheduleDays: [0, 6], // Sunday and Saturday
      prevDueDate: DateUtils.dayjs
        .tz("2024-12-16 23:59:59", "America/Los_Angeles") // Monday
        .toDate(),
    });

    expect(result).toEqual(
      DateUtils.dayjs
        .tz("2024-12-21 23:59:59.999", "America/Los_Angeles") // Saturday
        .toDate(),
    );
  });

  test("handles daylight savings time transition correctly", () => {
    const result = toNextRecurringDueDate({
      timezone: "America/New_York",
      scheduleDays: [1], // Monday
      prevDueDate: DateUtils.dayjs
        .tz("2024-03-09 23:59:59", "America/New_York") // Saturday before DST
        .toDate(),
    });

    expect(result).toEqual(
      DateUtils.dayjs
        .tz("2024-03-11 23:59:59.999", "America/New_York") // Monday after DST
        .toDate(),
    );
  });

  test("handles multiple scheduled days in same week", () => {
    const result = toNextRecurringDueDate({
      timezone: "America/New_York",
      scheduleDays: [1, 3, 5], // Monday, Wednesday, Friday
      prevDueDate: DateUtils.dayjs
        .tz("2024-03-20 23:59:59", "America/New_York") // Wednesday EOD
        .toDate(),
    });

    expect(result).toEqual(
      DateUtils.dayjs
        .tz("2024-03-22 23:59:59.999", "America/New_York") // Friday EOD
        .toDate(),
    );
  });
});
