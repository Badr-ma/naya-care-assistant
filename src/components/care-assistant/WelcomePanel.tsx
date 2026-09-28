import type { ChangeEvent } from "react";
import type { Copy } from "@/lib/i18n/copy";
import { AlertIcon, ArrowRightIcon, ShieldIcon, SparkIcon } from "./icons";

interface WelcomePanelProps {
  copy: Copy;
  consent: boolean;
  simulateError: boolean;
  onConsentChange: (value: boolean) => void;
  onSimulateErrorChange: (value: boolean) => void;
  onStart: () => void;
}

export function WelcomePanel({ copy, consent, simulateError, onConsentChange, onSimulateErrorChange, onStart }: WelcomePanelProps) {
  function handleConsent(event: ChangeEvent<HTMLInputElement>) {
    onConsentChange(event.target.checked);
  }

  function handleSimulateError(event: ChangeEvent<HTMLInputElement>) {
    onSimulateErrorChange(event.target.checked);
  }

  return (
    <section className="care-scroll flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-9" aria-labelledby="welcome-title">
      <div className="mx-auto max-w-[700px]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-navy px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory">
            <SparkIcon className="h-3.5 w-3.5 text-bronze" />
            {copy.welcome.eyebrow}
          </span>
          <span className="rounded-full border border-bronze/30 bg-bronze/8 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-bronze">{copy.brand.demo}</span>
        </div>

        <h1 id="welcome-title" className="mt-5 max-w-[36rem] font-heading text-[clamp(1.75rem,3.6vw,2.25rem)] font-bold leading-[1.08] tracking-[-0.04em] text-navy">
          {copy.welcome.title}
        </h1>
        <p className="mt-3 max-w-[36rem] text-sm leading-6 text-graphite/70 sm:text-[0.95rem] sm:leading-7">{copy.welcome.body}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.25rem] border border-bronze/25 bg-bronze/8 p-4">
            <div className="flex items-start gap-2.5">
              <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
              <div>
                <h2 className="font-heading text-[15px] font-bold text-navy">{copy.welcome.privacyTitle}</h2>
                <p className="mt-1.5 text-[13px] leading-6 text-graphite/70">{copy.welcome.privacyBody}</p>
              </div>
            </div>
            <label htmlFor="welcome-consent" className="mt-3.5 flex cursor-pointer items-start gap-2.5 rounded-xl border border-bronze/20 bg-white/70 p-3">
              <input id="welcome-consent" type="checkbox" checked={consent} onChange={handleConsent} className="mt-0.5 h-4 w-4 accent-[#B88A5A]" />
              <span className="text-xs leading-5 text-graphite/75">{copy.welcome.consentLabel}</span>
            </label>
          </div>

          <div className="rounded-[1.25rem] border border-graphite/10 bg-white p-4 shadow-[0_12px_30px_rgba(43,47,54,0.05)]">
            <div className="flex items-start gap-2.5">
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
              <div>
                <h2 className="font-heading text-[15px] font-bold text-navy">{copy.welcome.urgentTitle}</h2>
                <p className="mt-1.5 text-[13px] leading-6 text-graphite/65">{copy.welcome.urgentBody}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[1.25rem] border border-dashed border-graphite/15 bg-ivory p-3.5 sm:p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-graphite/45">{copy.welcome.demoTools}</p>
          <label htmlFor="welcome-simulate" className="mt-2.5 flex cursor-pointer items-start gap-2.5">
            <input id="welcome-simulate" type="checkbox" checked={simulateError} onChange={handleSimulateError} className="mt-0.5 h-4 w-4 accent-[#B88A5A]" />
            <span>
              <span className="block text-[13px] font-semibold text-navy">{copy.welcome.simulateError}</span>
              <span className="mt-0.5 block text-xs leading-5 text-graphite/55">{copy.welcome.simulateHint}</span>
            </span>
          </label>
        </div>

        <button type="button" onClick={onStart} disabled={!consent} className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-[13px] font-semibold text-ivory transition hover:bg-bronze hover:text-navy disabled:cursor-not-allowed disabled:bg-graphite/10 disabled:text-graphite/35" data-testid="welcome-start">
          {copy.welcome.cta}
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}
