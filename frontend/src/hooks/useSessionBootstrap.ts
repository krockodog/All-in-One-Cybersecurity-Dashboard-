import { useCallback, useEffect, useRef, useState } from "react";
import { User } from "@/types";
import { apiFetch } from "@/utils/api";

interface SessionBootstrapArgs {
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
}

export const useSessionBootstrap = ({ setUser, setAuthenticated }: SessionBootstrapArgs) => {
  const [checkingSession, setCheckingSession] = useState(true);
  const mountedRef = useRef(true);
  const payload = useRef<{ user: User } | null>(null);
  const sessionActionsRef = useRef({ setUser, setAuthenticated, setCheckingSession });

  sessionActionsRef.current = { setUser, setAuthenticated, setCheckingSession };

  const fetchSessionUser = async (): Promise<{ user: User }> => apiFetch<{ user: User }>("/api/v1/auth/me");

  const runSessionCheck = useCallback(async (): Promise<void> => {
    try {
      const fetchedSessionPayload = await fetchSessionUser();
      payload.current = fetchedSessionPayload;
      if (!mountedRef.current) {
        return;
      }
      sessionActionsRef.current.setUser(fetchedSessionPayload.user);
      sessionActionsRef.current.setAuthenticated(true);
    } catch {
      if (mountedRef.current) {
        sessionActionsRef.current.setAuthenticated(false);
      }
    } finally {
      if (mountedRef.current) {
        sessionActionsRef.current.setCheckingSession(false);
      }
    }
  }, [fetchSessionUser, mountedRef, payload, sessionActionsRef]);

  useEffect(() => {
    mountedRef.current = true;

    void runSessionCheck();

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `User` is type-only; refs are lifecycle containers.
  }, [mountedRef, payload, runSessionCheck]);

  return { checkingSession };
};
