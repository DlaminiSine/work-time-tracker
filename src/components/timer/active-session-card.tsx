"use client";

import * as React from "react";
import { Clock3, FolderKanban, Hash, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClockOutButton } from "@/components/timer/clock-out-button";
import { formatDuration } from "@/lib/time/duration";
import { formatClockTime, formatElapsedClock, getElapsedSeconds } from "@/lib/time/format";
import type { ProfilePreferences } from "@/lib/profiles/queries";
import type { WeeklyTargetProgress } from "@/lib/timer/targets";
import type { WorkSessionWithDetails } from "@/lib/work-sessions/queries";

export function ActiveSessionCard({
  session,
  profile,
  weeklyTarget,
}: {
  session: WorkSessionWithDetails;
  profile: ProfilePreferences;
  weeklyTarget: WeeklyTargetProgress | null;
}) {
  const [elapsedSeconds, setElapsedSeconds] = React.useState(() => getElapsedSeconds(session.clock_in));
  const projectColor = session.project?.color ?? session.company?.color ?? "var(--primary)";
  const projectName = session.project?.name ?? "Project unavailable";
  const companyName = session.company?.name ?? "Company unavailable";

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsedSeconds(getElapsedSeconds(session.clock_in));
    }, 1_000);

    return () => window.clearInterval(interval);
  }, [session.clock_in]);

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <Badge className="border-primary/30 bg-primary/10 text-primary">Active now</Badge>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock3 className="size-5 text-primary" aria-hidden="true" />
              Current session
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground">
            <Hash className="size-3.5" aria-hidden="true" />
            <span className="max-w-32 truncate font-mono">{session.id}</span>
          </div>
        </div>
        <CardDescription>
          Started at {formatClockTime(session.clock_in, profile.timezone, profile.time_format)} in {profile.timezone}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="font-mono text-5xl font-semibold tabular-nums sm:text-6xl" aria-hidden="true">
            {formatElapsedClock(elapsedSeconds)}
          </p>
          <p className="sr-only">Active timer elapsed {formatElapsedClock(elapsedSeconds)}</p>
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-md border bg-background p-3">
            <div className="mb-1 flex items-center gap-2 font-medium">
              <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: projectColor }} aria-hidden="true" />
              {companyName}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <FolderKanban className="size-4" aria-hidden="true" />
              {projectName}
            </div>
          </div>
          <div className="rounded-md border bg-background p-3">
            <div className="mb-1 font-medium">Task</div>
            <p className="break-words text-muted-foreground">{session.task_description || "No task description"}</p>
          </div>
        </div>

        {weeklyTarget ? (
          <div className="space-y-3 rounded-md border bg-background p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <Target className="size-4 text-primary" aria-hidden="true" />
                Weekly target
              </div>
              <span className="text-muted-foreground">{weeklyTarget.percentage}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, weeklyTarget.percentage)}%` }}
                aria-hidden="true"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDuration(weeklyTarget.workedMinutes)} of {formatDuration(weeklyTarget.targetMinutes)}
              {weeklyTarget.overTargetMinutes > 0
                ? `, ${formatDuration(weeklyTarget.overTargetMinutes)} over target`
                : `, ${formatDuration(weeklyTarget.remainingMinutes)} remaining`}
            </p>
          </div>
        ) : null}

        <ClockOutButton sessionId={session.id} />
      </CardContent>
    </Card>
  );
}
