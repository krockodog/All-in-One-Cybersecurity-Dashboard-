import { Dispatch, MutableRefObject, SetStateAction, useEffect, useMemo, useRef, useState } from "react";

export interface TerminalEvent {
  time: string;
  level: string;
  message: string;
}

const MAX_MESSAGES = 300;
const RECONNECT_DELAY_MS = 800;
const MAX_RECONNECT_DELAY_MS = 5000;
const HEARTBEAT_INTERVAL_MS = 15000;

const toWebSocketUrl = (baseUrl: string, pentestId: string): string => {
  const wsBase = baseUrl.replace(/^http/, "ws");
  return `${wsBase}/ws/pentest/${pentestId}`;
};

const parseTerminalEvent = (raw: string): TerminalEvent => JSON.parse(raw) as TerminalEvent;

const nextRetryDelay = (retryCount: number): number => Math.min(MAX_RECONNECT_DELAY_MS, retryCount * RECONNECT_DELAY_MS);

const appendLimitedMessages = (previous: TerminalEvent[], event: TerminalEvent): TerminalEvent[] => [
  ...previous.slice(-MAX_MESSAGES),
  event
];

interface SocketHandlers {
  onOpen: () => void;
  onMessage: (event: TerminalEvent) => void;
  onClose: () => void;
}

const createSocket = (wsUrl: string, handlers: SocketHandlers): WebSocket => {
  const socket = new WebSocket(wsUrl);
  socket.onopen = handlers.onOpen;
  socket.onmessage = (messageEvent: MessageEvent<string>) => {
    handlers.onMessage(parseTerminalEvent(messageEvent.data));
  };
  socket.onclose = handlers.onClose;
  return socket;
};

interface SocketLifecycleArgs {
  pentestId: string;
  wsUrl: string;
  retryRef: MutableRefObject<number>;
  setConnected: Dispatch<SetStateAction<boolean>>;
  setMessages: Dispatch<SetStateAction<TerminalEvent[]>>;
}

const useSocketLifecycle = ({ pentestId, wsUrl, retryRef, setConnected, setMessages }: SocketLifecycleArgs): void => {
  useEffect(() => {
    if (!pentestId || !wsUrl) {
      return;
    }

    let socket: WebSocket | null = null;
    let retryTimer: number | undefined;

    const connect = (): void => {
      socket = createSocket(wsUrl, {
        onOpen: () => {
          setConnected(true);
          retryRef.current = 0;
        },
        onMessage: (event: TerminalEvent) => {
          setMessages((previous) => appendLimitedMessages(previous, event));
        },
        onClose: () => {
          setConnected(false);
          retryRef.current += 1;
          retryTimer = window.setTimeout(connect, nextRetryDelay(retryRef.current));
        }
      });
    };

    connect();

    const heartbeat = window.setInterval(() => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send("ping");
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      window.clearInterval(heartbeat);
      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
      socket?.close();
    };
  }, [pentestId, retryRef, setConnected, setMessages, wsUrl]);
};

export const useWebSocket = (pentestId: string) => {
  const [messages, setMessages] = useState<TerminalEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const retryRef = useRef(0);

  const baseUrl = process.env.REACT_APP_BACKEND_URL ?? "";

  const wsUrl = useMemo(() => {
    if (!baseUrl) {
      return "";
    }
    return toWebSocketUrl(baseUrl, pentestId);
  }, [baseUrl, pentestId, toWebSocketUrl]);

  useSocketLifecycle({ pentestId, wsUrl, retryRef, setConnected, setMessages });

  return { messages, connected };
};
