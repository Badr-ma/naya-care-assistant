import type { Copy } from "@/lib/i18n/copy";
import type { HumanReviewState } from "@/lib/conversation/types";
import { ArrowRightIcon, CheckCircleIcon, RotateIcon, ShieldIcon } from "./icons";

interface HumanReviewPanelProps {
  copy: Copy;
  state: HumanReviewState;
  onContinue: () => void;
  onBack: () => void;
  onRestart: () => void;
}

export function HumanReviewPanel({ copy, state, onContinue, onBack, onRestart }: HumanReviewPanelProps) {
  return (
    <div className="care-scroll flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-9" aria-labelledby="human-review-title">
      <div className="mx-auto max-w-[700px]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-navy px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory">{copy.humanReview.eyebrow}</span>
          <span className="rounded-full border border-bronze/30 bg-bronze/8 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-bronze">{copy.common.simulated}</span>
        </div>
        <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-bronze/12 text-bronze">
          <ShieldIcon className="h-6 w-6" />
        </div>
        <h1 id="human-review-title" className="mt-4 font-heading text-[clamp(1.75rem,3.6vw,2.25rem)] font-bold leading-[1.08] tracking-[-0.04em] text-navy">{copy.humanReview.title}</h1>
        <p className="mt-3 text-sm leading-6 text-graphite/70 sm:text-[0.95rem] sm:leading-7">{copy.humanReview.body}</p>

        <div className="mt-5 rounded-[1.5rem] border border-bronze/25 bg-bronze/8 p-4 sm:p-5">
          <div className="flex items-start gap-2.5">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
            <div>
              <h2 className="font-heading text-[15px] font-bold text-navy">{copy.humanReview.status}</h2>
              <p className="mt-1.5 text-[13px] leading-6 text-graphite/65">{copy.humanReview.statusBody}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bronze">{state.requestedAt}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <button type="button" onClick={onRestart} className="inline-flex items-center justify-center gap-2 rounded-full border border-graphite/15 px-4 py-2.5 text-[13px] font-semibold text-graphite/70 transition hover:border-graphite/35 hover:text-navy">
            <RotateIcon className="h-3.5 w-3.5" />
            {copy.chat.reset}
          </button>
          <button type="button" onClick={onBack} className="rounded-full border border-graphite/15 px-4 py-2.5 text-[13px] font-semibold text-graphite/70 transition hover:border-graphite/35 hover:text-navy">{copy.humanReview.back}</button>
          <button type="button" onClick={onContinue} className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-bronze hover:text-navy sm:ml-auto">
            {copy.humanReview.continue}
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
