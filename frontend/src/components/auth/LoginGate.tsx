import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/contexts/AuthContext";
import { apiFetch } from "@/utils/api";
import { User } from "@/types";

export const LoginGate = ({ children }: { children: ReactNode }) => {
  const { login } = useAuth();
  const { authenticated, setUser, setAuthenticated } = useAuthContext();
  const [email, setEmail] = useState("admin@omnius.local");
  const [password, setPassword] = useState("change_me_admin_password");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const payload = await apiFetch<{ user: User }>("/api/v1/auth/me");
        setUser(payload.user);
        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
      } finally {
        setCheckingSession(false);
      }
    };
    void checkSession();
  }, [setAuthenticated, setUser]);

  if (checkingSession) {
    return <div className="flex min-h-screen items-center justify-center" data-testid="login-session-check">Checking session...</div>;
  }

  if (authenticated) {
    return <>{children}</>;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const response = await login.mutateAsync({ email, password });
    setUser(response.user);
    setAuthenticated(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" data-testid="login-gate-screen">
      <form onSubmit={handleSubmit} className="panel w-full max-w-md space-y-3 p-6" data-testid="login-form">
        <h1 className="text-2xl font-semibold">OMNIUS Login</h1>
        <input data-testid="login-email-input" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2" />
        <input data-testid="login-password-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2" />
        {login.isError && <p className="text-sm text-red-400" data-testid="login-error-message">Login failed</p>}
        <button data-testid="login-submit-button" type="submit" className="w-full rounded-lg bg-neon/25 px-4 py-2 transition hover:bg-neon/35">
          Sign in
        </button>
      </form>
    </div>
  );
};
