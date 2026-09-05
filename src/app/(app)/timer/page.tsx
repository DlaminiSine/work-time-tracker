import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, CalendarRange, Clock3, FolderKanban, RefreshCw } from "lucide-react";
import { ActiveSessionCard } from "@/components/timer/active-session-card";
import { ClockInForm } from "@/components/timer/clock-in-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getTimerPageData, type TimerPageData } from "@/lib/timer/data";
import { formatDuration, getDurationMinutes } from "@/lib/time/duration";
import { formatClockTimeRange } from "@/lib/time/format";
import type { WorkSessionWithDetails } from "@/lib/work-sessions/queries";

export const metadata: Metadata = {
  title: "Timer",
};

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Clock3;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-4 text-primary" aria-hidden="true" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-mono text-4xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function TodaySessionRow({
  session,
  data,
}: {
  session: WorkSessionWithDetails;
  data: TimerPageData;
}) {
  return (
    <li className="grid gap-3 border-b py-4 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0 space-y-1">
        <div className="flex min-w-0 items-center gap-2 font-medium">
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: session.project?.color ?? session.company?.color ?? "var(--primary)" }}
            aria-hidden="true"
          />
          <span className="truncate">{session.project?.name ?? "Project unavailable"}</span>
          {session.project?.is_archived ? <Badge>Archived</Badge> : null}
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {session.company?.name ?? "Company unavailable"}
          {session.company?.is_archived ? " (company archived)" : ""}
          {session.task_description ? ` - ${session.task_description}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm sm:justify-end">
        <span className="font-mono text-muted-foreground">
          {formatClockTimeRange(session.clock_in, session.clock_out, data.profile.timezone, data.profile.time_format)}
        </span>
        <Badge className="text-foreground">{formatDuration(getDurationMinutes(session.clock_in, session.clock_out))}</Badge>
      </div>
    </li>
  );
}

export default async function TimerPage() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  let data: TimerPageData | null = null;
  let loadError = false;

  try {
    data = await getTimerPageData(user.id);
  } catch {
    loadError = true;
  }

  if (loadError || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Timer" description="Track work sessions against active companies and projects." />
        <EmptyState
          title="Timer could not load"
          description="Refresh the page and try again. If this keeps happening, check the Supabase project setup."
        >
          <Button asChild variant="outline">
            <Link href="/settings">
              <RefreshCw className="size-4" aria-hidden="true" />
              Check settings
            </Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timer"
        description="Clock in with an active project, then let the running session calculate from the database timestamp."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Today"
          value={formatDuration(data.totals.today)}
          description={`Calculated in ${data.profile.timezone}`}
          icon={Clock3}
        />
        <SummaryCard
          title="This Week"
          value={formatDuration(data.totals.week)}
          description={data.profile.week_starts_on === 1 ? "Week starts Monday" : "Week starts Sunday"}
          icon={CalendarRange}
        />
        <SummaryCard
          title="This Month"
          value={formatDuration(data.totals.month)}
          description="Includes the active session through now"
          icon={CalendarDays}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,32rem)_1fr]">
        {data.activeSession ? (
          <ActiveSessionCard
            session={data.activeSession}
            profile={data.profile}
            weeklyTarget={data.activeProjectWeeklyTarget}
          />
        ) : (
          <ClockInForm options={data.options} />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderKanban className="size-5 text-primary" aria-hidden="true" />
              Today completed work
            </CardTitle>
            <CardDescription>Completed sessions that overlap the current local reporting day.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.todayCompletedSessions.length === 0 ? (
              <p className="rounded-md border bg-background p-4 text-sm text-muted-foreground">
                Completed sessions from today will appear here after you clock out.
              </p>
            ) : (
              <ul>
                {data.todayCompletedSessions.map((session) => (
                  <TodaySessionRow key={session.id} session={session} data={data} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
