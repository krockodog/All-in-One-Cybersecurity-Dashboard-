import { UseMutationResult, UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, TargetType } from "@/types";
import { apiFetch } from "@/utils/api";

interface TargetsResponse {
  data: Target[];
}

interface CreateTargetPayload {
  name: string;
  type: TargetType;
  value: string;
  tags: string[];
}

interface UseTargetsResult {
  targets: UseQueryResult<TargetsResponse, Error>;
  createTarget: UseMutationResult<{ data: Target }, Error, CreateTargetPayload>;
}

export const useTargets = (): UseTargetsResult => {
  const queryClient = useQueryClient();

  const targets = useQuery({
    queryKey: ["targets"],
    queryFn: () => apiFetch<TargetsResponse>("/api/v1/targets")
  });

  const createTarget = useMutation({
    mutationFn: (payload: CreateTargetPayload) =>
      apiFetch<{ data: Target }>("/api/v1/targets", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["targets"] })
  });

  return { targets, createTarget };
};
