import type { Copy } from "@/lib/i18n/copy";
import type { ConsultationSuggestion, ConversationSummary } from "@/lib/conversation/types";
import { ArrowRightIcon, CheckIcon, CompassIcon, RotateIcon, StethoscopeIcon } from "./icons";

interface ConsultationSuggestionPanelProps {
  suggestion: ConsultationSuggestion;
  summary: ConversationSummary;
  copy: Copy;
  onBack: () => void;
  onHumanReview: () => void;
  onBooking: () => void;
  onRestart: () => void;
}

export function ConsultationSuggestionPanel({ suggestion, summary, copy, onBack, onHumanReview, onBooking, onRestart }: ConsultationSuggestionPanelProps) {
  return (
    <div className="care-scroll flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[700px]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-navy px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory">
            <CompassIcon className="h-3.5 w-3.5 text-bronze" />
            {copy.suggestion.eyebrow}
          </span>
          <span className="rounded-full border border-bronze/30 bg-bronze/8 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-bronze">{copy.common.demoBadge}</span>
        </div>

        <h1 className="mt-4 max-w-[34rem] font-heading text-[clamp(1.75rem,3.6vw,2.25rem)] font-bold leading-[1.08] tracking-[-0.04em] text-navy">
          {copy.suggestion.title}
        </h1>
        <p className="mt-3 max-w-[34rem] text-sm leading-6 text-graphite/70 sm:text-[0.95rem] sm:leading-7">{copy.suggestion.body}</p>

        <div className="mt-5 rounded-[1.5rem] border border-graphite/10 bg-white p-4 shadow-[0_16px_44px_rgba(43,47,54,0.06)] sm:p-5">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-bronze/12 text-bronze">
              <StethoscopeIcon className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bronze">{copy.suggestion.suggestedFor}</p>
              <h2 className="mt-1 font-heading text-xl font-bold tracking-[-0.03em] text-navy">{suggestion.practice}</h2>
              <p className="mt-2 text-[13px] leading-6 text-graphite/65">{suggestion.rationale}</p>
            </div>
            <span className="hidden rounded-full bg-emerald-500/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-emerald-700 sm:inline-flex">{copy.common.simulated}</span>
          </div>

          <div className="mt-5 grid gap-3 border-t border-graphite/8 pt-4 sm:grid-cols-2">
            <div className="rounded-xl bg-ivory p-3.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-graphite/45">{copy.suggestion.whyTitle}</p>
              <p className="mt-1.5 text-[13px] leading-6 text-navy">{suggestion.rationale}</p>
            </div>
            <div className="rounded-xl bg-navy p-3.5 text-ivory">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bronze">{copy.suggestion.noProfessional}</p>
              <p className="mt-1.5 text-[13px] leading-6 text-ivory/75">{suggestion.disclaimer}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.25rem] border border-bronze/25 bg-bronze/8 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bronze">{copy.summary.situation}</p>
            <p className="mt-1.5 text-[13px] leading-6 text-navy">{summary.concern}</p>
            <p className="mt-2.5 text-xs leading-5 text-graphite/60">{copy.summary.since}: {summary.contextAnswer}</p>
          </div>
          <div className="rounded-[1.25rem] border border-graphite/10 bg-ivory p-4">
            <div className="flex items-start gap-2.5">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
              <div>
                <h2 className="font-heading text-[15px] font-bold text-navy">{copy.suggestion.humanTitle}</h2>
                <p className="mt-1.5 text-[13px] leading-6 text-graphite/65">{copy.suggestion.humanBody}</p>
                <button type="button" onClick={onHumanReview} className="mt-3 rounded-full border border-bronze/40 px-3 py-1.5 text-[11px] font-semibold text-bronze transition hover:bg-bronze hover:text-navy">
                  {copy.suggestion.humanCta}
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-graphite/45">{suggestion.disclaimer}</p>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <button type="button" onClick={onRestart} className="inline-flex items-center justify-center gap-2 rounded-full border border-graphite/15 px-4 py-2.5 text-[13px] font-semibold text-graphite/70 transition hover:border-graphite/35 hover:text-navy">
            <RotateIcon className="h-3.5 w-3.5" />
            {copy.chat.reset}
          </button>
          <button type="button" onClick={onBack} className="inline-flex items-center justify-center rounded-full border border-graphite/15 px-4 py-2.5 text-[13px] font-semibold text-graphite/70 transition hover:border-graphite/35 hover:text-navy">
            {copy.suggestion.back}
          </button>
          <button type="button" onClick={onBooking} className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-4 py-2.5 text-[13px] font-semibold text-ivory transition hover:bg-bronze hover:text-navy sm:ml-auto">
            {copy.suggestion.bookingCta}
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
