import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Boxes,
  FileStack,
  Fingerprint,
  LayoutDashboard,
  ListChecks,
  FlaskConical,
  ScrollText,
  Shield,
  UsersRound,
  Wallet,
} from "lucide-react";
import type { AppMode, Network, OperatorSession, PublicConfig } from "@/lib/optn/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GuidedTour } from "@/components/optn/guided-tour";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/organization", label: "Organization", icon: UsersRound },
  { to: "/vaults", label: "Vaults", icon: Boxes },
  { to: "/plans", label: "Plans", icon: FileStack },
  { to: "/studio", label: "Studio", icon: Activity },
  { to: "/mock", label: "Mock workspace", icon: FlaskConical },
  { to: "/proposals", label: "Proposals", icon: ListChecks },
  { to: "/approvals", label: "Approvals", icon: Fingerprint },
  { to: "/audit", label: "Audit", icon: ScrollText },
  { to: "/capabilities", label: "Capabilities", icon: Shield },
];

function ModeBadge({ mode, network }: { mode: AppMode; network: Network }) {
  if (mode === "demo") {
    return (
      <div className="flex flex-wrap gap-1.5">
        <Badge tone="demo">Demo</Badge>
        <Badge tone="accent">{network === "chipnet" ? "Chipnet fixtures" : "Mainnet gated"}</Badge>
      </div>
    );
  }
  if (mode === "mainnet-live") return <Badge tone="fail">Mainnet live</Badge>;
  return <Badge tone="accent">Chipnet live</Badge>;
}

export function AppShell({
  config,
  session,
  children,
}: {
  config: PublicConfig;
  session: OperatorSession | null;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
          <div className="border-b border-border px-4 py-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">OPTN</p>
            <p className="mt-1 text-sm font-medium">Control Plane</p>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 p-2">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-md px-3 text-sm text-muted hover:bg-surface-2 hover:text-fg",
                    active && "bg-surface-2 text-fg",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-3 text-[11px] text-subtle">
            No keys in the browser. Broadcast is never one-click.
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/80 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-3">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted md:hidden">
                OPTN
              </p>
              <ModeBadge mode={config.mode} network={config.network} />
              {config.network === "mainnet" ? (
                <Badge tone="fail">Mainnet</Badge>
              ) : (
                <Badge tone="accent">Chipnet</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted">
              <GuidedTour pathname={pathname} />
              <span className="hidden sm:inline">
                {session
                  ? `${session.role} · ${session.account.slice(0, 22)}…`
                  : "Not authenticated"}
              </span>
              <Link to="/wallet" className="text-accent hover:underline">
                {session ? "Session" : "Connect"}
              </Link>
            </div>
          </header>
          <div className="flex gap-1 overflow-x-auto border-b border-border px-2 py-2 md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "shrink-0 rounded-full border border-border px-3 py-1.5 text-xs text-muted",
                  pathname === item.to && "border-accent text-fg",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
