import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "History",
};

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold">History</h1>
        <p className="text-muted-foreground">No work sessions yet.</p>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Session log</CardTitle>
          <CardDescription>Newest sessions will appear first.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Connect companies and projects before recording work sessions.
        </CardContent>
      </Card>
    </div>
  );
}
