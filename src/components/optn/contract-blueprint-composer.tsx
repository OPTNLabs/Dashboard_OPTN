import { ArrowRight, BadgeCheck, LockKeyhole, WalletCards } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

type ComposerElement = "authorization" | "input" | "payment" | "successor" | "limits";

type Blueprint = {
  maxPaymentSatoshis: string;
  maxFeeSatoshis: string;
  sourceAssembly: string;
};

const descriptions: Record<
  ComposerElement,
  { title: string; enforcement: "on-chain" | "off-chain-policy"; body: string; editable: string }
> = {
  authorization: {
    title: "Operator authorization",
    enforcement: "on-chain",
    body: "The covenant verifies one signature from the WalletConnect organization owner before the UTXO can move.",
    editable: "The signing public-key hash is fixed when this next vault is compiled and funded.",
  },
  input: {
    title: "Covenant input",
    enforcement: "on-chain",
    body: "This template accepts exactly one native-BCH P2SH32 covenant UTXO as transaction input 0. Extra fee inputs and CashTokens are not part of this template.",
    editable: "A different source means a different funded vault; it cannot be added to an existing one.",
  },
  payment: {
    title: "Payment output 0",
    enforcement: "on-chain",
    body: "Transaction output 0 must pay the recipient wallet enrolled by WalletConnect. The amount must be positive and may not exceed the compiled payment cap.",
    editable: "The recipient is set by recipient enrollment. The cap can be changed only before funding the next vault.",
  },
  successor: {
    title: "Successor output 1",
    enforcement: "on-chain",
    body: "The remainder must return to the exact same P2SH32 covenant lock at output 1. This preserves the control for the BCH that remains.",
    editable: "This is deliberately fixed. A missing or differently locked successor causes covenant validation to fail.",
  },
  limits: {
    title: "Payment and fee controls",
    enforcement: "on-chain",
    body: "The script checks the payment cap and computes the transaction fee as input value minus both required outputs. The fee may not exceed the configured ceiling.",
    editable: "These are the two safe parameters the owner may tune in this v1 template before it is funded.",
  },
};

function ComposerBlock({
  element,
  label,
  detail,
  selected,
  onSelect,
}: {
  element: ComposerElement;
  label: string;
  detail: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      aria-pressed={selected}
      className={`min-w-40 rounded-lg border p-3 text-left transition-colors ${
        selected
          ? "border-accent bg-accent/10 ring-1 ring-accent/40"
          : "border-border bg-surface-2 hover:border-accent/50"
      }`}
      onClick={onSelect}
      type="button"
    >
      <p className="font-mono text-[10px] uppercase tracking-wide text-subtle">{element}</p>
      <p className="mt-1 text-sm font-medium">{label}</p>
      <p className="mt-1 text-[11px] leading-4 text-muted">{detail}</p>
    </button>
  );
}

export function ContractBlueprintComposer({
  ownerAccount,
  recipientAccount,
  blueprint,
  paymentCap,
  feeCap,
  onPaymentCapChange,
  onFeeCapChange,
  onCompile,
  pending,
}: {
  ownerAccount: string;
  recipientAccount: string;
  blueprint: Blueprint;
  paymentCap: string;
  feeCap: string;
  onPaymentCapChange: (value: string) => void;
  onFeeCapChange: (value: string) => void;
  onCompile: () => void;
  pending: boolean;
}) {
  const [selected, setSelected] = useState<ComposerElement>("payment");
  const detail = descriptions[selected];

  return (
    <Card className="mt-4" data-tour="contract-composer">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Contract composer
          </p>
          <CardTitle className="mt-1">Bounded Release — next vault</CardTitle>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Assemble a reviewed spending contract without writing code. This is the visual equivalent
            of choosing a contract template and its constructor arguments; it compiles a new,
            reviewable CashAssembly artifact rather than interpreting the diagram at spend time.
          </p>
        </div>
        <Badge tone="pass">1 reviewed template</Badge>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-bg p-3">
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          <ComposerBlock
            element="authorization"
            label="Owner signature"
            detail="Wallet-derived operator"
            selected={selected === "authorization"}
            onSelect={() => setSelected("authorization")}
          />
          <ArrowRight className="size-4 shrink-0 text-accent" aria-hidden="true" />
          <ComposerBlock
            element="input"
            label="One vault UTXO"
            detail="input 0 · native BCH"
            selected={selected === "input"}
            onSelect={() => setSelected("input")}
          />
          <ArrowRight className="size-4 shrink-0 text-accent" aria-hidden="true" />
          <ComposerBlock
            element="payment"
            label="Payout"
            detail="output 0 · enrolled recipient"
            selected={selected === "payment"}
            onSelect={() => setSelected("payment")}
          />
          <ArrowRight className="size-4 shrink-0 text-pass" aria-hidden="true" />
          <ComposerBlock
            element="successor"
            label="Controlled remainder"
            detail="output 1 · same covenant"
            selected={selected === "successor"}
            onSelect={() => setSelected("successor")}
          />
        </div>
        <button
          className={`mt-3 w-full rounded-lg border p-3 text-left transition-colors ${
            selected === "limits"
              ? "border-accent bg-accent/10 ring-1 ring-accent/40"
              : "border-border bg-surface-2 hover:border-accent/50"
          }`}
          onClick={() => setSelected("limits")}
          type="button"
        >
          <p className="font-mono text-[10px] uppercase tracking-wide text-subtle">constraints</p>
          <p className="mt-1 text-sm font-medium">Payment cap and fee ceiling</p>
          <p className="mt-1 text-[11px] leading-4 text-muted">
            These values become literal numeric checks in the generated covenant.
          </p>
        </button>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-lg border border-border bg-surface-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{detail.title}</p>
            <Badge tone={detail.enforcement === "on-chain" ? "pass" : "warn"}>
              {detail.enforcement}
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">{detail.body}</p>
          <p className="mt-3 text-xs leading-5 text-subtle">
            <span className="font-medium text-fg">What an admin can change: </span>
            {detail.editable}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface-2 p-4">
          <p className="text-sm font-medium">Wallet-derived contract arguments</p>
          <div className="mt-3 grid gap-3 text-xs">
            <div className="flex gap-2">
              <LockKeyhole className="mt-0.5 size-4 shrink-0 text-pass" aria-hidden="true" />
              <p className="min-w-0">
                <span className="block text-subtle">operator key hash</span>
                <span className="block truncate font-mono text-fg">{ownerAccount}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <WalletCards className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              <p className="min-w-0">
                <span className="block text-subtle">recipient lock</span>
                <span className="block truncate font-mono text-fg">{recipientAccount}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-pass" aria-hidden="true" />
              <p className="text-muted">
                Wallet values are derived from the active WalletConnect session and recipient
                enrollment. They are not editable text fields or environment configuration.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div>
          <Label>Payment cap (BCH)</Label>
          <Input value={paymentCap} onChange={(event) => onPaymentCapChange(event.target.value)} />
        </div>
        <div>
          <Label>Fee cap (sats)</Label>
          <Input value={feeCap} onChange={(event) => onFeeCapChange(event.target.value)} />
        </div>
        <div className="flex items-end">
          <Button className="w-full" disabled={pending} onClick={onCompile} type="button">
            Compile next-vault artifact
          </Button>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-subtle">
        Compiling updates only the next funding artifact. It never mutates an attached UTXO, an
        existing P2SH32 lock, or a previously published plan.
      </p>
      <details className="mt-4 rounded-lg border border-border bg-bg p-3">
        <summary className="cursor-pointer text-sm font-medium">Inspect generated CashAssembly</summary>
        <p className="mt-2 text-xs text-muted">
          Read-only source generated from this visual template. The compiled hash and P2SH32 address
          are shown in the funding-artifact card below.
        </p>
        <pre className="mt-3 max-h-60 overflow-auto font-mono text-xs leading-5 text-subtle">
          {blueprint.sourceAssembly}
        </pre>
      </details>
    </Card>
  );
}
