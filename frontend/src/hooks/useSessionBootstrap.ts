import { useEffect, useMemo, useState } from "react";
import { User } from "@/types";
import { apiFetch } from "@/utils/api";

interface SessionBootstrapArgs {
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
}

export const useSessionBootstrap = ({ setUser, setAuthenticated }: SessionBootstrapArgs) => {
  const [checkingSession, setCheckingSession] = useState(true);
  const sessionFetcher = useMemo(() => apiFetch<{ user: User }>, [apiFetch]);

  useEffect(() => {
    let cancelled = false;

    const bootstrapSession = async (): Promise<void> => {
      try {
        const payload = await sessionFetcher("/api/v1/auth/me");
        if (cancelled) {
          return;
        }
        setUser(payload.user);
        setAuthenticated(true);
      } catch {
        if (!cancelled) {
          setAuthenticated(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    };

    void bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [sessionFetcher, setAuthenticated, setUser]);

  return { checkingSession };
};
