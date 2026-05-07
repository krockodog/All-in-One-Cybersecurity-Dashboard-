import { UseMutationResult, UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings } from "@/types";
import { apiFetch } from "@/utils/api";

interface UseSettingsResult {
  settings: UseQueryResult<{ data: Settings }, Error>;
  updateSettings: UseMutationResult<{ data: Settings }, Error, Settings>;
}

export const useSettings = (): UseSettingsResult => {
  const queryClient = useQueryClient();

  const settings = useQuery({
    queryKey: ["settings"],
    queryFn: () => apiFetch<{ data: Settings }>("/api/v1/settings")
  });

  const updateSettings = useMutation({
    mutationFn: (payload: Settings) =>
      apiFetch<{ data: Settings }>("/api/v1/settings", {
        method: "PUT",
        body: JSON.stringify(payload)
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] })
  });

  return { settings, updateSettings };
};
