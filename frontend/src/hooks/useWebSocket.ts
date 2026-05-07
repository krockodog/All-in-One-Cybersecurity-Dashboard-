import { Dispatch, MutableRefObject, SetStateAction, useCallback, useEffect, useRef, useState } from "react";

export interface TerminalEvent {
  time: string;
  level: string;
  message: string;
}

const MAX_MESSAGES = 300;
const WEBSOCKET_RECONNECT_DELAY_MS = 800;
const MAX_RECONNECT_DELAY_MS = 5000;
const WEBSOCKET_TIMEOUT_MS = 15000;
const WebSocketCtor = WebSocket;
const MessageEventCtor = MessageEvent;
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
  Math.min(MAX_RECONNECT_DELAY_MS, retryCount * WEBSOCKET_RECONNECT_DELAY_MS);

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

interface ConnectSocketArgs {
  pentestId: string;
  wsUrl: string;
  socketRef: MutableRefObject<WebSocket | null>;
  retryTimerRef: MutableRefObject<number | null>;
  retryCountRef: MutableRefObject<number>;
  reconnectRef: MutableRefObject<() => void>;
  setConnected: (value: boolean) => void;
  setMessages: Dispatch<SetStateAction<TerminalEvent[]>>;
}

const connectSocket = ({
  pentestId,
  wsUrl,
  socketRef,
  retryTimerRef,
  retryCountRef,
  reconnectRef,
  setConnected,
  setMessages,
}: ConnectSocketArgs): void => {
  if (!pentestId) {
    return;
  }

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
    setMessages((previous: TerminalEvent[]) => trimMessageBuffer(previous, parseTerminalEvent(event.data)));
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

const useWebSocketHeartbeat = (
  connected: boolean,
  heartbeatIdRef: MutableRefObject<number | null>,
  socketRef: MutableRefObject<WebSocket | null>
): void => {
  const readyState = socketRef.current?.readyState ?? WebSocketCtor.CLOSED;

  useEffect(() => {
    if (!connected || !socketRef.current) {
      return;
    }

    heartbeatIdRef.current = window.setInterval(() => {
      if (socketRef.current?.readyState === WebSocketCtor.OPEN) {
        socketRef.current.send("ping");
      }
    }, WEBSOCKET_TIMEOUT_MS);

    return () => {
      if (heartbeatIdRef.current !== null) {
        window.clearInterval(heartbeatIdRef.current);
        heartbeatIdRef.current = null;
      }
    };
  }, [WEBSOCKET_TIMEOUT_MS, WebSocketCtor, connected, heartbeatIdRef, readyState, socketRef]);
};

const useWebSocketConnection = (
  pentestId: string,
  socketRef: MutableRefObject<WebSocket | null>,
  retryTimerRef: MutableRefObject<number | null>,
  retryCountRef: MutableRefObject<number>,
  reconnectRef: MutableRefObject<() => void>,
  setConnected: (value: boolean) => void,
  setMessages: Dispatch<SetStateAction<TerminalEvent[]>>
): void => {
  const handleWebSocketConnection = useCallback((): void => {
    const wsUrl = toWebSocketUrl(backendUrl, pentestId);
    void MessageEventCtor;

    connectSocket({
      pentestId,
      wsUrl,
      socketRef,
      retryTimerRef,
      retryCountRef,
      reconnectRef,
      setConnected,
      setMessages,
    });
  }, [MessageEventCtor, WebSocketCtor, backendUrl, pentestId, reconnectRef, retryCountRef, retryTimerRef, setConnected, setMessages, socketRef]);

  useEffect(() => {
    reconnectRef.current = handleWebSocketConnection;

    if (!pentestId) {
      setMessages([]);
      clearRetryTimer(retryTimerRef);
      closeCurrentSocket(socketRef, setConnected);
      return;
    }

    handleWebSocketConnection();

    return () => {
      clearRetryTimer(retryTimerRef);
      closeCurrentSocket(socketRef, setConnected);
    };
  }, [handleWebSocketConnection, pentestId, reconnectRef, retryTimerRef, setConnected, setMessages, socketRef]);
};

export const useWebSocket = (pentestId: string) => {
  const [messages, setMessages] = useState<TerminalEvent[]>([]);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const reconnectRef = useRef<() => void>(() => undefined);
  const heartbeatIdRef = useRef<number | null>(null);

  useWebSocketConnection(
    pentestId,
    socketRef,
    retryTimerRef,
    retryCountRef,
    reconnectRef,
    setConnected,
    setMessages
  );

  useWebSocketHeartbeat(connected, heartbeatIdRef, socketRef);

  return { messages, connected };
};
