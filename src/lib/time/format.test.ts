import { describe, expect, it } from "vitest";
import { formatClockTime, formatElapsedClock, getElapsedSeconds } from "@/lib/time/format";

describe("time formatting helpers", () => {
  it("formats elapsed clock values without wrapping after 24 hours", () => {
    expect(formatElapsedClock(0)).toBe("00:00:00");
    expect(formatElapsedClock(8077)).toBe("02:14:37");
    expect(formatElapsedClock(98_142)).toBe("27:15:42");
  });

  it("calculates active elapsed seconds from an absolute clock-in timestamp", () => {
    expect(
      getElapsedSeconds(
        "2026-09-05T12:00:00.000Z",
        new Date("2026-09-05T14:14:37.000Z"),
      ),
    ).toBe(8077);
  });

  it("formats timestamps in the profile timezone and clock preference", () => {
    expect(formatClockTime("2026-09-05T17:05:00.000Z", "America/New_York", "12h")).toBe("1:05 PM");
    expect(formatClockTime("2026-09-05T17:05:00.000Z", "America/New_York", "24h")).toBe("13:05");
  });
});
