import { afterEach, describe, expect, it, vi } from "vitest";
import { DateUtils } from "../date";
import {
  canSendGoalEntryDueTodayEmail,
  CompleteGoalEntry,
  isGoalEntryExpired,
  isGoalEntryPartnerVerificationExpired,
} from "./goal.lib";

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

const PARTNER_VERIFICATION_HOURS_AFTER_DUE = 12;

describe("isGoalEntryPartnerVerificationExpired", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return true when partner verification deadline has passed", () => {
    const dueDate = DateUtils.dayjs.tz(
      "2024-03-19 23:59:59.999",
      "America/Los_Angeles",
    );
    const currentTime = dueDate.add(
      PARTNER_VERIFICATION_HOURS_AFTER_DUE + 1,
      "hours",
    );

    vi.setSystemTime(currentTime.toDate());

    const expiredEntry = {
      dueAt: dueDate.toDate(),
      userTimezone: "America/Los_Angeles",
    } as CompleteGoalEntry;

    expect(isGoalEntryPartnerVerificationExpired(expiredEntry)).toBe(true);
  });

  it("should return false when partner verification deadline has not passed", () => {
    const dueDate = DateUtils.dayjs.tz(
      "2024-03-19 23:59:59.999",
      "America/Los_Angeles",
    );
    const currentTime = dueDate.add(
      PARTNER_VERIFICATION_HOURS_AFTER_DUE - 1,
      "hours",
    );

    vi.setSystemTime(currentTime.toDate());

    const activeEntry = {
      dueAt: dueDate.toDate(),
      userTimezone: "America/Los_Angeles",
    } as CompleteGoalEntry;

    expect(isGoalEntryPartnerVerificationExpired(activeEntry)).toBe(false);
  });

  it("handles timezones correctly", () => {
    const dueDate = DateUtils.dayjs.tz(
      "2024-03-19 23:59:59.999",
      "America/Los_Angeles",
    );
    const currentTime = dueDate.add(
      PARTNER_VERIFICATION_HOURS_AFTER_DUE - 2,
      "hours",
    );

    vi.setSystemTime(currentTime.toDate());

    const entryInDifferentTimezone = {
      dueAt: dueDate.toDate(),
      userTimezone: "America/New_York",
    } as CompleteGoalEntry;

    expect(
      isGoalEntryPartnerVerificationExpired(entryInDifferentTimezone),
    ).toBe(false);
  });

  // handing in at 11:59 should still be valid
  it("should return false when exactly at the verification deadline", () => {
    const dueDate = DateUtils.dayjs.tz(
      "2024-03-19 23:59:59.999",
      "America/Los_Angeles",
    );
    const currentTime = dueDate.add(
      PARTNER_VERIFICATION_HOURS_AFTER_DUE,
      "hours",
    );

    vi.setSystemTime(currentTime.toDate());

    const entryAtDeadline = {
      dueAt: dueDate.toDate(),
      userTimezone: "America/Los_Angeles",
    } as CompleteGoalEntry;

    expect(isGoalEntryPartnerVerificationExpired(entryAtDeadline)).toBe(false);
  });
});

describe("canSendGoalEntryDueTodayEmail", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return true when it's 12pm and goal is due today", () => {
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-20 12:00:00.000", "America/Los_Angeles")
        .toDate(),
    );

    const goalDueToday = {
      dueAt: DateUtils.dayjs
        .tz("2024-03-20 23:59:59.999", "America/Los_Angeles")
        .toDate(),
      userTimezone: "America/Los_Angeles",
    } as CompleteGoalEntry;

    expect(canSendGoalEntryDueTodayEmail(goalDueToday)).toBe(true);
  });

  it("should return true when it's 12-something pm and goal is due today", () => {
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-20 12:30:00.000", "America/Los_Angeles")
        .toDate(),
    );

    const goalDueToday = {
      dueAt: DateUtils.dayjs
        .tz("2024-03-20 23:59:59.999", "America/Los_Angeles")
        .toDate(),
      userTimezone: "America/Los_Angeles",
    } as CompleteGoalEntry;

    expect(canSendGoalEntryDueTodayEmail(goalDueToday)).toBe(true);
  });

  it("should return false when it's not 12pm", () => {
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-20 11:59:59.999", "America/Los_Angeles")
        .toDate(),
    );

    const goalDueToday = {
      dueAt: DateUtils.dayjs
        .tz("2024-03-20 23:59:59.999", "America/Los_Angeles")
        .toDate(),
      userTimezone: "America/Los_Angeles",
    } as CompleteGoalEntry;

    expect(canSendGoalEntryDueTodayEmail(goalDueToday)).toBe(false);
  });

  it("should return false when goal is due on a different day", () => {
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-20 12:00:00.000", "America/Los_Angeles")
        .toDate(),
    );

    const goalDueTomorrow = {
      dueAt: DateUtils.dayjs
        .tz("2024-03-21 23:59:59.999", "America/Los_Angeles")
        .toDate(),
      userTimezone: "America/Los_Angeles",
    } as CompleteGoalEntry;

    expect(canSendGoalEntryDueTodayEmail(goalDueTomorrow)).toBe(false);
  });

  it("handles different timezones correctly", () => {
    // Set system time to 12pm in New York
    vi.setSystemTime(
      DateUtils.dayjs
        .tz("2024-03-20 12:00:00.000", "America/New_York")
        .toDate(),
    );

    /**
     * Different timezone case
     */
    const goalInDifferentTimezone = {
      // Due at 11:59pm LA time (which is next day 2:59am NY time)
      dueAt: DateUtils.dayjs
        .tz("2024-03-20 23:59:59.999", "America/Los_Angeles")
        .toDate(),
      userTimezone: "America/Los_Angeles",
    } as CompleteGoalEntry;

    // Should return false because it's not 12pm in LA (it's 9am)
    expect(canSendGoalEntryDueTodayEmail(goalInDifferentTimezone)).toBe(false);

    /**
     * Same timezone case
     */
    const goalInSameTimezone = {
      dueAt: DateUtils.dayjs
        .tz("2024-03-20 23:59:59.999", "America/New_York")
        .toDate(),
      userTimezone: "America/New_York",
    } as CompleteGoalEntry;

    expect(canSendGoalEntryDueTodayEmail(goalInSameTimezone)).toBe(true);
  });
});
