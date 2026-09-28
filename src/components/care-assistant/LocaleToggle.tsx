import type { Copy } from "@/lib/i18n/copy";
import type { Locale } from "@/lib/conversation/types";
import { GlobeIcon } from "./icons";

interface LocaleToggleProps {
  copy: Copy;
  locale: Locale;
  onChange: (locale: Locale) => void;
}

export function LocaleToggle({ copy, locale, onChange }: LocaleToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-graphite/10 bg-ivory p-1" role="group" aria-label={copy.chat.language}>
      <GlobeIcon className="ml-1 h-3.5 w-3.5 text-graphite/40" />
      {(["fr", "en"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={locale === option}
          onClick={() => onChange(option)}
          className={`rounded-full px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition ${locale === option ? "bg-navy text-ivory" : "text-graphite/45 hover:text-navy"}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
