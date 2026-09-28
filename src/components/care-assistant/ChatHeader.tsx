import type { Copy } from "@/lib/i18n/copy";
import type { ConversationStage } from "@/lib/conversation/types";
import { ChatIcon, RotateIcon } from "./icons";

interface ChatHeaderProps {
  stage: ConversationStage;
  copy: Copy;
  onReset: () => void;
}

export function ChatHeader({ stage, copy, onReset }: ChatHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-graphite/8 bg-ivory/80 px-4 py-4 sm:px-7">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy text-bronze shadow-[0_8px_18px_rgba(11,18,32,0.12)]">
          <ChatIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate font-heading text-sm font-bold text-navy sm:text-base">{copy.chat.assistantName}</h1>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-bronze">{copy.chat.stageLabels[stage]}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-1.5 rounded-full border border-graphite/10 bg-white px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-graphite/50 xl:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {copy.brand.demo}
        </span>
        <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-graphite/50 transition hover:bg-sand hover:text-navy">
          <RotateIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{copy.chat.reset}</span>
        </button>
      </div>
    </header>
  );
}
