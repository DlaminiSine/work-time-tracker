import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Profile preferences default to America/New_York, 12-hour time, Sunday week starts, and USD.</p>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Account defaults</CardTitle>
          <CardDescription>Stored on the profile created during registration.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div>Timezone: America/New_York</div>
          <div>Clock: 12-hour</div>
          <div>Week starts: Sunday</div>
          <div>Currency: USD</div>
        </CardContent>
      </Card>
    </div>
  );
}
