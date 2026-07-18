import { useState } from "react";
import type { CupofsugarState } from "@/lib/cupofsugar/state";

const PRODUCTS = ["Cookies", "Cakes", "Breads", "Muffins & scones", "Something else"];
const CHANNELS = ["Farmers markets", "Porch pickup for neighbors", "Direct online orders", "A little of everything"];
const GOALS = ["A weekend side thing", "A full second income", "Go legit with a hobby"];

export function OnboardingDialog({
  onComplete,
}: {
  onComplete: (data: NonNullable<CupofsugarState["onboarding"]>) => void;
}) {
  const [step, setStep] = useState(0);
  const [products, setProducts] = useState<string>("");
  const [channels, setChannels] = useState<string>("");
  const [goal, setGoal] = useState<string>("");

  const steps = [
    {
      q: "What do you dream of making?",
      sub: "You can change this later — we just want a warm starting point.",
      options: PRODUCTS,
      value: products,
      set: setProducts,
    },
    {
      q: "Where would you love to sell it?",
      sub: "Chicago cottage food operators can sell direct to the neighbor.",
      options: CHANNELS,
      value: channels,
      set: setChannels,
    },
    {
      q: "And where do you want to end up?",
      sub: "No wrong answer — we'll pace the journey to match.",
      options: GOALS,
      value: goal,
      set: setGoal,
    },
  ];

  const cur = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-lg overflow-hidden rounded-3xl bg-paper shadow-2xl ring-1 ring-cta-red/20">
        <div className="pointer-events-none absolute -top-3 left-10 h-6 w-24 rotate-[-4deg] bg-butter/80 shadow-sm ring-1 ring-black/5" />
        <div className="h-1.5 w-full bg-cta-red/10">
          <div
            className="h-full bg-cta-red transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="px-8 pt-10 pb-6">
          <p className="font-hand text-xl leading-none text-cta-red">
            prep · ingredient {step + 1} of {steps.length}
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight text-ink">
            {cur.q}
          </h2>
          <p className="mt-2 text-sm text-ink/70">{cur.sub}</p>

          <div className="mt-6 grid gap-2">
            {cur.options.map((opt) => (
              <button
                key={opt}
                onClick={() => cur.set(opt)}
                className={
                  "rounded-2xl border-2 px-5 py-3.5 text-left text-[15px] transition-all " +
                  (cur.value === opt
                    ? "border-cta-red bg-cta-red/5 font-semibold text-cta-red"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50")
                }
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-950/5 bg-neutral-50/70 px-8 py-4">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 disabled:opacity-30"
          >
            ← Back
          </button>
          <button
            onClick={() => {
              if (step < steps.length - 1) {
                setStep((s) => s + 1);
              } else {
                onComplete({ products, channels, goal });
              }
            }}
            disabled={!cur.value}
            className="rounded-full bg-cta-red px-6 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step < steps.length - 1 ? "Continue →" : "Start the recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}
