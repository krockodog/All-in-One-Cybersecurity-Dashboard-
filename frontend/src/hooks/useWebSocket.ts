import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface TerminalEvent {
  time: string;
  level: string;
  message: string;
}

const MAX_MESSAGES = 300;
const WEBSOCKET_RETRY_DELAY_MS = 800;
const MAX_RECONNECT_DELAY_MS = 5000;
const WEBSOCKET_HEARTBEAT_INTERVAL_MS = 15000;
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
const useWebSocketHeartbeat = (connected: boolean, socketRef: MutableRefObject<WebSocket | null>): void => {
  const heartbeatIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!connected || !socketRef.current) {
      return;
    }

    heartbeatIdRef.current = window.setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send("ping");
      }
    }, WEBSOCKET_HEARTBEAT_INTERVAL_MS);

    return () => {
      if (heartbeatIdRef.current !== null) {
        window.clearInterval(heartbeatIdRef.current);
        heartbeatIdRef.current = null;
      }
    };
  }, [connected, socketRef]);
};

export const useWebSocket = (pentestId: string) => {
  const [messages, setMessages] = useState<TerminalEvent[]>([]);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const reconnectRef = useRef<() => void>(() => undefined);

  const wsUrl = useMemo(() => toWebSocketUrl(backendUrl, pentestId), [pentestId]);

  const clearRetryTimer = useCallback((): void => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const closeCurrentSocket = useCallback((): void => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setConnected(false);
  }, []);

  const pushMessage = useCallback((event: TerminalEvent): void => {
    setMessages((previous) => trimMessageBuffer(previous, event));
  }, []);

  const connect = useCallback((): void => {
    if (!pentestId) {
      return;
    }

    clearRetryTimer();
    closeCurrentSocket();

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      retryCountRef.current = 0;
      clearRetryTimer();
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      pushMessage(parseTerminalEvent(event.data));
    };

    socket.onclose = () => {
      if (socketRef.current !== socket) {
        return;
      }

      setConnected(false);
      retryCountRef.current += 1;
      clearRetryTimer();

      retryTimerRef.current = window.setTimeout(() => {
        reconnectRef.current();
      }, reconnectDelay(retryCountRef.current));
    };
  }, [clearRetryTimer, closeCurrentSocket, pentestId, pushMessage, wsUrl]);

  useEffect(() => {
    reconnectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    if (!pentestId) {
      setMessages([]);
      return;
    }

    connect();

    return () => {
      clearRetryTimer();
      closeCurrentSocket();
    };
  }, [clearRetryTimer, closeCurrentSocket, connect, pentestId]);

  useWebSocketHeartbeat(connected, socketRef);

  return { messages, connected };
};
