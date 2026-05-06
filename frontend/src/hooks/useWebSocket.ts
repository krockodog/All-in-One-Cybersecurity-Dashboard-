import { MutableRefObject, useEffect, useRef, useState } from "react";

export interface TerminalEvent {
  time: string;
  level: string;
  message: string;
}

const MAX_MESSAGES = 300;
const INITIAL_RECONNECT_DELAY_MS = 800;
const MAX_RECONNECT_DELAY_MS = 5000;
const WEBSOCKET_HEARTBEAT_INTERVAL_MS = 15000;

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
  Math.min(MAX_RECONNECT_DELAY_MS, retryCount * INITIAL_RECONNECT_DELAY_MS);

interface ConnectionHookArgs {
  pentestId: string;
  wsUrl: string;
  socketRef: MutableRefObject<WebSocket | null>;
  retryTimerRef: MutableRefObject<number | null>;
  retryCountRef: MutableRefObject<number>;
  connectRef: MutableRefObject<(() => void) | null>;
  setConnected: (value: boolean) => void;
  pushMessage: (event: TerminalEvent) => void;
}

const useWebSocketConnection = ({
  pentestId,
  wsUrl,
  socketRef,
  retryTimerRef,
  retryCountRef,
  connectRef,
  setConnected,
  pushMessage,
}: ConnectionHookArgs): void => {
  useEffect(() => {
    if (!pentestId || !wsUrl) {
      return;
    }

    const clearRetryTimer = (): void => {
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };

    const closeSocket = (): void => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setConnected(false);
    };

    const connect = (): void => {
      closeSocket();
      const socket = new WebSocket(wsUrl);
      socket.onopen = () => {
        setConnected(true);
        retryCountRef.current = 0;
        clearRetryTimer();
      };
      socket.onmessage = (event: MessageEvent<string>) => {
        pushMessage(parseTerminalEvent(event.data));
      };
      socket.onclose = () => {
        setConnected(false);
        retryCountRef.current += 1;
        clearRetryTimer();
        retryTimerRef.current = window.setTimeout(() => {
          if (connectRef.current) {
            connectRef.current();
          }
        }, reconnectDelay(retryCountRef.current));
      };
      socketRef.current = socket;
    };

    connectRef.current = connect;
    connect();

    return () => {
      clearRetryTimer();
      closeSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are intentionally mutable connection holders.
  }, [
    pentestId,
    wsUrl,
    socketRef,
    retryTimerRef,
    retryCountRef,
    connectRef,
    setConnected,
    pushMessage,
    parseTerminalEvent,
    reconnectDelay,
  ]);
};

const useWebSocketHeartbeat = (
  connected: boolean,
  socketRef: MutableRefObject<WebSocket | null>
): void => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- WebSocket is a global constructor; socketRef controls current instance.
  }, [connected, socketRef, WEBSOCKET_HEARTBEAT_INTERVAL_MS]);
};

export const useWebSocket = (pentestId: string) => {
  const [messages, setMessages] = useState<TerminalEvent[]>([]);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const connectRef = useRef<(() => void) | null>(null);

  const baseUrl = process.env.REACT_APP_BACKEND_URL ?? "";
  const wsUrl = baseUrl ? toWebSocketUrl(baseUrl, pentestId) : "";

  const pushMessage = (event: TerminalEvent): void => {
    setMessages((previous) => trimMessageBuffer(previous, event));
  };

  useWebSocketConnection({
    pentestId,
    wsUrl,
    socketRef,
    retryTimerRef,
    retryCountRef,
    connectRef,
    setConnected,
    pushMessage,
  });

  useWebSocketHeartbeat(connected, socketRef);

  return { messages, connected };
};
