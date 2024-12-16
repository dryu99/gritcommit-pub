import { describe, expect, test } from "vitest";
import { DateUtils, toNextRecurringDueDate } from "./date";

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

  // TODO write test for daylight savings

  // test("returns next week's first scheduled day when current day is after all scheduled days", () => {
  //   const result = toNextRecurringDueDate({
  //     timezone: "America/New_York",
  //     scheduleDays: [2, 4], // Tuesday and Thursday
  //     prevDueDate: "2024-03-22 11:59 PM America/New_York", // Friday night
  //   });

  //   expect(result.tz("America/New_York").format("YYYY-MM-DD hh:mm A")).toBe(
  //     "2024-03-26 11:59 PM",
  //   ); // Next Tuesday night
  // });

  // test("handles timezone differences correctly", () => {
  //   const result = toNextRecurringDueDate({
  //     timezone: "Asia/Tokyo",
  //     scheduleDays: [1], // Monday
  //     prevDueDate: "2024-03-18 11:59 PM Asia/Tokyo", // Monday night in Tokyo
  //   });

  //   expect(result.tz("Asia/Tokyo").format("YYYY-MM-DD hh:mm A")).toBe(
  //     "2024-03-25 11:59 PM",
  //   ); // Next Monday night
  // });

  // test("returns same day if it's a scheduled day and hasn't passed in the timezone", () => {
  //   const result = toNextRecurringDueDate({
  //     timezone: "America/Los_Angeles",
  //     scheduleDays: [3], // Wednesday
  //     prevDueDate: "2024-03-20 08:00 AM America/Los_Angeles", // Wednesday morning PT
  //   });

  //   expect(result.tz("America/Los_Angeles").format("YYYY-MM-DD hh:mm A")).toBe(
  //     "2024-03-20 11:59 PM",
  //   );
  // });
});

// DateUtils.dayjs("2024-03-20 23:59:59", "America/New_York").toDate(),
