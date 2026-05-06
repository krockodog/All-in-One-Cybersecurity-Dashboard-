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
const WebSocketCtor = WebSocket;

interface WebSocketRuntime {
  socket: WebSocket | null;
  retryTimer: number | null;
  retryCount: number;
  reconnect: (() => void) | null;
}

const toWebSocketUrl = (baseUrl: string, pentestId: string): string => {
  const wsBase = baseUrl.replace(/^http/, "ws");
  return `${wsBase}/ws/pentest/${pentestId}`;
};

const parseTerminalEvent = (raw: string): TerminalEvent => JSON.parse(raw) as TerminalEvent;

const trimMessageBuffer = (previous: TerminalEvent[], event: TerminalEvent): TerminalEvent[] => [
  ...previous.slice(-MAX_MESSAGES),
  event,
];

const reconnectDelay = (retryCount: number): number =>
  Math.min(MAX_RECONNECT_DELAY_MS, retryCount * WEBSOCKET_RETRY_DELAY_MS);

const clearRetryTimer = (runtimeRef: MutableRefObject<WebSocketRuntime>): void => {
  if (runtimeRef.current.retryTimer !== null) {
    window.clearTimeout(runtimeRef.current.retryTimer);
    runtimeRef.current.retryTimer = null;
  }
};

const closeSocket = (
  runtimeRef: MutableRefObject<WebSocketRuntime>,
  setConnected: (value: boolean) => void
): void => {
  if (runtimeRef.current.socket) {
    runtimeRef.current.socket.close();
    runtimeRef.current.socket = null;
  }
  setConnected(false);
};

const createConnection = (
  wsUrl: string,
  runtimeRef: MutableRefObject<WebSocketRuntime>,
  setConnected: (value: boolean) => void,
  pushMessage: (event: TerminalEvent) => void
): void => {
  closeSocket(runtimeRef, setConnected);

  const socket = new WebSocket(wsUrl);
  socket.onopen = () => {
    setConnected(true);
    runtimeRef.current.retryCount = 0;
    clearRetryTimer(runtimeRef);
  };

  socket.onmessage = (event: MessageEvent<string>) => {
    pushMessage(parseTerminalEvent(event.data));
  };

  socket.onclose = () => {
    setConnected(false);
    runtimeRef.current.retryCount += 1;
    clearRetryTimer(runtimeRef);

    runtimeRef.current.retryTimer = window.setTimeout(() => {
      if (runtimeRef.current.reconnect) {
        runtimeRef.current.reconnect();
      }
    }, reconnectDelay(runtimeRef.current.retryCount));
  };

  runtimeRef.current.socket = socket;
};

const useWebSocketConnection = (
  pentestId: string,
  wsUrl: string,
  runtimeRef: MutableRefObject<WebSocketRuntime>,
  setConnected: (value: boolean) => void,
  pushMessage: (event: TerminalEvent) => void
): void => {
  const reconnect = useCallback(
    (): void => createConnection(wsUrl, runtimeRef, setConnected, pushMessage),
    [createConnection, pushMessage, runtimeRef, setConnected, wsUrl]
  );

  const cleanupConnection = useCallback(
    (): void => {
      clearRetryTimer(runtimeRef);
      closeSocket(runtimeRef, setConnected);
    },
    [clearRetryTimer, closeSocket, runtimeRef, setConnected]
  );

  useEffect(() => {
    if (!pentestId || !wsUrl) {
      return;
    }
    runtimeRef.current.reconnect = reconnect;
    reconnect();

    return cleanupConnection;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runtimeRef is mutable runtime state managed by this hook.
  }, [cleanupConnection, pentestId, reconnect, runtimeRef, wsUrl]);
};

const useWebSocketHeartbeat = (
  connected: boolean,
  runtimeRef: MutableRefObject<WebSocketRuntime>
): void => {
  const heartbeatIdRef = useRef<number | null>(null);
  const readyState = runtimeRef.current.socket?.readyState ?? WebSocketCtor.CLOSED;
  useEffect(() => {
    if (!connected) {
      return;
    }

    heartbeatIdRef.current = window.setInterval(() => {
      if (runtimeRef.current.socket?.readyState === WebSocketCtor.OPEN) {
        runtimeRef.current.socket.send("ping");
      }
    }, WEBSOCKET_HEARTBEAT_INTERVAL_MS);

    return () => {
      if (heartbeatIdRef.current !== null) {
        window.clearInterval(heartbeatIdRef.current);
        heartbeatIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- heartbeat timer id ref is mutable and intentionally non-reactive.
  }, [connected, heartbeatIdRef, readyState, runtimeRef, WEBSOCKET_HEARTBEAT_INTERVAL_MS, WebSocketCtor]);
};

export const useWebSocket = (pentestId: string) => {
  const [messages, setMessages] = useState<TerminalEvent[]>([]);
  const [connected, setConnected] = useState(false);

  const runtimeRef = useRef<WebSocketRuntime>({
    socket: null,
    retryTimer: null,
    retryCount: 0,
    reconnect: null,
  });

  const baseUrl = process.env.REACT_APP_BACKEND_URL ?? "";
  const wsUrl = useMemo(() => (baseUrl ? toWebSocketUrl(baseUrl, pentestId) : ""), [baseUrl, pentestId, toWebSocketUrl]);

  const pushMessage = (event: TerminalEvent): void => {
    setMessages((previous) => trimMessageBuffer(previous, event));
  };

  useWebSocketConnection(pentestId, wsUrl, runtimeRef, setConnected, pushMessage);
  useWebSocketHeartbeat(connected, runtimeRef);

  return { messages, connected };
};
