import { useCallback, useEffect, useState } from "react";
import { User } from "@/types";
import { apiFetch } from "@/utils/api";

interface SessionBootstrapArgs {
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
}

export const useSessionBootstrap = ({ setUser, setAuthenticated }: SessionBootstrapArgs) => {
  const [checkingSession, setCheckingSession] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const payload = await apiFetch<{ user: User }>("/api/v1/auth/me");
      setUser(payload.user);
      setAuthenticated(true);
    } catch {
      setAuthenticated(false);
    } finally {
      setCheckingSession(false);
    }
  }, [setAuthenticated, setUser]);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return { checkingSession };
};
