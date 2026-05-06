export default function ReportsPage() {
  return (
    <section className="space-y-3" data-testid="reports-page">
      <h2 className="text-2xl font-semibold">Reports</h2>
      <div className="rounded-xl border border-white/10 p-4">
        <button data-testid="generate-report-button" className="rounded-lg bg-neon/20 px-4 py-2 transition hover:bg-neon/30">
          Generate Report (PDF / HTML / JSON)
        </button>
      </div>
    </section>
  );
}
