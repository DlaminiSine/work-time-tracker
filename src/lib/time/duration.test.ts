import { describe, expect, it } from "vitest";
import {
  estimateEarnings,
  formatDuration,
  getDurationMinutes,
  getMonthlyTotalMinutes,
  getWeeklyTotalMinutes,
  splitSessionByUtcDay,
  toDecimalHours,
} from "@/lib/time/duration";

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

  it("splits a session crossing midnight into UTC calendar days", () => {
    expect(
      splitSessionByUtcDay({
        clockIn: "2026-09-07T23:00:00.000Z",
        clockOut: "2026-09-08T01:00:00.000Z",
      }),
    ).toEqual([
      { date: "2026-09-07", minutes: 60 },
      { date: "2026-09-08", minutes: 60 },
    ]);
  });

  it("calculates weekly totals with Sunday week starts", () => {
    const sessions = [
      { clockIn: "2026-09-06T10:00:00.000Z", clockOut: "2026-09-06T12:00:00.000Z" },
      { clockIn: "2026-09-12T10:00:00.000Z", clockOut: "2026-09-12T11:30:00.000Z" },
      { clockIn: "2026-09-13T10:00:00.000Z", clockOut: "2026-09-13T11:00:00.000Z" },
    ];

    expect(getWeeklyTotalMinutes(sessions, "2026-09-10T12:00:00.000Z", 0)).toBe(210);
  });

  it("calculates monthly totals", () => {
    const sessions = [
      { clockIn: "2026-09-01T10:00:00.000Z", clockOut: "2026-09-01T12:00:00.000Z" },
      { clockIn: "2026-09-30T23:00:00.000Z", clockOut: "2026-10-01T01:00:00.000Z" },
      { clockIn: "2026-10-01T10:00:00.000Z", clockOut: "2026-10-01T11:00:00.000Z" },
    ];

    expect(getMonthlyTotalMinutes(sessions, "2026-09-15T12:00:00.000Z")).toBe(180);
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
