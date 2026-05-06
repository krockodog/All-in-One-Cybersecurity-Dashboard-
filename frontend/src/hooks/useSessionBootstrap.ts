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
    let mounted = true;

    const runSessionCheck = async (): Promise<void> => {
      try {
        const payload = await apiFetch<{ user: User }>("/api/v1/auth/me");
        if (!mounted) {
          return;
        }
        setUser(payload.user);
        setAuthenticated(true);
      } catch {
        if (mounted) {
          setAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    void runSessionCheck();

    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `User` and local `payload` are type/local values, not reactive dependencies.
  }, [apiFetch, setAuthenticated, setCheckingSession, setUser]);

  return { checkingSession };
};
