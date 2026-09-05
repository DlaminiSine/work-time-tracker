import { describe, expect, it } from "vitest";
import {
  estimateEarnings,
  formatDuration,
  getDailyTotalMinutes,
  getDayRange,
  getDurationMinutes,
  getMonthRange,
  getMonthlyTotalMinutes,
  getWeekRange,
  getWeeklyTotalMinutes,
  splitSessionByDay,
  toDecimalHours,
} from "@/lib/time/duration";

const newYork = "America/New_York";

describe("duration helpers", () => {
  it("calculates a 30-minute session", () => {
    expect(getDurationMinutes("2026-09-01T12:00:00.000Z", "2026-09-01T12:30:00.000Z")).toBe(30);
  });

  it("calculates a multi-hour session", () => {
    expect(getDurationMinutes("2026-09-01T12:00:00.000Z", "2026-09-01T15:45:00.000Z")).toBe(225);
  });

  it("calculates active session elapsed time from now", () => {
    expect(
      getDurationMinutes(
        "2026-09-01T12:00:00.000Z",
        null,
        new Date("2026-09-01T13:20:00.000Z"),
      ),
    ).toBe(80);
  });

  it("splits a normal America/New_York day", () => {
    expect(
      splitSessionByDay(
        {
          clockIn: "2026-09-04T14:00:00.000Z",
          clockOut: "2026-09-04T16:30:00.000Z",
        },
        newYork,
      ),
    ).toEqual([{ date: "2026-09-04", minutes: 150 }]);
  });

  it("splits an America/New_York session crossing local midnight", () => {
    expect(
      splitSessionByDay(
        {
          clockIn: "2026-09-05T03:30:00.000Z",
          clockOut: "2026-09-05T04:30:00.000Z",
        },
        newYork,
      ),
    ).toEqual([
      { date: "2026-09-04", minutes: 30 },
      { date: "2026-09-05", minutes: 30 },
    ]);
  });

  it("keeps a UTC-midnight crossing session on the same local day when appropriate", () => {
    expect(
      splitSessionByDay(
        {
          clockIn: "2026-09-04T23:30:00.000Z",
          clockOut: "2026-09-05T00:30:00.000Z",
        },
        newYork,
      ),
    ).toEqual([{ date: "2026-09-04", minutes: 60 }]);
  });

  it("calculates day ranges in the user's timezone", () => {
    const range = getDayRange("2026-09-04T16:00:00.000Z", newYork);

    expect(range.start.toISOString()).toBe("2026-09-04T04:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-09-05T04:00:00.000Z");
  });

  it("calculates weekly totals with Sunday week starts", () => {
    const sessions = [
      { clockIn: "2026-09-06T14:00:00.000Z", clockOut: "2026-09-06T16:00:00.000Z" },
      { clockIn: "2026-09-12T14:00:00.000Z", clockOut: "2026-09-12T15:30:00.000Z" },
      { clockIn: "2026-09-13T14:00:00.000Z", clockOut: "2026-09-13T15:00:00.000Z" },
    ];

    const range = getWeekRange("2026-09-10T12:00:00.000Z", newYork, 0);

    expect(range.start.toISOString()).toBe("2026-09-06T04:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-09-13T04:00:00.000Z");
    expect(getWeeklyTotalMinutes(sessions, "2026-09-10T12:00:00.000Z", newYork, 0)).toBe(210);
  });

  it("calculates weekly totals with Monday week starts", () => {
    const sessions = [
      { clockIn: "2026-09-06T14:00:00.000Z", clockOut: "2026-09-06T16:00:00.000Z" },
      { clockIn: "2026-09-07T14:00:00.000Z", clockOut: "2026-09-07T16:30:00.000Z" },
      { clockIn: "2026-09-13T14:00:00.000Z", clockOut: "2026-09-13T15:00:00.000Z" },
    ];

    const range = getWeekRange("2026-09-10T12:00:00.000Z", newYork, 1);

    expect(range.start.toISOString()).toBe("2026-09-07T04:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-09-14T04:00:00.000Z");
    expect(getWeeklyTotalMinutes(sessions, "2026-09-10T12:00:00.000Z", newYork, 1)).toBe(210);
  });

  it("calculates month boundaries in the user's timezone", () => {
    const sessions = [
      { clockIn: "2026-10-01T03:30:00.000Z", clockOut: "2026-10-01T04:30:00.000Z" },
      { clockIn: "2026-10-01T14:00:00.000Z", clockOut: "2026-10-01T15:00:00.000Z" },
    ];

    const septemberRange = getMonthRange("2026-09-15T12:00:00.000Z", newYork);
    const octoberRange = getMonthRange("2026-10-15T12:00:00.000Z", newYork);

    expect(septemberRange.start.toISOString()).toBe("2026-09-01T04:00:00.000Z");
    expect(septemberRange.end.toISOString()).toBe("2026-10-01T04:00:00.000Z");
    expect(octoberRange.start.toISOString()).toBe("2026-10-01T04:00:00.000Z");
    expect(getMonthlyTotalMinutes(sessions, "2026-09-15T12:00:00.000Z", newYork)).toBe(30);
    expect(getMonthlyTotalMinutes(sessions, "2026-10-15T12:00:00.000Z", newYork)).toBe(90);
  });

  it("handles daylight saving time without hard-coded offsets", () => {
    const sessions = [
      {
        clockIn: "2026-03-08T06:30:00.000Z",
        clockOut: "2026-03-08T07:30:00.000Z",
      },
    ];

    const range = getDayRange("2026-03-08T12:00:00.000Z", newYork);

    expect(range.start.toISOString()).toBe("2026-03-08T05:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-03-09T04:00:00.000Z");
    expect(getDailyTotalMinutes(sessions, "2026-03-08T12:00:00.000Z", newYork)).toBe(60);
    expect(splitSessionByDay(sessions[0], newYork)).toEqual([{ date: "2026-03-08", minutes: 60 }]);
  });

  it("converts minutes to decimal hours", () => {
    expect(toDecimalHours(90)).toBe(1.5);
  });

  it("calculates estimated earnings", () => {
    expect(estimateEarnings(150, 80)).toBe(200);
    expect(estimateEarnings(150, null)).toBeNull();
  });

  it("formats durations human-readably", () => {
    expect(formatDuration(34)).toBe("34m");
    expect(formatDuration(65)).toBe("1h 05m");
    expect(formatDuration(462)).toBe("7h 42m");
  });
});
