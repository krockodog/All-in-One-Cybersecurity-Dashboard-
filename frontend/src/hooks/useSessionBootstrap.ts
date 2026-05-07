import { useCallback, useEffect, useRef, useState } from "react";
import { User } from "@/types";
import { apiFetch } from "@/utils/api";

interface SessionBootstrapArgs {
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
}

export const useSessionBootstrap = ({ setUser, setAuthenticated }: SessionBootstrapArgs) => {
  const [checkingSession, setCheckingSession] = useState(true);
  const cancelledRef = useRef(false);

  const bootstrapSession = useCallback(async (): Promise<void> => {
    try {
      const payload = await apiFetch<{ user: User }>("/api/v1/auth/me");
      if (cancelledRef.current) {
        return;
      }
      setUser(payload.user);
      setAuthenticated(true);
    } catch {
      if (!cancelledRef.current) {
        setAuthenticated(false);
      }
    } finally {
      if (!cancelledRef.current) {
        setCheckingSession(false);
      }
    }
  }, [apiFetch, cancelledRef, setAuthenticated, setUser]);

  useEffect(() => {
    cancelledRef.current = false;

    void bootstrapSession();

    return () => {
      cancelledRef.current = true;
    };
  }, [apiFetch, bootstrapSession, cancelledRef]);

  return { checkingSession };
};
