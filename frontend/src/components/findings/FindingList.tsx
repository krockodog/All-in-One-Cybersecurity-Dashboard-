import { ReactElement } from "react";
import { useFindings } from "@/hooks/useFindings";
import { Finding } from "@/types";
import { formatDate, severityClass } from "@/utils/formatters";

interface FindingColumn {
  key: "name" | "severity" | "cvss" | "epss" | "cve" | "tool" | "createdAt";
  label: string;
}

interface FindingRowProps {
  finding: Finding;
}

const FINDING_COLUMNS: FindingColumn[] = [
  { key: "name", label: "Name" },
  { key: "severity", label: "Severity" },
  { key: "cvss", label: "CVSS" },
  { key: "epss", label: "EPSS" },
  { key: "cve", label: "CVE" },
  { key: "tool", label: "Tool" },
  { key: "createdAt", label: "Created" },
];

const FindingRow = ({ finding }: FindingRowProps): ReactElement => (
  <tr key={finding.id} className="border-t border-white/10" data-testid={`finding-row-${finding.id}`}>
    <td className="px-3 py-2">{finding.name}</td>
    <td className={`px-3 py-2 font-semibold ${severityClass(finding.severity)}`}>{finding.severity.toUpperCase()}</td>
    <td className="px-3 py-2">{finding.cvss.toFixed(1)}</td>
    <td className="px-3 py-2">{finding.epss.toFixed(2)}</td>
    <td className="px-3 py-2">{finding.cve || "-"}</td>
    <td className="px-3 py-2">{finding.tool}</td>
    <td className="px-3 py-2">{formatDate(finding.createdAt)}</td>
  </tr>
);

export const FindingList = (): ReactElement => {
  const { findings } = useFindings();
  const items: Finding[] = findings.data?.data ?? [];

  return (
    <section className="space-y-3" data-testid="finding-list-section">
      <h2 className="text-2xl font-semibold">Findings</h2>
      <div className="overflow-x-auto rounded-xl border border-white/10" data-testid="finding-list">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider">
            <tr>
              {FINDING_COLUMNS.map((column: FindingColumn) => (
                <th key={column.key} className="px-3 py-2">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((finding: Finding) => (
              <FindingRow key={finding.id} finding={finding} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
