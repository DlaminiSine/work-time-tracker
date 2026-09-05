import { describe, expect, it } from "vitest";
import { getWeeklyTargetProgress } from "@/lib/timer/targets";

describe("weekly target progress", () => {
  it("calculates remaining target time", () => {
    expect(getWeeklyTargetProgress(992, 1200)).toEqual({
      workedMinutes: 992,
      targetMinutes: 1200,
      percentage: 83,
      remainingMinutes: 208,
      overTargetMinutes: 0,
    });
  });

  it("calculates time over target without negative remaining values", () => {
    expect(getWeeklyTargetProgress(1275, 1200)).toEqual({
      workedMinutes: 1275,
      targetMinutes: 1200,
      percentage: 106,
      remainingMinutes: 0,
      overTargetMinutes: 75,
    });
  });
});
