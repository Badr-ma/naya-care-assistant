export type Locale = "fr" | "en";

export type MessageRole = "assistant" | "user";

export type MessageTone = "default" | "muted" | "accent" | "notice" | "urgent";

export type AttachmentKind = "pdf" | "image" | "other";

export type TestStatus = "yes" | "no" | "unsure" | null;

export type ConversationStage =
  | "welcome"
  | "concern"
  | "context"
  | "examinations"
  | "documents"
  | "summary"
  | "suggestion"
  | "booking"
  | "confirmation"
  | "human-review";

export type ConsultationStatus = "suggested" | "human-review";

export type BookingStatus = "idle" | "submitting" | "confirmed" | "error";

export interface Attachment {
  id: string;
  name: string;
  sizeBytes: number;
  kind: AttachmentKind;
  contentType: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  tone: MessageTone;
  attachments: Attachment[];
}

export interface QuickReply {
  id: string;
  label: string;
  value: string;
}

export interface ConversationInput {
  stage: Exclude<ConversationStage, "welcome" | "summary" | "suggestion" | "booking" | "confirmation" | "human-review">;
  locale: Locale;
  text?: string;
  testStatus?: Exclude<TestStatus, null>;
  attachments?: Attachment[];
}

export interface EngineReply {
  message: Message;
  nextStage: ConversationStage;
  quickReplies: QuickReply[];
}

export interface ConversationSnapshot {
  locale: Locale;
  consentAt: string;
  concern: string;
  contextAnswer: string;
  testStatus: TestStatus;
  attachments: Attachment[];
}

export interface ConversationSummary {
  locale: Locale;
  concern: string;
  contextAnswer: string;
  testStatus: TestStatus;
  attachments: Attachment[];
  note: string;
  consentAt: string;
}

export interface ConsultationSuggestion {
  id: string;
  locale: Locale;
  title: string;
  practice: string;
  rationale: string;
  disclaimer: string;
  status: ConsultationStatus;
  humanReviewAvailable: boolean;
  professionalName: null;
  source: "mock" | "ai";
}

export interface PatientContact {
  fullName: string;
  phone: string;
  email: string;
}

export interface ConsentRecord {
  version: string;
  scope: "care-booking";
  givenAt: string;
}

export interface BookingFormSubmission {
  contact: PatientContact;
  summary: ConversationSummary;
  consentAt: string;
}

export interface BookingRequest {
  conversationReference: string;
  locale: Locale;
  contact: PatientContact;
  suggestedConsultationId: string;
  suggestedConsultationTitle: string;
  intakeSummary: ConversationSummary;
  attachmentReferences: Attachment[];
  consent: ConsentRecord;
  simulated: boolean;
}

export interface BookingSubmissionResult {
  status: "received";
  requestId: null;
  reference: null;
  simulated: boolean;
  message: string;
}

export interface BookingSubmissionError {
  code: "temporary_unavailable" | "unknown_error";
  message: string;
  retryable: boolean;
}

export interface BookingService {
  submitBooking(
    request: BookingRequest,
    options?: { simulateError?: boolean },
  ): Promise<BookingSubmissionResult>;
}

export interface HumanReviewState {
  requestedAt: string;
  simulated: boolean;
}

export interface ConversationEngine {
  start(locale: Locale): EngineReply;
  respond(input: ConversationInput): EngineReply;
  summarize(snapshot: ConversationSnapshot): ConversationSummary;
  recommendConsultation(summary: ConversationSummary, locale: Locale): ConsultationSuggestion;
}
