import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/proposals")({ component: ProposalsLayout });

function ProposalsLayout() {
  return <Outlet />;
}
