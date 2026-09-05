import { cn } from "@/lib/utils";

export function FieldMessage({
  children,
  tone = "error",
}: {
  children?: React.ReactNode;
  tone?: "error" | "success" | "muted";
}) {
  if (!children) {
    return null;
  }

  return (
    <p
      className={cn(
        "text-sm",
        tone === "error" && "text-destructive",
        tone === "success" && "text-primary",
        tone === "muted" && "text-muted-foreground",
      )}
    >
      {children}
    </p>
  );
}
