import { STAGES, type StageId } from "@/lib/cupofsugar/stages";

export function ProgressCard({
  currentStage,
  completedCount,
}: {
  currentStage: StageId;
  completedCount: number;
}) {
  const stage = STAGES.find((s) => s.id === currentStage);
  const pct = Math.min(100, Math.round((completedCount / 4) * 100));
  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Now approaching
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold leading-tight text-neutral-950">
            {stage?.name}
          </h3>
          <p className="mt-1 max-w-[42ch] text-sm text-neutral-600">
            {stage?.blurb}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-4xl font-semibold leading-none text-cta-red">
            {pct}%
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Journey complete
          </p>
        </div>
      </div>
      <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full bg-cta-red transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
