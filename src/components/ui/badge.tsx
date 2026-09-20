import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  children,
}: {
  className?: string;
  tone?: "neutral" | "accent" | "pass" | "warn" | "fail" | "demo";
  children: ReactNode;
}) {
  const tones = {
    neutral: "border-border text-muted",
    accent: "border-accent/40 text-accent",
    pass: "border-pass/40 text-pass",
    warn: "border-warn/40 text-warn",
    fail: "border-fail/40 text-fail",
    demo: "border-demo/40 text-demo",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
