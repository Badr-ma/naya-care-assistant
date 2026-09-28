import type { Copy } from "@/lib/i18n/copy";
import type { ConversationStage } from "@/lib/conversation/types";
import { CompassIcon, LockIcon, ShieldIcon } from "./icons";

interface ConversationSidebarProps {
  stage: ConversationStage;
  copy: Copy;
  onPreview: () => void;
}

const stepKeys: Array<keyof Copy["sidebar"]["steps"]> = [
  "welcome",
  "conversation",
  "examinations",
  "suggestion",
  "booking",
];

const stageIndex: Record<ConversationStage, number> = {
  welcome: 0,
  concern: 1,
  context: 1,
  examinations: 2,
  documents: 2,
  summary: 3,
  suggestion: 3,
  "human-review": 3,
  booking: 4,
  confirmation: 4,
};

export function ConversationSidebar({ stage, copy, onPreview }: ConversationSidebarProps) {
  const activeIndex = stageIndex[stage];

  return (
    <aside className="flex flex-col gap-3">
      <div className="rounded-2xl border border-graphite/10 bg-ivory p-3.5 shadow-[0_14px_40px_rgba(43,47,54,0.05)]">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-bronze/12 text-bronze">
            <CompassIcon className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-bronze">{copy.brand.name}</p>
            <p className="mt-0.5 text-[12px] font-semibold text-navy">{copy.sidebar.title}</p>
          </div>
        </div>

        <ol className="space-y-0" aria-label={copy.sidebar.title}>
          {stepKeys.map((key, index) => {
            const step = copy.sidebar.steps[key];
            const isActive = index === activeIndex;
            const isDone = index < activeIndex;
            return (
              <li key={key} className="relative flex gap-2 rounded-lg px-1.5 py-1 transition-colors">
                {index < stepKeys.length - 1 && (
                  <span className={`absolute left-4 top-4 h-3 w-px ${isDone ? "bg-bronze/50" : "bg-graphite/10"}`} />
                )}
                <span className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-semibold ${isActive ? "border-navy bg-navy text-ivory" : isDone ? "border-bronze/60 bg-bronze/12 text-bronze" : "border-graphite/15 bg-ivory text-graphite/40"}`}>
                  {isDone ? "✓" : String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className={`block text-[12px] font-semibold leading-4 ${isActive ? "text-navy" : isDone ? "text-graphite/70" : "text-graphite/40"}`}>
                    {step.label}
                  </span>
                  <span className="block text-[10.5px] leading-[0.95rem] text-graphite/45">{step.detail}</span>
                </span>
              </li>
            );
          })}
        </ol>

        <button type="button" onClick={onPreview} className="mt-2.5 flex w-full items-center justify-between rounded-lg border border-graphite/10 bg-white px-2.5 py-2 text-left transition hover:border-bronze/45 hover:bg-bronze/5">
          <span>
            <span className="block text-[10.5px] font-semibold text-navy">{copy.sidebar.previewTitle}</span>
            <span className="mt-0.5 block text-[9.5px] leading-3.5 text-graphite/45">{copy.sidebar.previewHint}</span>
          </span>
          <span className="text-bronze">→</span>
        </button>
      </div>

      <div className="rounded-2xl border border-graphite/10 bg-navy p-3.5 text-ivory shadow-[0_14px_40px_rgba(11,18,32,0.14)]">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-bronze/20 text-bronze">
            <ShieldIcon className="h-3 w-3" />
          </span>
          <div>
            <p className="text-[12px] font-semibold">{copy.sidebar.privacyTitle}</p>
            <p className="mt-1 text-[10.5px] leading-[1.05rem] text-ivory/60">{copy.sidebar.privacyBody}</p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 border-t border-ivory/10 pt-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ivory/45">
          <LockIcon className="h-2.5 w-2.5" />
          <span>{copy.sidebar.localMode}</span>
        </div>
      </div>

      <p className="px-1 text-[9.5px] leading-4 text-graphite/45">{copy.sidebar.emergency}</p>
    </aside>
  );
}
