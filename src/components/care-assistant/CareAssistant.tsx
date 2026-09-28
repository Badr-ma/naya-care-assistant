"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { mockBookingService } from "@/lib/booking/mock-booking-service";
import { copyByLocale, type Copy } from "@/lib/i18n/copy";
import { mockConversationEngine } from "@/lib/conversation/mock-engine";
import type {
  Attachment,
  BookingFormSubmission,
  BookingRequest,
  BookingService,
  BookingStatus,
  BookingSubmissionResult,
  ConsultationSuggestion,
  ConversationEngine,
  ConversationStage,
  ConversationSummary,
  EngineReply,
  HumanReviewState,
  Locale,
  Message,
  PatientContact,
  QuickReply,
  TestStatus,
} from "@/lib/conversation/types";
import { BookingPanel } from "./BookingPanel";
import { ChatHeader } from "./ChatHeader";
import { ConfirmationPanel } from "./ConfirmationPanel";
import { ConversationSidebar } from "./ConversationSidebar";
import { HumanReviewPanel } from "./HumanReviewPanel";
import { LocaleToggle } from "./LocaleToggle";
import { MessageBubble } from "./MessageBubble";
import { ConsultationSuggestionPanel } from "./PathwayPanel";
import { QuickReplies } from "./QuickReplies";
import { SummaryPanel } from "./SummaryPanel";
import { WelcomePanel } from "./WelcomePanel";
import { ArrowUpIcon, PaperclipIcon, SparkIcon, XIcon } from "./icons";

interface CareAssistantProps {
  engine?: ConversationEngine;
  bookingService?: BookingService;
}

const emptyContact: PatientContact = { fullName: "", phone: "", email: "" };

const progressByStage: Record<ConversationStage, number> = {
  welcome: 8,
  concern: 24,
  context: 38,
  examinations: 54,
  documents: 66,
  summary: 76,
  suggestion: 84,
  "human-review": 84,
  booking: 94,
  confirmation: 100,
};

function attachmentKind(contentType: string): Attachment["kind"] {
  if (contentType === "application/pdf") return "pdf";
  if (contentType.startsWith("image/")) return "image";
  return "other";
}

function stagePlaceholder(stage: ConversationStage, copy: Copy): string {
  switch (stage) {
    case "context":
      return copy.chat.placeholderContext;
    case "examinations":
      return copy.chat.placeholderExaminations;
    case "documents":
      return copy.chat.placeholderDocuments;
    case "concern":
    default:
      return copy.chat.placeholderConcern;
  }
}

function demoSummary(engine: ConversationEngine, copy: Copy, locale: Locale): ConversationSummary {
  return engine.summarize({
    locale,
    consentAt: "demo-consent",
    concern: copy.conversation.concernReplies[0],
    contextAnswer: copy.conversation.contextReplies[1],
    testStatus: "unsure",
    attachments: [],
  });
}

export function CareAssistant({ engine = mockConversationEngine, bookingService = mockBookingService }: CareAssistantProps) {
  const [locale, setLocale] = useState<Locale>("fr");
  const copy = copyByLocale[locale];
  const [stage, setStage] = useState<ConversationStage>("welcome");
  const [consent, setConsent] = useState(false);
  const [consentAt, setConsentAt] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [draft, setDraft] = useState("");
  const [concern, setConcern] = useState("");
  const [contextAnswer, setContextAnswer] = useState("");
  const [testStatus, setTestStatus] = useState<TestStatus>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [summary, setSummary] = useState<ConversationSummary | null>(null);
  const [suggestion, setSuggestion] = useState<ConsultationSuggestion | null>(null);
  const [humanReview, setHumanReview] = useState<HumanReviewState | null>(null);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>("idle");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingSubmissionResult | null>(null);
  const [contact, setContact] = useState<PatientContact>(emptyContact);
  const [simulateChatError, setSimulateChatError] = useState(false);
  const [simulateBookingError, setSimulateBookingError] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const idCounter = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const autoScrollRef = useRef(false);
  const autoTopRef = useRef(0);
  const mountedRef = useRef(true);
  const retryRef = useRef<(() => void) | null>(null);
  const bookingPayloadRef = useRef<BookingRequest | null>(null);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node || !nearBottomRef.current) return;
    if (node.scrollHeight - node.scrollTop - node.clientHeight <= 2) return;
    autoScrollRef.current = true;
    autoTopRef.current = node.scrollTop;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking, stage]);

  function nextId(prefix: string): string {
    idCounter.current += 1;
    return `${prefix}-${idCounter.current}`;
  }

  function addUserMessage(text: string, messageAttachments: Attachment[] = []): void {
    setMessages((current) => [...current, { id: nextId("user"), role: "user", text, tone: "default", attachments: messageAttachments }]);
  }

  function addAssistantMessage(text: string, tone: Message["tone"] = "accent"): void {
    setMessages((current) => [...current, { id: nextId("assistant"), role: "assistant", text, tone, attachments: [] }]);
  }

  function resetSession(): void {
    idCounter.current = 0;
    setStage("welcome");
    setConsent(false);
    setConsentAt(null);
    setMessages([]);
    setQuickReplies([]);
    setDraft("");
    setConcern("");
    setContextAnswer("");
    setTestStatus(null);
    setAttachments([]);
    setSummary(null);
    setSuggestion(null);
    setHumanReview(null);
    setBookingStatus("idle");
    setBookingError(null);
    setBookingResult(null);
    setContact(emptyContact);
    setSimulateBookingError(false);
    setChatError(null);
    setIsThinking(false);
    setShowJumpToLatest(false);
    retryRef.current = null;
    bookingPayloadRef.current = null;
  }

  function handleLocaleChange(nextLocale: Locale): void {
    if (nextLocale === locale) return;
    setLocale(nextLocale);
    resetSession();
  }

  function handleStart(): void {
    if (!consent) return;
    const timestamp = new Date().toISOString();
    const opening = engine.start(locale);
    setConsentAt(timestamp);
    setMessages([{ ...opening.message, id: nextId("assistant") }]);
    setQuickReplies(opening.quickReplies);
    setStage(opening.nextStage);
    setChatError(null);
  }

  async function respondWith(factory: () => EngineReply, forceSuccess = false): Promise<void> {
    setIsThinking(true);
    setChatError(null);
    await new Promise<void>((resolve) => window.setTimeout(resolve, 420));
    if (!mountedRef.current) return;
    if (simulateChatError && !forceSuccess) {
      setIsThinking(false);
      setChatError(copy.chat.errorBody);
      retryRef.current = () => {
        setSimulateChatError(false);
        void respondWith(factory, true);
      };
      return;
    }
    const reply = factory();
    setMessages((current) => [...current, { ...reply.message, id: nextId("assistant") }]);
    setStage(reply.nextStage);
    setQuickReplies(reply.quickReplies);
    setIsThinking(false);
    retryRef.current = null;
  }

  async function submitText(value: string): Promise<void> {
    const text = value.trim();
    if (!text || isThinking) return;
    const currentStage = stage as "concern" | "context" | "examinations" | "documents";
    addUserMessage(text);
    setDraft("");
    if (currentStage === "concern") setConcern(text);
    if (currentStage === "context") setContextAnswer(text);
    await respondWith(() => engine.respond({ stage: currentStage, locale, text, testStatus: testStatus ?? undefined, attachments }));
  }

  async function handleSend(): Promise<void> {
    await submitText(draft);
  }

  async function handleQuickReply(reply: QuickReply): Promise<void> {
    if (isThinking) return;
    if (stage === "examinations" && (reply.value === "yes" || reply.value === "no" || reply.value === "unsure")) {
      const nextStatus = reply.value as Exclude<TestStatus, null>;
      setTestStatus(nextStatus);
      addUserMessage(copy.conversation.testStatus[nextStatus]);
      await respondWith(() => engine.respond({ stage: "examinations", locale, testStatus: nextStatus, attachments }));
      return;
    }
    if (stage === "documents" && reply.value === "skip") {
      addUserMessage(copy.conversation.skipMessage);
      await respondWith(() => engine.respond({ stage: "documents", locale, attachments }));
      return;
    }
    await submitText(reply.value);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const input = event.currentTarget;
    const remaining = Math.max(0, 3 - attachments.length);
    const selected = Array.from(input.files ?? []).slice(0, remaining);
    if (selected.length === 0) return;
    const nextAttachments = selected.map((file) => ({
      id: nextId("attachment"),
      name: file.name,
      sizeBytes: file.size,
      kind: attachmentKind(file.type),
      contentType: file.type || "application/octet-stream",
    }));
    setAttachments((current) => [...current, ...nextAttachments]);
    addUserMessage(nextAttachments.length === 1 ? copy.conversation.attachmentAdded : copy.conversation.attachmentsAdded.replace("{count}", String(nextAttachments.length)), nextAttachments);
    input.value = "";
  }

  function handleRemoveAttachment(id: string): void {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
  }

  async function handleContinueWithoutDocuments(): Promise<void> {
    if (isThinking) return;
    addUserMessage(copy.conversation.continueMessage);
    await respondWith(() => engine.respond({ stage: "documents", locale, attachments }));
  }

  function buildSummary(): ConversationSummary {
    return engine.summarize({ locale, consentAt: consentAt ?? "demo-consent", concern, contextAnswer, testStatus, attachments });
  }

  function handleShowSuggestion(): void {
    const nextSummary = summary ?? buildSummary();
    setSummary(nextSummary);
    setSuggestion(engine.recommendConsultation(nextSummary, locale));
    setStage("suggestion");
    setQuickReplies([]);
    setBookingStatus("idle");
    setBookingError(null);
  }

  function handlePreview(): void {
    const nextSummary = demoSummary(engine, copy, locale);
    setSummary(nextSummary);
    setSuggestion(engine.recommendConsultation(nextSummary, locale));
    setStage("suggestion");
    setQuickReplies([]);
  }

  function handleEditSummary(): void {
    setSummary(null);
    setSuggestion(null);
    setStage("concern");
    setContextAnswer("");
    setTestStatus(null);
    setAttachments([]);
    setDraft(concern);
    setQuickReplies(engine.start(locale).quickReplies);
    addAssistantMessage(copy.conversation.editMessage);
  }

  function handleRequestHumanReview(): void {
    setHumanReview({ requestedAt: new Date().toISOString(), simulated: true });
    setStage("human-review");
  }

  function handleBackToSuggestion(): void {
    setStage("suggestion");
  }

  function handleContinueToBooking(): void {
    setBookingStatus("idle");
    setBookingError(null);
    setStage("booking");
  }

  function handleBackToSummary(): void {
    setStage("summary");
    setQuickReplies([]);
  }

  async function submitBookingRequest(payload: BookingRequest, shouldSimulate: boolean): Promise<void> {
    setBookingStatus("submitting");
    setBookingError(null);
    try {
      const result = await bookingService.submitBooking(payload, { simulateError: shouldSimulate });
      if (!mountedRef.current) return;
      setBookingResult(result);
      setBookingStatus("confirmed");
      setStage("confirmation");
    } catch (error) {
      if (!mountedRef.current) return;
      setBookingStatus("error");
      setBookingError(error instanceof Error ? error.message : copy.error.bookingBody);
    }
  }

  function handleSubmitBooking(submission: BookingFormSubmission): void {
    const normalizedSummary: ConversationSummary = { ...submission.summary, locale, consentAt: submission.consentAt, note: copy.summary.note };
    const nextSuggestion = suggestion ?? engine.recommendConsultation(normalizedSummary, locale);
    const payload: BookingRequest = {
      conversationReference: "demo-local-session",
      locale,
      contact: submission.contact,
      suggestedConsultationId: nextSuggestion.id,
      suggestedConsultationTitle: nextSuggestion.practice,
      intakeSummary: normalizedSummary,
      attachmentReferences: normalizedSummary.attachments,
      consent: { version: "naya-privacy-v1", scope: "care-booking", givenAt: submission.consentAt },
      simulated: true,
    };
    setSummary(normalizedSummary);
    setSuggestion(nextSuggestion);
    setContact(submission.contact);
    bookingPayloadRef.current = payload;
    void submitBookingRequest(payload, simulateBookingError);
  }

  function handleRetryBooking(): void {
    const payload = bookingPayloadRef.current;
    if (!payload) return;
    void submitBookingRequest(payload, false);
  }

  function handleScroll(): void {
    const node = scrollRef.current;
    if (!node) return;
    const top = node.scrollTop;
    // Swallow the downward tail of our own smooth scroll, but never a real upward scroll.
    if (autoScrollRef.current && top >= autoTopRef.current) {
      autoTopRef.current = top;
      return;
    }
    autoScrollRef.current = false;
    autoTopRef.current = top;
    const nearBottom = node.scrollHeight - top - node.clientHeight < 90;
    nearBottomRef.current = nearBottom;
    setShowJumpToLatest(!nearBottom);
  }

  function jumpToLatest(): void {
    const node = scrollRef.current;
    if (!node) return;
    nearBottomRef.current = true;
    setShowJumpToLatest(false);
    autoScrollRef.current = true;
    autoTopRef.current = node.scrollTop;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
    // Hiding the control re-renders the footer; re-assert the target once it has committed.
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  const currentSummary = summary ?? buildSummary();
  const progress = progressByStage[stage];
  const showComposer = stage !== "welcome" && stage !== "summary" && stage !== "suggestion" && stage !== "booking" && stage !== "confirmation" && stage !== "human-review";

  return (
    <main className="min-h-screen bg-sand text-graphite lg:h-[100svh] lg:overflow-hidden" data-stage={stage} data-locale={locale}>
      <div className="mx-auto flex min-h-screen w-full max-w-[1100px] flex-col px-4 py-4 sm:px-6 lg:h-[100svh] lg:min-h-0 lg:overflow-hidden lg:px-8 lg:py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1 lg:mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-bronze/35 bg-ivory font-heading text-xl font-extrabold text-navy shadow-[0_8px_22px_rgba(43,47,54,0.06)]">N</div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-bronze">{copy.brand.kicker}</p>
              <p className="mt-0.5 font-heading text-lg font-bold tracking-[-0.03em] text-navy sm:text-xl">{copy.brand.name} <span className="font-normal text-graphite/45">/ {copy.brand.descriptor}</span></p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LocaleToggle copy={copy} locale={locale} onChange={handleLocaleChange} />
            <span className="hidden items-center gap-2 rounded-full border border-graphite/10 bg-ivory px-3 py-2 font-mono text-[9px] uppercase tracking-[0.15em] text-graphite/55 sm:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{copy.brand.demo}</span>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-graphite/10 bg-ivory px-4 py-3 lg:hidden">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bronze">{copy.brand.name}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-graphite/10"><div className="h-full rounded-full bg-bronze transition-all" style={{ width: `${progress}%` }} /></div>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-graphite/45">{copy.chat.stageLabels[stage]}</span>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
          <div className="hidden min-h-0 lg:block">
            <ConversationSidebar stage={stage} copy={copy} onPreview={handlePreview} />
          </div>

          <section className="flex min-h-[calc(100svh-12rem)] min-w-0 flex-col overflow-hidden rounded-[1.75rem] border border-graphite/10 bg-ivory shadow-[0_20px_60px_rgba(43,47,54,0.08)] lg:min-h-0">
            {stage === "welcome" ? (
              <WelcomePanel copy={copy} consent={consent} simulateError={simulateChatError} onConsentChange={setConsent} onSimulateErrorChange={setSimulateChatError} onStart={handleStart} />
            ) : stage === "confirmation" && bookingResult && suggestion ? (
              <ConfirmationPanel copy={copy} result={bookingResult} contact={contact} suggestion={suggestion} onRestart={resetSession} />
            ) : stage === "human-review" && humanReview ? (
              <HumanReviewPanel copy={copy} state={humanReview} onContinue={handleContinueToBooking} onBack={handleBackToSuggestion} onRestart={resetSession} />
            ) : stage === "suggestion" && suggestion ? (
              <ConsultationSuggestionPanel suggestion={suggestion} summary={currentSummary} copy={copy} onBack={handleBackToSummary} onHumanReview={handleRequestHumanReview} onBooking={handleContinueToBooking} onRestart={resetSession} />
            ) : stage === "booking" && summary && suggestion ? (
              <BookingPanel copy={copy} summary={summary} suggestion={suggestion} status={bookingStatus} error={bookingError} simulateError={simulateBookingError} onSimulateErrorChange={setSimulateBookingError} onSubmit={handleSubmitBooking} onRetry={handleRetryBooking} onBack={handleBackToSuggestion} />
            ) : (
              <>
                <ChatHeader stage={stage} copy={copy} onReset={resetSession} />
                <div ref={scrollRef} onScroll={handleScroll} role="log" aria-live="polite" aria-relevant="additions text" className="care-scroll min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
                  <div className="mx-auto flex max-w-[700px] flex-col gap-5">
                    {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
                    {chatError && (
                      <div role="alert" className="mx-auto flex w-full max-w-xl items-start gap-3 rounded-2xl border border-red-300/50 bg-red-50 p-4 text-sm text-red-800">
                        <span className="flex-1"><strong className="block">{copy.chat.errorTitle}</strong><span>{chatError}</span></span>
                        <button type="button" onClick={() => retryRef.current?.()} className="shrink-0 rounded-full border border-red-300 px-3 py-1.5 text-xs font-semibold">{copy.chat.retry}</button>
                      </div>
                    )}
                    {isThinking && (
                      <div className="flex items-center gap-3 text-graphite/50" aria-live="polite">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-bronze"><SparkIcon className="h-4 w-4 animate-pulse" /></span>
                        <span className="flex items-center gap-1.5 text-sm"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-bronze [animation-delay:-0.2s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-bronze [animation-delay:-0.1s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-bronze" /></span>
                        <span className="text-xs text-graphite/45">{copy.chat.loading}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative border-t border-graphite/8 bg-ivory/95 px-4 py-4 sm:px-8 sm:py-5">
                  {showJumpToLatest && (
                    <button type="button" onClick={jumpToLatest} className="absolute -top-11 left-1/2 z-10 -translate-x-1/2 rounded-full border border-bronze/30 bg-white px-3 py-1.5 text-[11px] font-semibold text-bronze shadow-lg">↓ {copy.chat.jumpToLatest}</button>
                  )}
                  <div className="mx-auto max-w-[700px]">
                    {stage === "summary" ? (
                      <SummaryPanel summary={currentSummary} copy={copy} onEdit={handleEditSummary} onContinue={handleShowSuggestion} />
                    ) : showComposer ? (
                      <div className="space-y-3">
                        {quickReplies.length > 0 && <QuickReplies replies={quickReplies} onSelect={(reply) => void handleQuickReply(reply)} disabled={isThinking} label={copy.chat.quickReplies} />}
                        {stage === "documents" && (
                          <div className="rounded-2xl border border-dashed border-bronze/35 bg-bronze/5 p-3.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div><p className="text-sm font-semibold text-navy">{copy.chat.attachTitle}</p><p className="mt-0.5 text-xs leading-5 text-graphite/55">{copy.chat.attachHint}</p></div>
                              <label htmlFor="care-assistant-file" className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-bronze/40 bg-white px-3.5 py-2 text-xs font-semibold text-bronze transition hover:bg-bronze hover:text-navy"><PaperclipIcon className="h-3.5 w-3.5" />{copy.chat.attach}</label>
                              <input id="care-assistant-file" type="file" accept="application/pdf,image/*" className="sr-only" onChange={handleFileChange} />
                            </div>
                            {attachments.length > 0 && (
                              <ul className="mt-3 flex flex-col gap-2">
                                {attachments.map((attachment) => (
                                  <li key={attachment.id} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-xs text-graphite/70"><span className="truncate">{attachment.name}</span><button type="button" onClick={() => handleRemoveAttachment(attachment.id)} className="shrink-0 rounded p-1 text-graphite/40 transition hover:bg-sand hover:text-navy" aria-label={`${copy.chat.removeFile}: ${attachment.name}`}><XIcon className="h-3.5 w-3.5" /></button></li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                        <div className="relative rounded-2xl border border-graphite/12 bg-white p-2 shadow-[0_8px_26px_rgba(43,47,54,0.05)] transition focus-within:border-bronze/60 focus-within:shadow-[0_10px_30px_rgba(184,138,90,0.12)]">
                          <label htmlFor="care-assistant-message" className="sr-only">{copy.chat.send}</label>
                          <textarea id="care-assistant-message" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); void handleSend(); } }} rows={3} maxLength={1200} placeholder={stagePlaceholder(stage, copy)} className="w-full resize-none bg-transparent px-3 py-2 text-[0.95rem] leading-6 text-navy outline-none placeholder:text-graphite/35" />
                          <div className="flex items-center justify-between gap-3 px-1 pb-0.5"><span className="text-[10px] leading-4 text-graphite/40">{copy.chat.privacyNote} · {copy.chat.keyboardNote}</span><button type="button" onClick={() => void handleSend()} disabled={!draft.trim() || isThinking} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy text-ivory transition hover:bg-bronze hover:text-navy disabled:cursor-not-allowed disabled:bg-graphite/10 disabled:text-graphite/30" aria-label={copy.chat.send}><ArrowUpIcon className="h-4 w-4" /></button></div>
                        </div>
                        {stage === "documents" && <button type="button" onClick={() => void handleContinueWithoutDocuments()} disabled={isThinking} className="mx-auto block text-xs font-semibold text-bronze underline decoration-bronze/30 underline-offset-4 transition hover:text-navy disabled:opacity-40">{copy.chat.continueWithoutDocument}</button>}
                        <p className="text-center text-[10px] leading-4 text-graphite/40">{copy.chat.urgentNote}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
