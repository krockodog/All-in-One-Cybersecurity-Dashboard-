import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/utils/api";
import { clearTokens, saveTokens } from "@/utils/auth";
import { User } from "@/types";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const useAuth = () => {
  const login = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiFetch<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials)
      }),
    onSuccess: (payload) => saveTokens(payload.accessToken, payload.refreshToken)
  });

  const logout = () => clearTokens();

  return { login, logout };
};
