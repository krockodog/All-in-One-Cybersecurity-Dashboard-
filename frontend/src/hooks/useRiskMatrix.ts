import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/utils/api";

interface RiskMatrixPayload {
  labels: { likelihood: string[]; impact: string[] };
  matrix: number[][];
}

export const useRiskMatrix = () => {
  return useQuery({
    queryKey: ["risk-matrix"],
    queryFn: () => apiFetch<RiskMatrixPayload>("/api/v1/findings/risk-matrix")
  });
};
