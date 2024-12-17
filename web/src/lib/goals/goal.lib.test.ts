import { afterEach, describe, expect, it, vi } from "vitest";
import { DateUtils } from "../date";
import { CompleteGoalEntry, toExpiredGoalEntries } from "./goal.lib";

describe("toRecentlyExpiredGoalEntries", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return goals that expired", () => {
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-20 00:00:00.000", "America/Los_Angeles")
        .toDate(),
    );

    const goals = [
      {
        dueAt: DateUtils.dayjs
          .tz("2024-03-19 23:59:59.999", "America/Los_Angeles")
          .toDate(),
        userTimezone: "America/Los_Angeles",
      },
      {
        dueAt: DateUtils.dayjs
          .tz("2024-03-19 23:30:00.000", "America/Los_Angeles")
          .toDate(),
        userTimezone: "America/Los_Angeles",
      },
      {
        dueAt: DateUtils.dayjs
          .tz("2024-03-19 23:00:00.001", "America/Los_Angeles")
          .toDate(),
        userTimezone: "America/Los_Angeles",
      },
    ] as CompleteGoalEntry[];

    const result = toExpiredGoalEntries(goals);
    expect(result).toHaveLength(3);
    expect(result).toEqual(goals);
  });

  it("should exclude future goals", () => {
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-20 00:00:00.000", "America/Los_Angeles")
        .toDate(),
    );

    const goals = [
      {
        dueAt: DateUtils.dayjs
          .tz("2024-03-20 00:30:00.000", "America/Los_Angeles")
          .toDate(),
        userTimezone: "America/Los_Angeles",
      },
    ] as CompleteGoalEntry[];

    const result = toExpiredGoalEntries(goals);
    expect(result).toHaveLength(0);
  });

  it("handles timezones correctly", () => {
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-20 00:00:00.000", "America/New_York")
        .toDate(),
    );

    const goals = [
      {
        dueAt: DateUtils.dayjs
          // this is 2024-03-20 2:59 EST, so not due yet
          .tz("2024-03-19 23:59:59.999", "America/Los_Angeles")
          .toDate(),
        userTimezone: "America/New_York",
      },
    ] as CompleteGoalEntry[];

    const result = toExpiredGoalEntries(goals);
    expect(result).toHaveLength(0);
  });
});
