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
    <div className="relative overflow-hidden rounded-3xl bg-paper p-6 ring-1 ring-cta-red/15 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="font-hand text-xl leading-none text-cta-red">
            currently mixing
          </p>
          <h3 className="mt-2 font-display text-3xl leading-tight text-ink">
            {stage?.name}
          </h3>
          <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-ink/70">
            {stage?.blurb}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-5xl leading-none text-cta-red">
            {pct}
            <span className="text-2xl align-top">%</span>
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50">
            recipe done
          </p>
        </div>
      </div>
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-cta-red/10">
        <div
          className="h-full bg-cta-red transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
