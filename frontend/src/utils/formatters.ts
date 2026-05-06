import { FindingSeverity } from "@/types";

export const formatDate = (value: string) => new Date(value).toLocaleString();

export const severityClass = (severity: FindingSeverity) => {
  switch (severity) {
    case "critical":
      return "text-red-400";
    case "high":
      return "text-orange-400";
    case "medium":
      return "text-yellow-300";
    case "low":
      return "text-blue-300";
    default:
      return "text-slate-300";
  }
};
