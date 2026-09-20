import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Compass, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MocknetLesson } from "@/components/optn/mocknet-lesson";
import { MOCKNET_WALKTHROUGH } from "@/lib/optn/mocknet-demo";

const TOUR_SESSION_KEY = "optn-guided-tour";

function storedTourState(): { open: boolean; stepIndex: number } {
  if (typeof window === "undefined") return { open: false, stepIndex: 0 };
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(TOUR_SESSION_KEY) ?? "null") as {
      open?: boolean;
      stepIndex?: number;
    } | null;
    if (!parsed?.open || !Number.isInteger(parsed.stepIndex)) return { open: false, stepIndex: 0 };
    return {
      open: true,
      stepIndex: Math.min(MOCKNET_WALKTHROUGH.length - 1, Math.max(0, parsed.stepIndex ?? 0)),
    };
  } catch {
    return { open: false, stepIndex: 0 };
  }
}

export function GuidedTour({ pathname }: { pathname: string }) {
  const navigate = useNavigate();
  const [tour, setTour] = useState({ open: false, stepIndex: 0 });
  const [mounted, setMounted] = useState(false);
  const { open, stepIndex } = tour;
  const step = MOCKNET_WALKTHROUGH[stepIndex];

  useEffect(() => {
    setMounted(true);
    setTour(storedTourState());
  }, []);

  useEffect(() => {
    function openMocknetWalkthrough() {
      const next = { open: true, stepIndex: 0 };
      setTour(next);
      window.sessionStorage.setItem(TOUR_SESSION_KEY, JSON.stringify(next));
    }
    window.addEventListener("optn:open-mocknet-walkthrough", openMocknetWalkthrough);
    return () =>
      window.removeEventListener("optn:open-mocknet-walkthrough", openMocknetWalkthrough);
  }, []);

  function updateTour(next: { open: boolean; stepIndex: number }) {
    setTour(next);
    if (next.open) window.sessionStorage.setItem(TOUR_SESSION_KEY, JSON.stringify(next));
    else window.sessionStorage.removeItem(TOUR_SESSION_KEY);
  }

  useEffect(() => {
    if (!open || !step) return;
    if (pathname !== step.route) {
      void navigate({ to: step.route });
      return;
    }
    const timer = window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (!target) return;
      target.dataset.tourActive = "true";
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    return () => {
      window.clearTimeout(timer);
      document.querySelectorAll<HTMLElement>("[data-tour-active]").forEach((target) => {
        delete target.dataset.tourActive;
      });
    };
  }, [navigate, open, pathname, step]);

  function close() {
    updateTour({ open: false, stepIndex: 0 });
    document.querySelectorAll<HTMLElement>("[data-tour-active]").forEach((target) => {
      delete target.dataset.tourActive;
    });
  }

  if (!open) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!mounted}
        onClick={() => {
          updateTour({ open: true, stepIndex: 0 });
        }}
      >
        <Compass className="size-4" aria-hidden="true" />
        Walkthrough
      </Button>
    );
  }

  if (!step) return null;
  const last = stepIndex === MOCKNET_WALKTHROUGH.length - 1;

  return createPortal(
    <>
      <div className="pointer-events-none fixed inset-0 z-30 bg-bg/55" aria-hidden="true" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="guided-tour-title"
        className="fixed inset-x-4 bottom-4 z-50 ml-auto flex max-h-[calc(100dvh-2rem)] max-w-2xl flex-col overflow-hidden rounded-xl border border-accent/50 bg-surface-2 p-4 shadow-2xl md:bottom-6 md:right-6 md:left-auto"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              {step.eyebrow}
            </p>
            <h2 id="guided-tour-title" className="mt-1 text-lg font-medium">
              {step.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-md p-2 text-muted hover:bg-surface-3 hover:text-fg"
            aria-label="Close walkthrough"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <p className="mt-3 text-sm leading-6 text-muted">{step.description}</p>
          <MocknetLesson stepIndex={stepIndex} />
          <div
            className="mt-4 flex gap-1"
            aria-label={`Step ${stepIndex + 1} of ${MOCKNET_WALKTHROUGH.length}`}
          >
            {MOCKNET_WALKTHROUGH.map((item, index) => (
              <span
                key={`${item.target}-${index}`}
                className={
                  index <= stepIndex
                    ? "h-1 flex-1 rounded-full bg-accent"
                    : "h-1 flex-1 rounded-full bg-border-strong"
                }
              />
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => updateTour({ open: true, stepIndex: Math.max(0, stepIndex - 1) })}
              disabled={stepIndex === 0}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => updateTour({ open: true, stepIndex: 0 })}
              disabled={stepIndex === 0}
            >
              <RotateCcw className="size-4" />
              Restart
            </Button>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (last) close();
              else updateTour({ open: true, stepIndex: stepIndex + 1 });
            }}
          >
            {last ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
            {last ? "Finish Mocknet demo" : `Simulate: ${step.action}`}
          </Button>
        </div>
        <p className="mt-3 text-xs text-subtle">
          Mocknet only. This tour does not connect a wallet, sign, broadcast, or change live
          records.
        </p>
      </section>
    </>,
    document.body,
  );
}
