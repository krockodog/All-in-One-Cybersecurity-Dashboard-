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
  const fetchedSessionPayload = useRef<{ user: User } | null>(null);

  const fetchSessionUser = async (): Promise<{ user: User }> => apiFetch<{ user: User }>("/api/v1/auth/me");

  const runSessionCheck = useCallback(async (): Promise<void> => {
    try {
      const payload = await fetchSessionUser();
      fetchedSessionPayload.current = payload;
      if (!mountedRef.current) {
        return;
      }
      setUser(payload.user);
      setAuthenticated(true);
    } catch {
      if (mountedRef.current) {
        setAuthenticated(false);
      }
    } finally {
      if (mountedRef.current) {
        setCheckingSession(false);
      }
    }
  }, [fetchSessionUser, fetchedSessionPayload, mountedRef, setAuthenticated, setCheckingSession, setUser]);

  useEffect(() => {
    mountedRef.current = true;

    void runSessionCheck();

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `User` is type-only; refs are lifecycle containers.
  }, [fetchedSessionPayload, mountedRef, runSessionCheck]);

  return { checkingSession };
};
