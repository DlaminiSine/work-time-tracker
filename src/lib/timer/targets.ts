export type WeeklyTargetProgress = {
  workedMinutes: number;
  targetMinutes: number;
  percentage: number;
  remainingMinutes: number;
  overTargetMinutes: number;
};

export function getWeeklyTargetProgress(workedMinutes: number, targetMinutes: number | null | undefined): WeeklyTargetProgress | null {
  if (!targetMinutes || targetMinutes <= 0) {
    return null;
  }

  return {
    workedMinutes,
    targetMinutes,
    percentage: Math.round((workedMinutes / targetMinutes) * 100),
    remainingMinutes: Math.max(targetMinutes - workedMinutes, 0),
    overTargetMinutes: Math.max(workedMinutes - targetMinutes, 0),
  };
}
