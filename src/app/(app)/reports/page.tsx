import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold">Reports</h1>
        <p className="text-muted-foreground">No report data yet.</p>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Totals and charts will use database-backed sessions.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Report helpers are isolated so ranges and midnight-crossing sessions can be tested directly.
        </CardContent>
      </Card>
    </div>
  );
}
