import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface TerminalEvent {
  time: string;
  level: string;
  message: string;
}

const MAX_MESSAGES = 300;
const WEBSOCKET_RECONNECT_DELAY_MS = 800;
const WEBSOCKET_HEARTBEAT_INTERVAL_MS = 15000;
const MAX_RECONNECT_DELAY_MS = 5000;

const toWebSocketUrl = (baseUrl: string, pentestId: string): string => {
  const wsBase = baseUrl.replace(/^http/, "ws");
  return `${wsBase}/ws/pentest/${pentestId}`;
};

const parseTerminalEvent = (raw: string): TerminalEvent => JSON.parse(raw) as TerminalEvent;

const trimMessages = (previous: TerminalEvent[], nextEvent: TerminalEvent): TerminalEvent[] => [
  ...previous.slice(-MAX_MESSAGES),
  nextEvent,
];

const reconnectDelay = (retryCount: number): number =>
  Math.min(MAX_RECONNECT_DELAY_MS, retryCount * WEBSOCKET_RECONNECT_DELAY_MS);

export const useWebSocket = (pentestId: string) => {
  const [messages, setMessages] = useState<TerminalEvent[]>([]);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const connectRef = useRef<() => void>(() => undefined);

  const baseUrl = process.env.REACT_APP_BACKEND_URL ?? "";
  const wsUrl = useMemo(() => (baseUrl ? toWebSocketUrl(baseUrl, pentestId) : ""), [baseUrl, pentestId]);

  const clearRetryTimer = useCallback((): void => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const closeSocket = useCallback((): void => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setConnected(false);
  }, []);

  const onOpen = useCallback((): void => {
    setConnected(true);
    retryCountRef.current = 0;
    clearRetryTimer();
  }, [clearRetryTimer]);

  const onMessage = useCallback((event: MessageEvent<string>): void => {
    const parsed = parseTerminalEvent(event.data);
    setMessages((previous) => trimMessages(previous, parsed));
  }, []);

  const scheduleReconnect = useCallback((): void => {
    retryCountRef.current += 1;
    const delay = reconnectDelay(retryCountRef.current);
    retryTimerRef.current = window.setTimeout(() => {
      connectRef.current();
    }, delay);
  }, []);

  const onClose = useCallback((): void => {
    setConnected(false);
    clearRetryTimer();
    scheduleReconnect();
  }, [clearRetryTimer, scheduleReconnect]);

  const connect = useCallback((): void => {
    if (!wsUrl) {
      return;
    }
    closeSocket();
    const socket = new WebSocket(wsUrl);
    socket.onopen = onOpen;
    socket.onmessage = onMessage;
    socket.onclose = onClose;
    socketRef.current = socket;
  }, [closeSocket, onClose, onMessage, onOpen, wsUrl]);

  useEffect(() => {
    if (!pentestId || !wsUrl) {
      return;
    }
    connectRef.current = connect;
    connect();
    return () => {
      clearRetryTimer();
      closeSocket();
    };
  }, [clearRetryTimer, closeSocket, connect, pentestId, wsUrl]);

  useEffect(() => {
    if (!connected) {
      return;
    }
    const heartbeatId = window.setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send("ping");
      }
    }, WEBSOCKET_HEARTBEAT_INTERVAL_MS);

    return () => {
      window.clearInterval(heartbeatId);
    };
  }, [connected]);

  return { messages, connected };
};
