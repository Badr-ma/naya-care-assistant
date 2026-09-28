import { useState, type ChangeEvent, type FormEvent } from "react";
import type { Copy } from "@/lib/i18n/copy";
import type {
  BookingFormSubmission,
  BookingStatus,
  ConsultationSuggestion,
  ConversationSummary,
  PatientContact,
  TestStatus,
} from "@/lib/conversation/types";
import { AlertIcon, ArrowRightIcon, InfoIcon, MailIcon, PhoneIcon, UserIcon } from "./icons";

interface BookingPanelProps {
  copy: Copy;
  summary: ConversationSummary;
  suggestion: ConsultationSuggestion;
  status: BookingStatus;
  error: string | null;
  simulateError: boolean;
  onSimulateErrorChange: (value: boolean) => void;
  onSubmit: (submission: BookingFormSubmission) => void;
  onRetry: () => void;
  onBack: () => void;
}

interface FieldErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  consent?: string;
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

export function BookingPanel({ copy, summary, suggestion, status, error, simulateError, onSimulateErrorChange, onSubmit, onRetry, onBack }: BookingPanelProps) {
  const [contact, setContact] = useState<PatientContact>({ fullName: "", phone: "", email: "" });
  const [draftSummary, setDraftSummary] = useState(summary);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [editing, setEditing] = useState(false);

  function updateContact(field: keyof PatientContact, value: string): void {
    setContact((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateSummary(field: "concern" | "contextAnswer", value: string): void {
    setDraftSummary((current) => ({ ...current, [field]: value }));
  }

  function updateTestStatus(event: ChangeEvent<HTMLSelectElement>): void {
    const value = event.target.value as Exclude<TestStatus, null>;
    setDraftSummary((current) => ({ ...current, testStatus: value }));
  }

  function validate(): FieldErrors {
    const nextErrors: FieldErrors = {};
    if (contact.fullName.trim().length < 2) nextErrors.fullName = copy.booking.invalidName;
    if (!/^[+\d][\d\s().-]{7,}$/.test(contact.phone.trim())) nextErrors.phone = copy.booking.invalidPhone;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) nextErrors.email = copy.booking.invalidEmail;
    if (!consent) nextErrors.consent = copy.booking.consentRequired;
    return nextErrors;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({ contact: { ...contact, fullName: contact.fullName.trim(), phone: contact.phone.trim(), email: contact.email.trim() }, summary: draftSummary, consentAt: new Date().toISOString() });
  }

  function fieldClass(hasError: boolean): string {
    return `mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[13px] text-navy outline-none transition placeholder:text-graphite/30 focus:border-bronze/70 focus:shadow-[0_0_0_3px_rgba(184,138,90,0.12)] ${hasError ? "border-red-400" : "border-graphite/12"}`;
  }

  return (
    <div className="care-scroll flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-4" aria-busy={status === "submitting"} data-booking-status={status}>
      <div className="mx-auto max-w-[720px]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-navy px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ivory">{copy.booking.eyebrow}</span>
          <span className="rounded-full border border-bronze/30 bg-bronze/8 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-bronze">{copy.common.demoBadge}</span>
        </div>
        <h1 className="mt-3 max-w-[34rem] font-heading text-[clamp(1.75rem,3.6vw,2.25rem)] font-bold leading-[1.08] tracking-[-0.04em] text-navy">{copy.booking.title}</h1>
        <p className="mt-2 max-w-[34rem] text-[13px] leading-[1.4] text-graphite/70">{copy.booking.body}</p>

        <div className="mt-4 grid gap-3.5 md:grid-cols-[1.05fr_0.95fr]">
          <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-graphite/10 bg-white p-4 shadow-[0_16px_44px_rgba(43,47,54,0.06)] sm:p-[18px]">
            <h2 className="font-heading text-[15px] font-bold text-navy">{copy.booking.contactTitle}</h2>
            <p className="mt-1 text-[11px] leading-4 text-graphite/55">{copy.booking.shareNote}</p>

            <div className="mt-3 space-y-2.5">
              <div>
                <label htmlFor="booking-name" className="flex items-center gap-1.5 text-[11px] font-semibold text-navy">
                  <UserIcon className="h-3.5 w-3.5 text-bronze" />
                  {copy.booking.name}
                </label>
                <input id="booking-name" name="fullName" value={contact.fullName} onChange={(event) => updateContact("fullName", event.target.value)} placeholder={copy.booking.namePlaceholder} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "booking-name-error" : undefined} className={fieldClass(Boolean(errors.fullName))} autoComplete="name" />
                {errors.fullName && <p id="booking-name-error" className="mt-1 text-[11px] text-red-600">{errors.fullName}</p>}
              </div>
              <div>
                <label htmlFor="booking-phone" className="flex items-center gap-1.5 text-[11px] font-semibold text-navy">
                  <PhoneIcon className="h-3.5 w-3.5 text-bronze" />
                  {copy.booking.phone}
                </label>
                <input id="booking-phone" name="phone" type="tel" value={contact.phone} onChange={(event) => updateContact("phone", event.target.value)} placeholder={copy.booking.phonePlaceholder} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "booking-phone-error" : undefined} className={fieldClass(Boolean(errors.phone))} autoComplete="tel" />
                {errors.phone && <p id="booking-phone-error" className="mt-1 text-[11px] text-red-600">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="booking-email" className="flex items-center gap-1.5 text-[11px] font-semibold text-navy">
                  <MailIcon className="h-3.5 w-3.5 text-bronze" />
                  {copy.booking.email}
                </label>
                <input id="booking-email" name="email" type="email" value={contact.email} onChange={(event) => updateContact("email", event.target.value)} placeholder={copy.booking.emailPlaceholder} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "booking-email-error" : undefined} className={fieldClass(Boolean(errors.email))} autoComplete="email" />
                {errors.email && <p id="booking-email-error" className="mt-1 text-[11px] text-red-600">{errors.email}</p>}
              </div>
            </div>

            <label htmlFor="booking-consent" className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-lg border border-graphite/10 bg-ivory p-2.5">
              <input id="booking-consent" type="checkbox" checked={consent} onChange={(event) => { setConsent(event.target.checked); if (errors.consent) setErrors((current) => ({ ...current, consent: undefined })); }} className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#B88A5A]" aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "booking-consent-error" : undefined} />
              <span className="text-[11px] leading-4 text-graphite/70">{copy.booking.consentLabel}</span>
            </label>
            {errors.consent && <p id="booking-consent-error" className="mt-1 text-[11px] text-red-600">{errors.consent}</p>}

            <label htmlFor="booking-simulate" className="mt-2.5 flex cursor-pointer items-start gap-2.5 border-t border-graphite/8 pt-2.5">
              <input id="booking-simulate" type="checkbox" checked={simulateError} onChange={(event) => onSimulateErrorChange(event.target.checked)} className="mt-0.5 h-3.5 w-3.5 accent-[#B88A5A]" />
              <span>
                <span className="block text-[11px] font-semibold text-navy">{copy.booking.simulatedError}</span>
                <span className="block text-[10px] text-graphite/45">{copy.booking.simulatedErrorHint}</span>
              </span>
            </label>

            {error && (
              <div role="alert" className="mt-3 flex items-start gap-2 rounded-lg border border-red-300/50 bg-red-50 p-2.5 text-[11px] leading-4 text-red-800">
                <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <div>
                  <p className="font-semibold">{copy.error.bookingTitle}</p>
                  <p>{error}</p>
                  <button type="button" onClick={onRetry} className="mt-1.5 font-semibold underline underline-offset-2">{copy.chat.retry}</button>
                </div>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
              <button type="button" onClick={onBack} className="whitespace-nowrap rounded-full border border-graphite/15 px-3 py-1.5 text-[11px] font-semibold text-graphite/70 transition hover:border-graphite/35 hover:text-navy">{copy.suggestion.back}</button>
              <button type="submit" disabled={status === "submitting"} className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full bg-navy px-3.5 py-1.5 text-[13px] font-semibold text-ivory transition hover:bg-bronze hover:text-navy disabled:cursor-not-allowed disabled:opacity-50">
                {status === "submitting" ? copy.booking.submitting : copy.booking.submit}
                {status !== "submitting" && <ArrowRightIcon className="h-3 w-3" />}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] leading-4 text-graphite/40">{copy.booking.demoNote}</p>
          </form>

          <section aria-labelledby="intake-summary-title" className="rounded-2xl border border-bronze/25 bg-bronze/8 p-4 sm:p-[18px]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-bronze">{copy.booking.summaryTitle}</p>
                <h2 id="intake-summary-title" className="mt-0.5 font-heading text-[15px] font-bold text-navy">{suggestion.practice}</h2>
              </div>
              <button type="button" onClick={() => setEditing((value) => !value)} className="rounded-full border border-bronze/35 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-bronze transition hover:bg-bronze hover:text-navy">
                {editing ? copy.booking.doneEditing : copy.booking.edit}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] leading-4 text-graphite/60">{copy.booking.summaryBody}</p>
            <p className="mt-2 border-l-2 border-bronze/40 pl-2.5 text-[11px] leading-4 text-graphite/60">{suggestion.rationale}</p>

            {editing ? (
              <div className="mt-3 space-y-2.5">
                <div>
                  <label htmlFor="summary-concern" className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-graphite/50">{copy.booking.summarySituation}</label>
                  <textarea id="summary-concern" value={draftSummary.concern} onChange={(event) => updateSummary("concern", event.target.value)} rows={3} className="mt-1 w-full resize-y rounded-lg border border-graphite/12 bg-white px-3 py-2 text-[13px] leading-5 text-navy outline-none focus:border-bronze/70" />
                </div>
                <div>
                  <label htmlFor="summary-context" className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-graphite/50">{copy.booking.summarySince}</label>
                  <input id="summary-context" value={draftSummary.contextAnswer} onChange={(event) => updateSummary("contextAnswer", event.target.value)} className="mt-1 w-full rounded-lg border border-graphite/12 bg-white px-3 py-2 text-[13px] text-navy outline-none focus:border-bronze/70" />
                </div>
                <div>
                  <label htmlFor="summary-exams" className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-graphite/50">{copy.booking.summaryExams}</label>
                  <select id="summary-exams" value={draftSummary.testStatus ?? "unsure"} onChange={updateTestStatus} className="mt-1 w-full rounded-lg border border-graphite/12 bg-white px-3 py-2 text-[13px] text-navy outline-none focus:border-bronze/70">
                    <option value="yes">{copy.conversation.testStatus.yes}</option>
                    <option value="no">{copy.conversation.testStatus.no}</option>
                    <option value="unsure">{copy.conversation.testStatus.unsure}</option>
                  </select>
                </div>
                <p className="flex items-center gap-1.5 text-[10px] text-emerald-700"><InfoIcon className="h-3 w-3" />{copy.booking.saved}</p>
              </div>
            ) : (
              <dl className="mt-3 space-y-1.5">
                <div className="rounded-lg bg-white/75 p-2">
                  <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-graphite/45">{copy.booking.summarySituation}</dt>
                  <dd className="mt-0.5 text-[13px] leading-5 text-navy">{draftSummary.concern}</dd>
                </div>
                <div className="rounded-lg bg-white/75 p-2">
                  <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-graphite/45">{copy.booking.summarySince}</dt>
                  <dd className="mt-0.5 text-[13px] leading-5 text-navy">{draftSummary.contextAnswer}</dd>
                </div>
                <div className="rounded-lg bg-white/75 p-2">
                  <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-graphite/45">{copy.booking.summaryExams}</dt>
                  <dd className="mt-0.5 text-[13px] leading-5 text-navy">{testStatusLabel(draftSummary, copy)}</dd>
                </div>
                <div className="rounded-lg bg-white/75 p-2">
                  <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-graphite/45">{copy.booking.summaryDocuments}</dt>
                  <dd className="mt-0.5 text-[13px] leading-5 text-navy">{documentLabel(draftSummary.attachments.length, copy)}</dd>
                </div>
              </dl>
            )}
            <p className="mt-2.5 flex items-start gap-1.5 text-[10px] leading-4 text-graphite/55"><InfoIcon className="mt-0.5 h-3 w-3 shrink-0 text-bronze" />{copy.suggestion.noProfessional}</p>
          </section>
        </div>

        <div className="mt-3.5 flex items-start gap-2 rounded-lg border border-bronze/20 bg-bronze/6 px-3 py-1.5 text-[11px] leading-4 text-graphite/65">
          <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bronze" />
          <p>{copy.booking.urgentNote}</p>
        </div>
      </div>
    </div>
  );
}
