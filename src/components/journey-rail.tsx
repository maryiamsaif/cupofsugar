import { STAGES, type StageId } from "@/lib/cupofsugar/stages";
import { Check, Lock } from "lucide-react";

export function JourneyRail({
  currentStage,
  completed,
  onSelect,
}: {
  currentStage: StageId;
  completed: StageId[];
  onSelect: (stage: StageId) => void;
}) {
  return (
    <div className="sticky top-24">
      <div className="mb-6">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-cta-red">
          The Cupofsugar Line
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-[0.95] tracking-tight text-neutral-950 sm:text-5xl">
          Your ride to a<br />registered kitchen.
        </h1>
        <p className="mt-3 max-w-[38ch] text-pretty text-sm text-neutral-600">
          Seven stops between "I want to sell my cookies" and your first
          farmers market. Each one, done right.
        </p>
      </div>

      {/* Vertical Red Line with stations */}
      <div className="relative pl-2">
        <div className="absolute left-[19px] top-3 bottom-3 w-[6px] rounded-full bg-neutral-200" />
        <div
          className="absolute left-[19px] top-3 w-[6px] rounded-full bg-cta-red transition-[height] duration-700 ease-out"
          style={{
            height: `calc(${((Math.min(currentStage, 4) - 1) / 6) * 100}% + 12px)`,
          }}
        />

        <ul className="relative space-y-5">
          {STAGES.map((s) => {
            const isDone = completed.includes(s.id);
            const isCurrent = s.id === currentStage && s.status === "built";
            const isLocked = s.status === "locked";
            return (
              <li key={s.id}>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => !isLocked && onSelect(s.id)}
                  className="group flex w-full items-center gap-4 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  <span
                    className={
                      "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full ring-4 ring-surface transition-all " +
                      (isDone
                        ? "bg-cta-red text-white"
                        : isCurrent
                          ? "border-[5px] border-cta-red bg-white"
                          : isLocked
                            ? "border-2 border-dashed border-neutral-300 bg-neutral-50 text-neutral-400"
                            : "border-2 border-neutral-300 bg-white")
                    }
                  >
                    {isDone ? (
                      <Check className="size-5" strokeWidth={3} />
                    ) : isLocked ? (
                      <Lock className="size-3.5" />
                    ) : isCurrent ? (
                      <span className="size-2.5 rounded-full bg-cta-red" />
                    ) : (
                      <span className="text-xs font-semibold text-neutral-500">
                        {s.id}
                      </span>
                    )}
                    {isCurrent && (
                      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-cta-red/25" />
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Stop {s.id}
                      {isLocked && " · Coming soon"}
                      {isDone && " · Verified"}
                      {isCurrent && " · Now boarding"}
                    </span>
                    <span
                      className={
                        "block font-display text-lg font-medium leading-tight " +
                        (isLocked ? "text-neutral-400" : "text-neutral-900")
                      }
                    >
                      {s.name}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-8 max-w-[36ch] text-xs italic text-neutral-500">
        Tap any active stop to jump the mentor's conversation to that stage.
      </p>
    </div>
  );
}
