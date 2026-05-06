import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, TargetType } from "@/types";
import { apiFetch } from "@/utils/api";

interface TargetsResponse {
  data: Target[];
}

export const useTargets = () => {
  const queryClient = useQueryClient();

  const targets = useQuery({
    queryKey: ["targets"],
    queryFn: () => apiFetch<TargetsResponse>("/api/v1/targets")
  });

  const createTarget = useMutation({
    mutationFn: (payload: { name: string; type: TargetType; value: string; tags: string[] }) =>
      apiFetch<{ data: Target }>("/api/v1/targets", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["targets"] })
  });

  return { targets, createTarget };
};
