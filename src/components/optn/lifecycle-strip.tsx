import type { LifecycleStage } from "@/lib/optn/types";
import { LIFECYCLE_LABELS, SUCCESS_FLOW_STAGES, isFailureStage, successIndex } from "@/lib/optn/lifecycle";
import { cn } from "@/lib/utils";

export function LifecycleStrip({ stage }: { stage: LifecycleStage }) {
  if (isFailureStage(stage)) {
    return (
      <div className="rounded-lg border border-fail/40 bg-fail/10 px-3 py-2 text-xs text-fail">
        {LIFECYCLE_LABELS[stage]}
      </div>
    );
  }
  const current = successIndex(stage);
  return (
    <ol className="flex flex-wrap gap-1">
      {SUCCESS_FLOW_STAGES.map((item, index) => (
        <li
          key={item}
          className={cn(
            "rounded-full border px-2 py-1 text-[10px] uppercase tracking-wide",
            index < current && "border-pass/30 text-pass",
            index === current && "border-accent text-accent",
            index > current && "border-border text-subtle",
          )}
        >
          {LIFECYCLE_LABELS[item]}
        </li>
      ))}
    </ol>
  );
}
