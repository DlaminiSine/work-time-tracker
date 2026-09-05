import Link from "next/link";
import { LogOut, TimerReset } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { DesktopNavigation, MobileNavigation } from "@/components/layout/navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AppShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-sidebar p-4 text-sidebar-foreground lg:flex">
        <Link href="/timer" className="mb-8 flex items-center gap-3 rounded-md px-2 py-1.5">
          <span className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <TimerReset className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold">Clockwise</span>
        </Link>
        <DesktopNavigation />
        <div className="mt-auto space-y-3 border-t border-sidebar-border pt-4">
          <p className="truncate text-sm text-muted-foreground">{userEmail}</p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={logoutAction} className="flex-1">
              <Button className="w-full justify-start" type="submit" variant="ghost">
                <LogOut className="size-4" aria-hidden="true" />
                Log out
              </Button>
            </form>
          </div>
        </div>
      </aside>
      <div className="flex min-h-dvh flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-5 backdrop-blur lg:hidden">
          <Link href="/timer" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <TimerReset className="size-4" aria-hidden="true" />
            </span>
            Clockwise
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="icon" aria-label="Log out" title="Log out">
                <LogOut className="size-4" aria-hidden="true" />
              </Button>
            </form>
          </div>
        </header>
        <main className="flex-1 px-5 py-6 pb-28 sm:px-8 lg:px-10 lg:py-8 lg:pb-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
