import { afterEach, describe, expect, it, vi } from "vitest";
import { DateUtils } from "../date";
import { CompleteGoalEntry, isGoalEntryExpired } from "./goal.lib";

describe("isGoalEntryExpired", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return true for expired goals", () => {
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-20 00:00:00.000", "America/Los_Angeles")
        .toDate(),
    );

    const expiredGoals = [
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

    expiredGoals.forEach((goal) => {
      expect(isGoalEntryExpired(goal)).toBe(true);
    });
  });

  it("should return false for future goals", () => {
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-20 00:00:00.000", "America/Los_Angeles")
        .toDate(),
    );

    const futureGoal = {
      dueAt: DateUtils.dayjs
        .tz("2024-03-20 00:30:00.000", "America/Los_Angeles")
        .toDate(),
      userTimezone: "America/Los_Angeles",
    } as CompleteGoalEntry;

    expect(isGoalEntryExpired(futureGoal)).toBe(false);
  });

  it("handles timezones correctly", () => {
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-20 00:00:00.000", "America/New_York")
        .toDate(),
    );

    const goal = {
      dueAt: DateUtils.dayjs
        // this is 2024-03-20 2:59 EST, so not due yet
        .tz("2024-03-19 23:59:59.999", "America/Los_Angeles")
        .toDate(),
      userTimezone: "America/New_York",
    } as CompleteGoalEntry;

    expect(isGoalEntryExpired(goal)).toBe(false);
  });
});
