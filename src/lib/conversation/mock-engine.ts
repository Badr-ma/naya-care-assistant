import { copyByLocale } from "@/lib/i18n/copy";
import type {
  Attachment,
  ConsultationSuggestion,
  ConversationEngine,
  ConversationInput,
  ConversationSnapshot,
  ConversationSummary,
  EngineReply,
  Message,
  QuickReply,
  TestStatus,
} from "./types";

function assistantMessage(id: string, text: string, tone: Message["tone"] = "default"): Message {
  return { id, role: "assistant", text, tone, attachments: [] };
}

function quickReply(id: string, label: string, value: string): QuickReply {
  return { id, label, value };
}

function describeAttachment(attachment: Attachment, locale: "fr" | "en"): string {
  const sizeInKb = Math.max(1, Math.round(attachment.sizeBytes / 1024));
  return `${attachment.name} (${sizeInKb} ${locale === "fr" ? "Ko" : "KB"})`;
}

function testStatusLabel(status: TestStatus, locale: "fr" | "en"): string {
  const labels = copyByLocale[locale].conversation.testStatus;
  switch (status) {
    case "yes":
      return labels.yes;
    case "no":
      return labels.no;
    case "unsure":
      return labels.unsure;
    default:
      return labels.none;
  }
}

const concernReplies = (locale: "fr" | "en"): QuickReply[] =>
  copyByLocale[locale].conversation.concernReplies.map((label, index) =>
    quickReply(`concern-${index}`, label, label),
  );

const contextReplies = (locale: "fr" | "en"): QuickReply[] =>
  copyByLocale[locale].conversation.contextReplies.map((label, index) =>
    quickReply(`context-${index}`, label, label),
  );

const examinationReplies = (locale: "fr" | "en"): QuickReply[] =>
  copyByLocale[locale].conversation.examinationReplies.map((label, index) =>
    quickReply(`examination-${index}`, label, index === 0 ? "yes" : index === 1 ? "no" : "unsure"),
  );

const skipReply = (locale: "fr" | "en"): QuickReply[] => [
  quickReply("documents-skip", copyByLocale[locale].conversation.skipReply, "skip"),
];

export class MockConversationEngine implements ConversationEngine {
  start(locale: "fr" | "en"): EngineReply {
    return {
      message: assistantMessage("welcome", copyByLocale[locale].conversation.welcomeMessage),
      nextStage: "concern",
      quickReplies: concernReplies(locale),
    };
  }

  respond(input: ConversationInput): EngineReply {
    const copy = copyByLocale[input.locale];
    switch (input.stage) {
      case "concern":
        return {
          message: assistantMessage("context-prompt", copy.conversation.contextPrompt, "accent"),
          nextStage: "context",
          quickReplies: contextReplies(input.locale),
        };
      case "context":
        return {
          message: assistantMessage("examinations-prompt", copy.conversation.examinationsPrompt),
          nextStage: "examinations",
          quickReplies: examinationReplies(input.locale),
        };
      case "examinations": {
        const label = testStatusLabel(input.testStatus ?? null, input.locale);
        return {
          message: assistantMessage(
            "documents-prompt",
            `${label}. ${copy.conversation.documentsPrompt}`,
          ),
          nextStage: "documents",
          quickReplies: skipReply(input.locale),
        };
      }
      case "documents": {
        const attachments = input.attachments ?? [];
        const documentLine =
          attachments.length > 0
            ? `${attachments.map((attachment) => describeAttachment(attachment, input.locale)).join(", ")}.`
            : copy.conversation.skipMessage;
        return {
          message: assistantMessage(
            "summary-prompt",
            `${documentLine} ${copy.conversation.summaryPrompt}`,
            "accent",
          ),
          nextStage: "summary",
          quickReplies: [],
        };
      }
      default:
        return {
          message: assistantMessage("stay-ready", copy.conversation.stayReady, "notice"),
          nextStage: "summary",
          quickReplies: [],
        };
    }
  }

  summarize(snapshot: ConversationSnapshot): ConversationSummary {
    const copy = copyByLocale[snapshot.locale];
    return {
      locale: snapshot.locale,
      concern: snapshot.concern.trim() || copy.summary.notProvided,
      contextAnswer: snapshot.contextAnswer.trim() || copy.summary.notProvided,
      testStatus: snapshot.testStatus,
      attachments: [...snapshot.attachments],
      note: copy.summary.note,
      consentAt: snapshot.consentAt,
    };
  }

  recommendConsultation(summary: ConversationSummary, locale: "fr" | "en"): ConsultationSuggestion {
    const copy = copyByLocale[locale];
    return {
      id: "mock-follow-up-consultation",
      locale,
      title: copy.suggestion.title,
      practice: copy.suggestion.practice,
      rationale: copy.suggestion.why,
      disclaimer: copy.suggestion.careNote,
      status: "suggested",
      humanReviewAvailable: true,
      professionalName: null,
      source: "mock",
    };
  }
}

export const mockConversationEngine: ConversationEngine = new MockConversationEngine();
