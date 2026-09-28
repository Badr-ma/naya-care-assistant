import type { Copy } from "@/lib/i18n/copy";
import type { BookingSubmissionResult, ConsultationSuggestion, PatientContact } from "@/lib/conversation/types";
import { CheckCircleIcon, RotateIcon, ShieldIcon } from "./icons";

interface ConfirmationPanelProps {
  copy: Copy;
  result: BookingSubmissionResult;
  contact: PatientContact;
  suggestion: ConsultationSuggestion;
  onRestart: () => void;
}

export function ConfirmationPanel({ copy, result, contact, suggestion, onRestart }: ConfirmationPanelProps) {
  return (
    <div className="care-scroll flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-9" aria-labelledby="confirmation-title">
      <div className="mx-auto max-w-[700px]">
        <div className="flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-700">
            <CheckCircleIcon className="h-7 w-7" />
          </span>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-navy px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory">{copy.confirmation.eyebrow}</span>
          <span className="rounded-full border border-bronze/30 bg-bronze/8 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-bronze">{copy.confirmation.simulated}</span>
        </div>
        <h1 id="confirmation-title" className="mt-4 text-center font-heading text-[clamp(1.75rem,3.6vw,2.25rem)] font-bold leading-[1.08] tracking-[-0.04em] text-navy">
          {copy.confirmation.title}
        </h1>
        <p className="mx-auto mt-3 max-w-[34rem] text-center text-sm leading-6 text-graphite/70 sm:text-[0.95rem] sm:leading-7">{copy.confirmation.body}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.25rem] border border-graphite/10 bg-white p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-graphite/45">{copy.confirmation.patient}</p>
            <p className="mt-1.5 font-heading text-[15px] font-bold text-navy">{contact.fullName}</p>
            <p className="mt-0.5 text-[13px] text-graphite/60">{contact.email}</p>
          </div>
          <div className="rounded-[1.25rem] border border-bronze/25 bg-bronze/8 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bronze">{copy.confirmation.consultation}</p>
            <p className="mt-1.5 font-heading text-[15px] font-bold text-navy">{suggestion.practice}</p>
            <p className="mt-0.5 text-[13px] text-graphite/60">{copy.suggestion.noProfessional}</p>
          </div>
        </div>

        <div className="mt-3.5 rounded-[1.25rem] border border-graphite/10 bg-ivory p-4">
          <div className="flex items-start gap-2.5">
            <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-graphite/45">{copy.confirmation.reference}</p>
              <p className="mt-1.5 text-[13px] leading-6 text-navy">{copy.confirmation.referenceNone}</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="font-heading text-[15px] font-bold text-navy">{copy.confirmation.nextTitle}</h2>
          <p className="mt-1 text-[13px] leading-6 text-graphite/60">{result.message}</p>
          <ol className="mt-3 space-y-2">
            {copy.confirmation.steps.map((step, index) => (
              <li key={step} className="flex items-center gap-2.5 rounded-xl border border-graphite/8 bg-white px-3.5 py-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy font-mono text-[9.5px] text-ivory">{String(index + 1).padStart(2, "0")}</span>
                <p className="text-[13px] leading-6 text-graphite/70">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-navy px-3.5 py-3 text-[11px] leading-5 text-ivory/75">
          <ShieldIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bronze" />
          <p>{copy.confirmation.clinicNote}</p>
        </div>

        <button type="button" onClick={onRestart} className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-graphite/15 px-4 py-2.5 text-[13px] font-semibold text-graphite/70 transition hover:border-graphite/35 hover:text-navy">
          <RotateIcon className="h-3.5 w-3.5" />
          {copy.confirmation.backToStart}
        </button>
      </div>
    </div>
  );
}
