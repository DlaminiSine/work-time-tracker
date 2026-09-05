import { describe, expect, it } from "vitest";
import { getProjectMinutesForRange, getTimerSummaryTotals } from "@/lib/timer/summary";

const timezone = "America/New_York";

describe("timer summary totals", () => {
  it("includes active session time in today's total", () => {
    const now = new Date("2026-09-05T15:00:00.000Z");
    const totals = getTimerSummaryTotals({
      now,
      timezone,
      weekStartsOn: 0,
      sessions: [{ clockIn: "2026-09-05T14:00:00.000Z", clockOut: null }],
    });

    expect(totals.today).toBe(60);
  });

  it("counts only today's portion when an active session crossed local midnight", () => {
    const now = new Date("2026-09-05T05:00:00.000Z");
    const totals = getTimerSummaryTotals({
      now,
      timezone,
      weekStartsOn: 0,
      sessions: [{ clockIn: "2026-09-05T03:30:00.000Z", clockOut: null }],
    });

    expect(totals.today).toBe(60);
  });

  it("includes active time in week and month totals", () => {
    const now = new Date("2026-09-10T16:00:00.000Z");
    const totals = getTimerSummaryTotals({
      now,
      timezone,
      weekStartsOn: 0,
      sessions: [
        { clockIn: "2026-09-06T14:00:00.000Z", clockOut: "2026-09-06T16:00:00.000Z" },
        { clockIn: "2026-09-10T14:30:00.000Z", clockOut: null },
      ],
    });

    expect(totals.today).toBe(90);
    expect(totals.week).toBe(210);
    expect(totals.month).toBe(210);
  });

  it("calculates a selected project's current range total including active time", () => {
    const now = new Date("2026-09-10T16:00:00.000Z");
    const totals = getTimerSummaryTotals({
      now,
      timezone,
      weekStartsOn: 0,
      sessions: [],
    });

    expect(
      getProjectMinutesForRange({
        now,
        range: totals.ranges.week,
        projectId: "project-a",
        sessions: [
          { projectId: "project-a", clockIn: "2026-09-09T14:00:00.000Z", clockOut: "2026-09-09T16:00:00.000Z" },
          { projectId: "project-b", clockIn: "2026-09-10T14:00:00.000Z", clockOut: null },
          { projectId: "project-a", clockIn: "2026-09-10T15:00:00.000Z", clockOut: null },
        ],
      }),
    ).toBe(180);
  });
});
