import { copyByLocale } from "@/lib/i18n/copy";
import type {
  BookingRequest,
  BookingService,
  BookingSubmissionError,
  BookingSubmissionResult,
} from "@/lib/conversation/types";

export class MockBookingError extends Error implements BookingSubmissionError {
  readonly code: BookingSubmissionError["code"];
  readonly retryable: boolean;

  constructor(code: BookingSubmissionError["code"], message: string) {
    super(message);
    this.name = "MockBookingError";
    this.code = code;
    this.retryable = true;
  }
}

export class MockBookingService implements BookingService {
  async submitBooking(
    request: BookingRequest,
    options: { simulateError?: boolean } = {},
  ): Promise<BookingSubmissionResult> {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 650));
    if (options.simulateError) {
      throw new MockBookingError(
        "temporary_unavailable",
        copyByLocale[request.locale].error.bookingBody,
      );
    }
    return {
      status: "received",
      requestId: null,
      reference: null,
      simulated: true,
      message: copyByLocale[request.locale].confirmation.body,
    };
  }
}

export const mockBookingService: BookingService = new MockBookingService();
