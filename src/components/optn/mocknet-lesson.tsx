import { Blocks, Check, FileCheck2, ShieldCheck, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  MOCKNET_TRANSACTION,
  MOCKNET_UTXOS,
  MOCKNET_WALKTHROUGH,
  mocknetCompletedActions,
} from "@/lib/optn/mocknet-demo";

const recordIcon = {
  utxo: WalletCards,
  policy: ShieldCheck,
  proposal: FileCheck2,
  transaction: Blocks,
} as const;

export function MocknetLesson({ stepIndex }: { stepIndex: number }) {
  const step = MOCKNET_WALKTHROUGH[stepIndex];
  if (!step) return null;
  const Icon = recordIcon[step.record.kind];
  const completed = mocknetCompletedActions(stepIndex);

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-demo/30 bg-demo/5 px-3 py-2">
        <div className="flex items-center gap-2">
          <Blocks className="size-4 text-demo" aria-hidden="true" />
          <span className="text-xs font-medium text-fg">Mocknet simulation</span>
        </div>
        <Badge tone="demo">{completed}/8 actions simulated</Badge>
      </div>

      <section className="rounded-lg border border-border bg-bg p-3" aria-label="Mocknet record">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Icon className="size-4 shrink-0 text-accent" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-medium">{step.record.label}</p>
              <p className="truncate font-mono text-[11px] text-subtle">{step.record.id}</p>
            </div>
          </div>
          <Badge tone="pass">{step.record.status}</Badge>
        </div>
        <dl className="mt-3 grid gap-2 border-t border-border pt-3 text-xs sm:grid-cols-3">
          {step.record.fields.map((field) => (
            <div key={field.label}>
              <dt className="text-subtle">{field.label}</dt>
              <dd className="mt-0.5 font-mono text-fg">{field.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-lg border border-border bg-surface p-3">
        <p className="text-xs font-medium text-fg">What you do in production</p>
        <p className="mt-1 text-xs leading-5 text-muted">{step.productionAction}</p>
        <ul className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs leading-5 text-muted">
          {step.checks.map((check) => (
            <li key={check} className="flex gap-2">
              <Check className="mt-0.5 size-3.5 shrink-0 text-pass" aria-hidden="true" />
              <span>{check}</span>
            </li>
          ))}
        </ul>
      </section>

      <details className="rounded-lg border border-border bg-surface px-3 py-2 text-xs">
        <summary className="cursor-pointer font-medium text-muted">
          View complete Mocknet ledger
        </summary>
        <div className="mt-3 space-y-2 border-t border-border pt-3 text-muted">
          <p>
            <span className="text-subtle">Funding:</span>{" "}
            <span className="font-mono">{MOCKNET_UTXOS.funding.outpoint}</span> · 1.00001000 BCH ·
            unspent
          </p>
          <p>
            <span className="text-subtle">Vault:</span>{" "}
            <span className="font-mono">{MOCKNET_UTXOS.vault.outpoint}</span> · 1.00000000 BCH ·
            BoundedRelease P2SH32
          </p>
          <p>
            <span className="text-subtle">Release:</span>{" "}
            <span className="font-mono">{MOCKNET_TRANSACTION.txid}</span> · 0.02000000 BCH vendor ·
            0.97999000 BCH successor · 1,000 sats fee
          </p>
        </div>
      </details>
    </div>
  );
}
