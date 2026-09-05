import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-20 rounded-lg bg-muted" />
      <Card>
        <CardHeader>
          <div className="h-5 w-28 rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-10 rounded bg-muted" />
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <div className="h-96 rounded-lg bg-muted" />
        <div className="space-y-3">
          <div className="h-40 rounded-lg bg-muted" />
          <div className="h-40 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
