import { useEffect, useRef, useState } from "react";
import { User } from "@/types";
import { apiFetch } from "@/utils/api";

interface SessionBootstrapArgs {
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
}

export const useSessionBootstrap = ({ setUser, setAuthenticated }: SessionBootstrapArgs) => {
  const [checkingSession, setCheckingSession] = useState(true);
  const mountedRef = useRef(true);

  const fetchSessionUser = async (): Promise<{ user: User }> => apiFetch<{ user: User }>("/api/v1/auth/me");

  useEffect(() => {
    mountedRef.current = true;

    const runSessionCheck = async (): Promise<void> => {
      try {
        const fetchedSessionPayload = await fetchSessionUser();
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
    };

    void runSessionCheck();

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `User` is type-only; mountedRef is a stable lifecycle guard ref.
  }, [fetchSessionUser, setAuthenticated, setCheckingSession, setUser]);

  return { checkingSession };
};
