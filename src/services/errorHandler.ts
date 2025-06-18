// src/services/errorHandler.ts

/**
 * Centralized error handler for API and UI errors
 * - Log errors
 * - Show user-friendly messages
 * - Optionally: retry, network detection, etc.
 */

import toast from "react-hot-toast";

function isApiError(
  error: unknown,
): error is { response: { data: { message: string } } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: unknown }).response !== null &&
    "data" in (error as { response: { data?: unknown } }).response &&
    typeof (
      (error as { response: { data?: unknown } }).response as {
        data?: unknown;
      }
    ).data === "object" &&
    (
      (error as { response: { data?: unknown } }).response as {
        data?: unknown;
      }
    ).data !== null &&
    "message" in
      (
        (error as { response: { data?: unknown } }).response as {
          data: { message?: unknown };
        }
      ).data &&
    typeof (
      (
        (error as { response: { data?: unknown } }).response as {
          data: { message?: unknown };
        }
      ).data as { message?: unknown }
    ).message === "string"
  );
}

export const errorHandler = {
  log: (error: unknown, info?: unknown) => {
    // Log to external service if needed
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorHandler]", error, info);
    }
    // Optionally send to monitoring service
  },

  notify: (error: unknown, fallbackMsg = "Đã xảy ra lỗi!") => {
    let message = fallbackMsg;
    if (error instanceof Error) message = error.message;
    if (typeof error === "string") message = error;
    toast.error(message);
  },

  handleApiError: (error: unknown) => {
    // Customize for API error shape
    if (isApiError(error)) {
      toast.error(error.response.data.message);
    } else if (error instanceof Error) {
      toast.error(error.message);
    } else if (typeof error === "string") {
      toast.error(error);
    } else {
      toast.error("Đã xảy ra lỗi khi gọi API!");
    }
    errorHandler.log(error);
  },
};
