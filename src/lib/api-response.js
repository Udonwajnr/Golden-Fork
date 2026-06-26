import { NextResponse } from "next/server";

export function ok(data, init) {
  return NextResponse.json({ success: true, ...data }, init);
}

export function fail(message, status = 400, extra = {}) {
  return NextResponse.json(
    { success: false, error: message, ...extra },
    { status }
  );
}

/**
 * Wraps a route handler, catching thrown errors (including the
 * status-carrying errors from requireRole) and turning them into
 * consistent JSON error responses.
 */
export function withErrorHandling(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error("[api error]", err);
      const status = err?.status || 500;
      const message =
        err?.status ? err.message : "Something went wrong. Please try again.";
      return fail(message, status);
    }
  };
}
