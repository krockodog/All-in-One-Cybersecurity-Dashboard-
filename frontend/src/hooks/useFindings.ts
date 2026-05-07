import { UseMutationResult, UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Finding } from "@/types";
import { apiFetch } from "@/utils/api";

interface FindingsResponse {
  data: Finding[];
}

interface UseFindingsResult {
  findings: UseQueryResult<FindingsResponse, Error>;
  createFinding: UseMutationResult<{ data: Finding }, Error, Omit<Finding, "id" | "createdAt">>;
}

export const useFindings = (): UseFindingsResult => {
  const queryClient = useQueryClient();

  const findings = useQuery({
    queryKey: ["findings"],
    queryFn: () => apiFetch<FindingsResponse>("/api/v1/findings")
  });

  const createFinding = useMutation({
    mutationFn: (payload: Omit<Finding, "id" | "createdAt">) =>
      apiFetch<{ data: Finding }>("/api/v1/findings", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["findings"] })
  });

  return { findings, createFinding };
};
