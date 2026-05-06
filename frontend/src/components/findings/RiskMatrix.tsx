import { ReactElement } from "react";
import { useRiskMatrix } from "@/hooks/useRiskMatrix";

const heatColors: string[] = ["bg-green-500/20", "bg-yellow-500/30", "bg-orange-500/40", "bg-red-500/50"];

export const RiskMatrix = (): ReactElement => {
  const { data } = useRiskMatrix();
  const matrix: number[][] = data?.matrix ?? Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 0));

  return (
    <section className="space-y-4" data-testid="risk-matrix-section">
      <h2 className="text-2xl font-semibold">NIST CSF 2.0 Risk Matrix</h2>
      <div className="overflow-x-auto">
        <div className="grid min-w-[500px] grid-cols-5 gap-2" data-testid="risk-matrix-grid">
          {matrix.flatMap((row, rowIndex) =>
            row.map((value, colIndex) => {
              const colorIndex = Math.min(3, Math.floor(value / 2));
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  data-testid={`risk-cell-${rowIndex}-${colIndex}`}
                  className={`aspect-square rounded-lg border border-white/10 ${heatColors[colorIndex]} text-lg font-semibold transition hover:scale-[1.02]`}
                >
                  {value}
                </button>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
