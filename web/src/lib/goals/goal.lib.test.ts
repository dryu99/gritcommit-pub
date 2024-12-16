import { afterEach, describe, expect, it, vi } from "vitest";
import { DateUtils } from "../date";
import { CompleteGoalEntry, toRecentlyExpiredGoalEntries } from "./goal.lib";

describe("toRecentlyExpiredGoalEntries", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return goals that expired within the last hour", () => {
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-20 03:00:00.000", "America/Los_Angeles")
        .toDate(),
    );

    const allGoals = [
      {
        dueAt: DateUtils.dayjs
          .tz("2024-03-20 02:30:00.000", "America/Los_Angeles")
          .toDate(),
        userTimezone: "America/Los_Angeles",
      },
      {
        dueAt: DateUtils.dayjs
          .tz("2024-03-20 02:15:00.000", "America/Los_Angeles")
          .toDate(),
        userTimezone: "America/Los_Angeles",
      },
      {
        dueAt: DateUtils.dayjs
          .tz("2024-03-20 02:00:00.001", "America/Los_Angeles")
          .toDate(),
        userTimezone: "America/Los_Angeles",
      },

      // exactly one hour ago is the boundary
      {
        dueAt: DateUtils.dayjs
          .tz("2024-03-20 02:00:00.000", "America/Los_Angeles")
          .toDate(),
        userTimezone: "America/Los_Angeles",
      },
      {
        dueAt: DateUtils.dayjs
          .tz("2024-03-20 01:59:59.999", "America/Los_Angeles")
          .toDate(),
        userTimezone: "America/Los_Angeles",
      },
    ] as CompleteGoalEntry[];

    const expectedGoals = allGoals.slice(0, 3);
    const result = toRecentlyExpiredGoalEntries(allGoals);

    expect(result).toHaveLength(3);
    expect(result).toEqual(expectedGoals);
  });

  it("should exclude goals that expired more than an hour ago", () => {
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-20 03:00:00.000", "America/Los_Angeles")
        .toDate(),
    );

    const goals = [
      {
        dueAt: DateUtils.dayjs
          .tz("2024-03-20 01:30:00.000", "America/Los_Angeles")
          .toDate(),
        userTimezone: "America/Los_Angeles",
      },
    ] as CompleteGoalEntry[];

    const result = toRecentlyExpiredGoalEntries(goals);
    expect(result).toHaveLength(0);
  });

  it("should exclude future goals", () => {
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-20 03:00:00.000", "America/Los_Angeles")
        .toDate(),
    );

    const goals = [
      {
        dueAt: DateUtils.dayjs
          .tz("2024-03-20 03:30:00.000", "America/Los_Angeles")
          .toDate(),
        userTimezone: "America/Los_Angeles",
      },
    ] as CompleteGoalEntry[];

    const result = toRecentlyExpiredGoalEntries(goals);
    expect(result).toHaveLength(0);
  });

  // it("should handle different timezones correctly", () => {
  //   vi.setSystemTime(
  //     DateUtils.dayjs
  //       .tz("2024-03-20 03:00:00.000", "America/Los_Angeles")
  //       .toDate(),
  //   );

  //   const goals = [
  //     {
  //       dueAt: DateUtils.dayjs
  //         .tz("2024-03-20 02:30:00.000", "America/New_York")
  //         .toDate(),
  //       userTimezone: "America/New_York",
  //     },
  //   ] as CompleteGoalEntry[];

  //   const result = toRecentlyExpiredGoalEntries(goals);
  //   expect(result).toHaveLength(1);
  // });
});
