import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Finding } from "@/types";
import { apiFetch } from "@/utils/api";

interface FindingsResponse {
  data: Finding[];
}

export const useFindings = () => {
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
