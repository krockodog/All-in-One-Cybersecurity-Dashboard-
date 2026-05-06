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
  const sessionPayload = useRef<{ user: User } | null>(null);

  const fetchSessionUser = async (): Promise<{ user: User }> => apiFetch<{ user: User }>("/api/v1/auth/me");

  const runSessionCheck = useCallback(async (): Promise<void> => {
    try {
      const fetchedSessionPayload = await fetchSessionUser();
      sessionPayload.current = fetchedSessionPayload;
      if (!mountedRef.current) {
        return;
      }
      setUser(fetchedSessionPayload.user);
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
  }, [fetchSessionUser, mountedRef, sessionPayload, setAuthenticated, setCheckingSession, setUser]);

  useEffect(() => {
    mountedRef.current = true;

    void runSessionCheck();

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `User` is a type-only symbol; mountedRef is a mutable lifecycle guard.
  }, [mountedRef, runSessionCheck]);

  return { checkingSession };
};
