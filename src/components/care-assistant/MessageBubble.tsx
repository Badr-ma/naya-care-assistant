import type { Attachment, Message } from "@/lib/conversation/types";
import { FileIcon, SparkIcon } from "./icons";

function attachmentKindLabel(attachment: Attachment): string {
  if (attachment.kind === "pdf") return "PDF";
  if (attachment.kind === "image") return "IMAGE";
  return "FICHIER";
}

function toneClasses(message: Message): string {
  if (message.role === "user") {
    return "border-navy bg-navy text-ivory";
  }
  if (message.tone === "notice") {
    return "border-bronze/25 bg-bronze/8 text-graphite";
  }
  if (message.tone === "accent") {
    return "border-bronze/25 bg-ivory text-graphite";
  }
  if (message.tone === "muted") {
    return "border-graphite/10 bg-sand/60 text-graphite/75";
  }
  return "border-graphite/10 bg-white text-graphite";
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-bronze shadow-[0_6px_16px_rgba(11,18,32,0.14)]">
          <SparkIcon className="h-4 w-4" />
        </div>
      )}
      <div className={`max-w-[min(88%,38rem)] rounded-2xl border px-4 py-3.5 text-[0.95rem] leading-7 shadow-[0_8px_24px_rgba(43,47,54,0.04)] ${toneClasses(message)} ${isUser ? "rounded-br-md" : "rounded-bl-md"}`}>
        <p>{message.text}</p>
        {message.attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-current/10 pt-3">
            {message.attachments.map((attachment) => (
              <span key={attachment.id} className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-current/8 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] opacity-90">
                <FileIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate normal-case tracking-normal">{attachment.name}</span>
                <span className="opacity-60">{attachmentKindLabel(attachment)}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
