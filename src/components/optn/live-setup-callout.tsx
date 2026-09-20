import { Link } from "@tanstack/react-router";
import { Compass, Landmark, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export function LiveSetupCallout({
  title = "Complete the control-plane setup",
  description = "Live Chipnet records stay empty until the connected wallets establish an organization, enroll a payout recipient, and attach a provider-proven covenant outpoint.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="border-dashed">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <CardTitle>{title}</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          <ol className="mt-4 grid gap-2 text-sm text-muted md:grid-cols-3">
            <li className="flex items-center gap-2">
              <UsersRound className="size-4 text-accent" />
              1. Create organization
            </li>
            <li className="flex items-center gap-2">
              <Landmark className="size-4 text-accent" />
              2. Fund and attach vault
            </li>
            <li className="flex items-center gap-2">
              <Compass className="size-4 text-accent" />
              3. Publish a plan
            </li>
          </ol>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link to="/organization">Open setup</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.dispatchEvent(new Event("optn:open-mocknet-walkthrough"))}
          >
            <Compass className="size-4" />
            Run Mocknet demo
          </Button>
        </div>
      </div>
    </Card>
  );
}
