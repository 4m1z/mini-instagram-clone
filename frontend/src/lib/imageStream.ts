import { websocketUrl } from "../api/client";
import type { ImageCreatedEventDTO } from "../api/dto";
import type { FeedImage } from "../types/image";
import { toFeedImage } from "../api/mappers";

export type StreamStatus = "connecting" | "live" | "offline";

type ImageListener = (image: FeedImage) => void;

const RECONNECT_BASE_MS = 500;
const RECONNECT_MAX_MS = 10_000;

let socket: WebSocket | null = null;
let attempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let status: StreamStatus = "offline";

const statusListeners = new Set<() => void>();
const imageListeners = new Set<ImageListener>();
const reconnectListeners = new Set<() => void>();

/**
 * A single application wide WebSocket connection. It is opened while at least
 * one subscriber is interested and reconnects with backoff. Kept outside React
 * so that connection handling does not cause renders on its own.
 */
export function subscribeToImages(listener: ImageListener): () => void {
  imageListeners.add(listener);
  requestConnection();
  return () => {
    imageListeners.delete(listener);
    if (imageListeners.size === 0) {
      disconnect();
    }
  };
}

function requestConnection(): void {
  queueMicrotask(() => {
    if (imageListeners.size > 0) connect();
  });
}

export function subscribeToStatus(listener: () => void): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

/** Notifies server-state owners that events may have been missed while offline. */
export function subscribeToReconnect(listener: () => void): () => void {
  reconnectListeners.add(listener);
  return () => reconnectListeners.delete(listener);
}

export function getStatus(): StreamStatus {
  return status;
}

function setStatus(next: StreamStatus): void {
  if (status === next) return;
  status = next;
  for (const listener of statusListeners) listener();
}

function connect(): void {
  if (socket || reconnectTimer) return;
  setStatus("connecting");

  const ws = new WebSocket(websocketUrl("/api/ws"));
  socket = ws;

  ws.onopen = () => {
    const reconnected = attempt > 0;
    attempt = 0;
    setStatus("live");
    if (reconnected) {
      for (const listener of reconnectListeners) listener();
    }
  };
  ws.onmessage = (event) => handleMessage(event.data);
  ws.onclose = () => {
    // Ignore cleanup from a stale socket replaced during Strict Mode's
    // development-only effect setup/cleanup cycle.
    if (socket !== ws) return;
    socket = null;
    setStatus("offline");
    if (imageListeners.size > 0) scheduleReconnect();
  };
  ws.onerror = () => ws.close();
}

function disconnect(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  const ws = socket;
  socket = null;
  attempt = 0;
  setStatus("offline");
  ws?.close();
}

function scheduleReconnect(): void {
  const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);
  attempt += 1;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    if (imageListeners.size > 0) connect();
  }, delay);
}

function handleMessage(data: unknown): void {
  if (typeof data !== "string") return;
  let event: ImageCreatedEventDTO;
  try {
    event = JSON.parse(data) as ImageCreatedEventDTO;
  } catch {
    return;
  }
  if (event?.type !== "image.created" || !event.payload) return;

  const image = toFeedImage(event.payload);
  for (const listener of imageListeners) listener(image);
}
