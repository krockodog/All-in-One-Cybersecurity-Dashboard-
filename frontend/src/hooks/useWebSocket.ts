import { useEffect, useMemo, useRef, useState } from "react";

export interface TerminalEvent {
  time: string;
  level: string;
  message: string;
}

export const useWebSocket = (pentestId: string) => {
  const [messages, setMessages] = useState<TerminalEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const retryRef = useRef(0);

  const wsUrl = useMemo(() => {
    if (!process.env.REACT_APP_BACKEND_URL) {
      return "";
    }
    const base = process.env.REACT_APP_BACKEND_URL.replace(/^http/, "ws");
    return `${base}/ws/pentest/${pentestId}`;
  }, [pentestId]);

  useEffect(() => {
    if (!pentestId || !wsUrl) {
      return;
    }

    let socket: WebSocket | null = null;
    let retryTimer: number | undefined;

    const connect = () => {
      socket = new WebSocket(wsUrl);
      socket.onopen = () => {
        setConnected(true);
        retryRef.current = 0;
      };
      socket.onmessage = (event) => {
        const parsed = JSON.parse(event.data) as TerminalEvent;
        setMessages((previous) => [...previous.slice(-300), parsed]);
      };
      socket.onclose = () => {
        setConnected(false);
        retryRef.current += 1;
        retryTimer = window.setTimeout(connect, Math.min(5000, retryRef.current * 800));
      };
    };

    connect();

    const heartbeat = window.setInterval(() => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send("ping");
      }
    }, 15000);

    return () => {
      window.clearInterval(heartbeat);
      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
      socket?.close();
    };
  }, [pentestId, wsUrl]);

  return { messages, connected };
};
