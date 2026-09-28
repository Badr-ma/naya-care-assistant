import type { QuickReply } from "@/lib/conversation/types";

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
  disabled?: boolean;
  label?: string;
}

export function QuickReplies({ replies, onSelect, disabled = false, label = "Réponses rapides" }: QuickRepliesProps) {
  if (replies.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-graphite/45">{label}</span>
      <div className="flex flex-wrap gap-2">
        {replies.map((reply) => (
          <button
            key={reply.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(reply)}
            className="rounded-full border border-graphite/12 bg-white px-3.5 py-2 text-left text-[0.8rem] font-medium text-graphite/80 transition hover:-translate-y-0.5 hover:border-bronze/50 hover:text-navy hover:shadow-[0_6px_16px_rgba(43,47,54,0.06)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:border-graphite/12 disabled:hover:shadow-none"
          >
            {reply.label}
          </button>
        ))}
      </div>
    </div>
  );
}
