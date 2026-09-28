import type {
  Attachment,
  BookingRequest,
  ConsultationSuggestion,
  ConversationStage,
  ConversationSummary,
  Locale,
  Message,
  QuickReply,
} from "./types";

export const NAYA_API_VERSION = "v1";

export const NAYA_ENDPOINTS = {
  sessions: `/api/naya/${NAYA_API_VERSION}/sessions`,
  messages: (sessionId: string) => `/api/naya/${NAYA_API_VERSION}/sessions/${sessionId}/messages`,
  summary: (sessionId: string) => `/api/naya/${NAYA_API_VERSION}/sessions/${sessionId}/summary`,
  suggestion: (sessionId: string) => `/api/naya/${NAYA_API_VERSION}/sessions/${sessionId}/suggestion`,
  attachmentUpload: (sessionId: string) => `/api/naya/${NAYA_API_VERSION}/sessions/${sessionId}/attachments`,
  bookingRequests: `/api/naya/${NAYA_API_VERSION}/booking-requests`,
} as const;

export interface CreateSessionRequest {
  locale: Locale;
  channel: "web";
  client: {
    name: string;
    version: string;
  };
}

export interface SessionResponse {
  sessionId: string;
  expiresAt: string;
}

export interface AttachmentReference {
  name: string;
  sizeBytes: number;
  contentType: string;
}

export interface SendMessageRequest {
  clientMessageId: string;
  message: string;
  stage: ConversationStage;
  testStatus: "yes" | "no" | "unsure" | null;
  attachments: AttachmentReference[];
}

export interface SendMessageResponse {
  message: Message;
  nextStage: ConversationStage;
  quickReplies: QuickReply[];
}

export interface SummaryResponse {
  summary: ConversationSummary;
}

export interface SuggestionResponse {
  suggestion: ConsultationSuggestion;
}

export interface PrepareAttachmentUploadRequest {
  fileName: string;
  sizeBytes: number;
  contentType: string;
}

export interface PreparedAttachmentUpload {
  attachment: Attachment;
  uploadUrl: string;
  uploadHeaders: Record<string, string>;
  expiresAt: string;
}

export interface BookingResponse {
  status: "received";
  requestId: string | null;
  reference: string | null;
  simulated: boolean;
  message: string;
}

export interface ApiErrorPayload {
  error: string;
  message: string;
  requestId?: string;
  retryable?: boolean;
}

export interface NayaApi {
  createSession(request: CreateSessionRequest): Promise<SessionResponse>;
  sendMessage(sessionId: string, request: SendMessageRequest): Promise<SendMessageResponse>;
  getSummary(sessionId: string): Promise<SummaryResponse>;
  getSuggestion(sessionId: string): Promise<SuggestionResponse>;
  prepareAttachmentUpload(sessionId: string, request: PrepareAttachmentUploadRequest): Promise<PreparedAttachmentUpload>;
  submitBooking(request: BookingRequest): Promise<BookingResponse>;
}

export class NayaApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly retryable: boolean;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "NayaApiError";
    this.status = status;
    this.code = payload.error;
    this.requestId = payload.requestId;
    this.retryable = payload.retryable ?? false;
  }
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

async function request<T>(fetchImpl: typeof fetch, url: string, init: RequestInit): Promise<T> {
  const response = await fetchImpl(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    let payload: ApiErrorPayload = {
      error: "unknown_error",
      message: `NAYA request failed with status ${response.status}.`,
      retryable: true,
    };
    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = { ...payload, requestId: response.headers.get("x-request-id") ?? undefined };
    }
    throw new NayaApiError(response.status, payload);
  }

  return (await response.json()) as T;
}

export function createNayaApi(baseUrl: string, fetchImpl: typeof fetch = fetch): NayaApi {
  return {
    createSession(payload) {
      return request<SessionResponse>(fetchImpl, joinUrl(baseUrl, NAYA_ENDPOINTS.sessions), {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    sendMessage(sessionId, payload) {
      return request<SendMessageResponse>(fetchImpl, joinUrl(baseUrl, NAYA_ENDPOINTS.messages(sessionId)), {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    getSummary(sessionId) {
      return request<SummaryResponse>(fetchImpl, joinUrl(baseUrl, NAYA_ENDPOINTS.summary(sessionId)), {
        method: "GET",
      });
    },
    getSuggestion(sessionId) {
      return request<SuggestionResponse>(fetchImpl, joinUrl(baseUrl, NAYA_ENDPOINTS.suggestion(sessionId)), {
        method: "GET",
      });
    },
    prepareAttachmentUpload(sessionId, payload) {
      return request<PreparedAttachmentUpload>(fetchImpl, joinUrl(baseUrl, NAYA_ENDPOINTS.attachmentUpload(sessionId)), {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    submitBooking(payload) {
      return request<BookingResponse>(fetchImpl, joinUrl(baseUrl, NAYA_ENDPOINTS.bookingRequests), {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  };
}
