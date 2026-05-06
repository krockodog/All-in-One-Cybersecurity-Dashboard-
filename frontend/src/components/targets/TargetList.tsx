import { ReactElement } from "react";
import { Target } from "@/types";
import { formatDate } from "@/utils/formatters";

interface TargetListProps {
  targets: Target[];
}

export const TargetList = ({ targets }: TargetListProps): ReactElement => {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10" data-testid="target-list">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-300">
          <tr>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Value</th>
            <th className="px-3 py-2">Tags</th>
            <th className="px-3 py-2">Findings</th>
            <th className="px-3 py-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {targets.map((target) => (
            <tr key={target.id} className="border-t border-white/5" data-testid={`target-row-${target.id}`}>
              <td className="px-3 py-2" data-testid={`target-name-${target.id}`}>{target.name}</td>
              <td className="px-3 py-2 uppercase">{target.type}</td>
              <td className="px-3 py-2 mono text-neon">{target.value}</td>
              <td className="px-3 py-2">{target.tags.join(", ") || "-"}</td>
              <td className="px-3 py-2">{target.findingsCount}</td>
              <td className="px-3 py-2">{formatDate(target.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
