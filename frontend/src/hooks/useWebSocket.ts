import { MutableRefObject, useEffect, useRef, useState } from "react";

export interface TerminalEvent {
  time: string;
  level: string;
  message: string;
}

const MAX_MESSAGES = 300;
const WEBSOCKET_RETRY_DELAY_MS = 800;
const MAX_RECONNECT_DELAY_MS = 5000;
const WEBSOCKET_HEARTBEAT_INTERVAL_MS = 15000;
const WebSocketCtor = WebSocket;
const backendUrl = process.env.REACT_APP_BACKEND_URL;

if (!backendUrl) {
  throw new Error("Missing REACT_APP_BACKEND_URL");
}

const toWebSocketUrl = (baseUrl: string, pentestId: string): string => {
  const wsBase = baseUrl.replace(/^http/, "ws");
  return `${wsBase}/ws/pentest/${pentestId}`;
};

const parseTerminalEvent = (raw: string): TerminalEvent => {
  const parsed = JSON.parse(raw) as Partial<TerminalEvent>;
  return {
    time: parsed.time ?? new Date().toISOString(),
    level: parsed.level ?? "info",
    message: parsed.message ?? raw,
  };
};

const trimMessageBuffer = (previous: TerminalEvent[], event: TerminalEvent): TerminalEvent[] => [
  ...previous.slice(-MAX_MESSAGES),
  event,
];

const reconnectDelay = (retryCount: number): number =>
  Math.min(MAX_RECONNECT_DELAY_MS, retryCount * WEBSOCKET_RETRY_DELAY_MS);

const clearRetryTimer = (retryTimerRef: MutableRefObject<number | null>): void => {
  if (retryTimerRef.current !== null) {
    window.clearTimeout(retryTimerRef.current);
    retryTimerRef.current = null;
  }
};

const closeCurrentSocket = (
  socketRef: MutableRefObject<WebSocket | null>,
  setConnected: (value: boolean) => void
): void => {
  if (socketRef.current) {
    socketRef.current.close();
    socketRef.current = null;
  }
  setConnected(false);
};

const useWebSocketHeartbeat = (
  connected: boolean,
  heartbeatIdRef: MutableRefObject<number | null>,
  socketRef: MutableRefObject<WebSocket | null>
): void => {
  useEffect(() => {
    if (!connected || !socketRef.current) {
      return;
    }

    heartbeatIdRef.current = window.setInterval(() => {
      if (socketRef.current?.readyState === WebSocketCtor.OPEN) {
        socketRef.current.send("ping");
      }
    }, WEBSOCKET_HEARTBEAT_INTERVAL_MS);

    return () => {
      if (heartbeatIdRef.current !== null) {
        window.clearInterval(heartbeatIdRef.current);
        heartbeatIdRef.current = null;
      }
    };
  }, [WEBSOCKET_HEARTBEAT_INTERVAL_MS, WebSocketCtor, connected, heartbeatIdRef, socketRef]);
};

export const useWebSocket = (pentestId: string) => {
  const [messages, setMessages] = useState<TerminalEvent[]>([]);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const reconnectRef = useRef<() => void>(() => undefined);
  const heartbeatIdRef = useRef<number | null>(null);

  useEffect(() => {
    const wsUrl = toWebSocketUrl(backendUrl, pentestId);

    const connect = (): void => {
      clearRetryTimer(retryTimerRef);
      closeCurrentSocket(socketRef, setConnected);

      const socket = new WebSocketCtor(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setConnected(true);
        retryCountRef.current = 0;
        clearRetryTimer(retryTimerRef);
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        setMessages((previous) => trimMessageBuffer(previous, parseTerminalEvent(event.data)));
      };

      socket.onclose = () => {
        if (socketRef.current !== socket) {
          return;
        }

        setConnected(false);
        retryCountRef.current += 1;
        clearRetryTimer(retryTimerRef);
        retryTimerRef.current = window.setTimeout(() => {
          reconnectRef.current();
        }, reconnectDelay(retryCountRef.current));
      };
    };

    reconnectRef.current = connect;

    if (!pentestId) {
      setMessages([]);
      clearRetryTimer(retryTimerRef);
      closeCurrentSocket(socketRef, setConnected);
      return;
    }

    connect();

    return () => {
      clearRetryTimer(retryTimerRef);
      closeCurrentSocket(socketRef, setConnected);
    };
  }, [backendUrl, pentestId, reconnectRef, setMessages]);

  useWebSocketHeartbeat(connected, heartbeatIdRef, socketRef);

  return { messages, connected };
};
