import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CompaniesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-20 rounded-lg bg-muted" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
        <Card>
          <CardHeader>
            <div className="h-5 w-32 rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 rounded bg-muted" />
            <div className="h-24 rounded bg-muted" />
            <div className="h-10 rounded bg-muted" />
          </CardContent>
        </Card>
        <div className="space-y-3">
          <div className="h-32 rounded-lg bg-muted" />
          <div className="h-32 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
