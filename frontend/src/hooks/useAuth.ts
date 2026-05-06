import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/utils/api";
import { clearSessionCookies } from "@/utils/auth";
import { User } from "@/types";

interface LoginResponse {
  user: User;
}

export const useAuth = () => {
  const login = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiFetch<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials)
      }),
  });

  const logout = async () => {
    try {
      await apiFetch<{ ok: boolean }>("/api/v1/auth/logout", { method: "POST" });
    } finally {
      clearSessionCookies();
    }
  };

  return { login, logout };
};
