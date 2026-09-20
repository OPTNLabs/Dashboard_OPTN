import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { MockWorkspace } from "@/components/optn/mock-workspace";
import { getCurrentSession } from "@/lib/optn/api";

export const Route = createFileRoute("/mock")({ component: MockWorkspacePage });

function MockWorkspacePage() {
  const sessionQuery = useQuery({ queryKey: ["session"], queryFn: () => getCurrentSession() });
  if (!sessionQuery.data?.config) return <p className="p-8 text-muted">Loading mock workspace…</p>;
  return (
    <AppShell config={sessionQuery.data.config} session={sessionQuery.data.session ?? null}>
      <MockWorkspace />
    </AppShell>
  );
}
