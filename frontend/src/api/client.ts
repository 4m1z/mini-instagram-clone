import type { ApiErrorDTO } from "./dto";

/**
 * The API is reached through the same origin by default: in development Vite
 * proxies /api and /files to the backend, in production nginx does. Setting
 * VITE_API_BASE_URL allows pointing the app at a backend on another origin.
 */
const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

/**
 * WebSocket origin. Same origin by default (nginx proxies /api/ws in
 * production). In development it points straight at the backend, because
 * Vite's WebSocket proxy is not usable when Vite runs on Bun.
 */
const wsBaseUrl = (import.meta.env.VITE_WS_BASE_URL ?? "").replace(/\/$/, "");

/** Error thrown for every non-2xx response, already mapped for the UI. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: Record<string, string>;

  constructor(status: number, code: string, message: string, fields: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export function apiUrl(path: string): string {
  return `${baseUrl}${path}`;
}

export function websocketUrl(path: string): string {
  if (wsBaseUrl) {
    return new URL(path, wsBaseUrl).toString();
  }
  const url = new URL(apiUrl(path), window.location.href);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(apiUrl(path), init);
  } catch {
    throw new ApiError(0, "network_error", "Could not reach the server. Check your connection.");
  }

  if (!response.ok) {
    throw await toApiError(response);
  }
  return (await response.json()) as T;
}

async function toApiError(response: Response): Promise<ApiError> {
  const fallback = `Request failed with status ${response.status}.`;
  try {
    const body = (await response.json()) as Partial<ApiErrorDTO>;
    const error = body.error;
    if (error?.message) {
      return new ApiError(response.status, error.code ?? "error", error.message, error.fields ?? {});
    }
  } catch {
    // Ignore non-JSON error bodies and fall through.
  }
  return new ApiError(response.status, "error", fallback);
}
