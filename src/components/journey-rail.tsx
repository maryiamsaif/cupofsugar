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
      {/* Recipe card */}
      <div className="relative rounded-[20px] bg-paper p-7 pb-8 shadow-[0_1px_0_rgba(0,0,0,0.04),0_20px_40px_-24px_rgba(42,35,29,0.25)] ring-1 ring-cta-red/15 recipe-margin">
        {/* Tape */}
        <div className="pointer-events-none absolute -top-3 left-10 h-6 w-24 rotate-[-4deg] bg-butter/70 shadow-sm ring-1 ring-black/5" />
        <div className="pointer-events-none absolute -top-3 right-8 h-6 w-16 rotate-[3deg] bg-butter/70 shadow-sm ring-1 ring-black/5" />

        <div className="pl-6">
          <p className="font-hand text-2xl leading-none text-cta-red">
            from the kitchen of —
          </p>
          <h1 className="mt-3 font-display text-[2.6rem] font-normal leading-[1.02] tracking-tight text-ink sm:text-5xl">
            A Recipe for<br />
            <em className="italic text-cta-red">Your Kitchen</em><br />
            Business.
          </h1>
          <p className="mt-4 max-w-[36ch] text-pretty text-[15px] leading-relaxed text-ink/70">
            Seven steps to turn what you love baking into a licensed source of
            income. No jargon. No missed forms.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-cta-red/25" />
            <span className="font-hand text-lg text-cta-red">the steps</span>
            <span className="h-px flex-1 bg-cta-red/25" />
          </div>
        </div>

        {/* Numbered recipe steps */}
        <ol className="mt-5 space-y-2.5 pl-6">
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
                  className={
                    "group flex w-full items-baseline gap-3 rounded-lg px-2 py-1.5 text-left transition-colors " +
                    (isLocked
                      ? "cursor-not-allowed opacity-60"
                      : "hover:bg-cta-red/5")
                  }
                >
                  <span
                    className={
                      "flex size-8 shrink-0 translate-y-1 items-center justify-center rounded-full font-display text-[15px] transition-all " +
                      (isDone
                        ? "bg-cta-red text-white"
                        : isCurrent
                          ? "bg-butter text-ink ring-2 ring-cta-red"
                          : isLocked
                            ? "bg-transparent text-ink/30 ring-1 ring-dashed ring-ink/25"
                            : "bg-paper text-ink ring-1 ring-ink/20")
                    }
                  >
                    {isDone ? (
                      <Check className="size-4" strokeWidth={3} />
                    ) : isLocked ? (
                      <Lock className="size-3" />
                    ) : (
                      s.id
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span
                      className={
                        "block font-display text-[1.35rem] leading-tight " +
                        (isLocked ? "text-ink/40" : "text-ink")
                      }
                    >
                      {s.name}
                      {isCurrent && (
                        <span className="ml-2 font-hand text-lg font-normal text-cta-red">
                          ← you're here
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45">
                      {isLocked
                        ? "next batch"
                        : isDone
                          ? "done · checked off"
                          : isCurrent
                            ? "mixing now"
                            : `step ${s.id}`}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <p className="mt-6 pl-6 font-hand text-lg leading-snug text-ink/60">
          tap any step to jump the mentor's chat there.
        </p>
      </div>
    </div>
  );
}
