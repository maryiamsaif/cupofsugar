import { useState } from "react";
import { X, ExternalLink, BookOpen, CheckCircle2, Circle } from "lucide-react";

const CHECKLIST = [
  "Create a business in Wave for your cottage bakery.",
  "Add income categories (e.g., Cottage Food Sales, Farmers Market).",
  "Track expenses like flour, packaging, and your CFPM course.",
  "Connect your bank or record cash sales weekly.",
  "Set aside a folder for tax receipts and monthly reports.",
];

const WAVE_URL = "https://www.waveapps.com/signup/";

export function BookkeepingDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
        >
          <X className="size-4" />
        </button>

        <div className="px-8 pt-8 pb-6">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-cta-red">
            Post-Registration · Bonus Stop
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-neutral-950">
            Set up bookkeeping in Wave
          </h2>
          <p className="mt-2 max-w-[54ch] text-sm text-neutral-600">
            Keep your cottage bakery finances clean. Wave's free plan covers
            income, expenses, and simple reporting — perfect for small cottage
            food operators.
          </p>
        </div>

        <div className="px-8 pb-6">
          <div className="rounded-2xl bg-neutral-50 p-5 ring-1 ring-black/5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Starter checklist
            </p>
            <ul className="flex flex-col gap-3">
              {CHECKLIST.map((item, i) => {
                const done = checked.has(i);
                const Icon = done ? CheckCircle2 : Circle;
                return (
                  <li key={i}>
                    <button
                      onClick={() => toggle(i)}
                      className="flex items-start gap-3 text-left"
                    >
                      <Icon
                        className={
                          "mt-0.5 size-5 shrink-0 " +
                          (done ? "text-cta-red" : "text-neutral-400")
                        }
                      />
                      <span
                        className={
                          "text-sm leading-snug " +
                          (done
                            ? "text-neutral-500 line-through"
                            : "text-neutral-800")
                        }
                      >
                        {item}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-950/5 bg-neutral-50/60 px-8 py-6">
          <a
            href={WAVE_URL}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-cta-red px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
          >
            <BookOpen className="size-4" />
            Create your free Wave account
            <ExternalLink className="size-3.5" />
          </a>
          <p className="mt-3 text-center text-[10px] text-neutral-500">
            Opens Wave signup in a new tab. No account is connected to this app.
          </p>
        </div>
      </div>
    </div>
  );
}
