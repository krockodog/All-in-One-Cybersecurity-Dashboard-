import { TargetForm } from "./TargetForm";
import { TargetList } from "./TargetList";
import { useTargets } from "@/hooks/useTargets";

export const TargetManager = () => {
  const { targets, createTarget } = useTargets();
  const targetItems = targets.data?.data ?? [];

  return (
    <section className="space-y-4" data-testid="target-manager">
      <div>
        <h2 className="text-2xl font-semibold">Targets</h2>
        <p className="text-sm text-slate-400">Manage domains, hosts, user identifiers and asset groups.</p>
      </div>
      <TargetForm onSubmit={(payload) => createTarget.mutate(payload)} />
      <TargetList targets={targetItems} />
    </section>
  );
};
