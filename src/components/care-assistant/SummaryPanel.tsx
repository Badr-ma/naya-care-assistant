import type { Copy } from "@/lib/i18n/copy";
import type { ConversationSummary } from "@/lib/conversation/types";
import { ArrowRightIcon, ClipboardIcon, InfoIcon } from "./icons";

interface SummaryPanelProps {
  summary: ConversationSummary;
  copy: Copy;
  onEdit: () => void;
  onContinue: () => void;
}

function testStatusLabel(summary: ConversationSummary, copy: Copy): string {
  switch (summary.testStatus) {
    case "yes":
      return copy.conversation.testStatus.yes;
    case "no":
      return copy.conversation.testStatus.no;
    case "unsure":
      return copy.conversation.testStatus.unsure;
    default:
      return copy.conversation.testStatus.none;
  }
}

function documentLabel(count: number, copy: Copy): string {
  if (count === 0) return copy.summary.noDocuments;
  if (count === 1) return copy.summary.oneDocument;
  return copy.summary.manyDocuments.replace("{count}", String(count));
}

export function SummaryPanel({ summary, copy, onEdit, onContinue }: SummaryPanelProps) {
  return (
    <section aria-labelledby="summary-title" className="rounded-[1.25rem] border border-bronze/25 bg-ivory p-4 shadow-[0_10px_28px_rgba(43,47,54,0.05)]">
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy text-bronze">
          <ClipboardIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bronze">{copy.summary.eyebrow}</p>
          <h2 id="summary-title" className="mt-1 font-heading text-[15px] font-bold tracking-[-0.02em] text-navy">{copy.summary.title}</h2>
          <p className="mt-1 text-xs leading-5 text-graphite/60">{copy.summary.body}</p>
        </div>
      </div>

      <dl className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
        <div className="rounded-xl border border-graphite/8 bg-white p-3">
          <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-graphite/45">{copy.summary.situation}</dt>
          <dd className="mt-1.5 text-[13px] leading-6 text-navy">{summary.concern}</dd>
        </div>
        <div className="rounded-xl border border-graphite/8 bg-white p-3">
          <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-graphite/45">{copy.summary.since}</dt>
          <dd className="mt-1.5 text-[13px] leading-6 text-navy">{summary.contextAnswer}</dd>
        </div>
        <div className="rounded-xl border border-graphite/8 bg-white p-3">
          <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-graphite/45">{copy.summary.examinations}</dt>
          <dd className="mt-1.5 text-[13px] leading-6 text-navy">{testStatusLabel(summary, copy)}</dd>
        </div>
        <div className="rounded-xl border border-graphite/8 bg-white p-3">
          <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-graphite/45">{copy.summary.documents}</dt>
          <dd className="mt-1.5 text-[13px] leading-6 text-navy">{documentLabel(summary.attachments.length, copy)}</dd>
        </div>
      </dl>

      <div className="mt-3 flex items-start gap-2 rounded-xl bg-bronze/8 px-3 py-2.5 text-[11px] leading-5 text-graphite/70">
        <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bronze" />
        <p>{summary.note || copy.summary.note}</p>
      </div>

      <div className="mt-3.5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onEdit} className="rounded-full border border-graphite/15 px-3.5 py-2 text-[12px] font-semibold text-graphite/70 transition hover:border-graphite/35 hover:text-navy">
          {copy.summary.edit}
        </button>
        <button type="button" onClick={onContinue} className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-navy px-4 py-2 text-[13px] font-semibold text-ivory transition hover:bg-bronze hover:text-navy">
          {copy.summary.continue}
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}
