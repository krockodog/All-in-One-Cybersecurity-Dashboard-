import { useEffect, useState } from "react";
import { User } from "@/types";
import { apiFetch } from "@/utils/api";

interface SessionBootstrapArgs {
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
}

export const useSessionBootstrap = ({ setUser, setAuthenticated }: SessionBootstrapArgs) => {
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const bootstrapSession = async (): Promise<void> => {
      try {
        const payload = await apiFetch<{ user: User }>("/api/v1/auth/me");
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
  }, [setAuthenticated, setUser]);

  return { checkingSession };
};
