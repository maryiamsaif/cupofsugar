import { useState } from "react";
import type { CupofsugarState } from "@/lib/cupofsugar/state";

const PRODUCTS = ["Cookies", "Cakes", "Breads", "Muffins & scones", "Something else"];
const CHANNELS = ["Farmers markets", "Porch pickup for neighbors", "Direct online orders", "A little of everything"];
const WHEN = ["This month", "In the next 3 months", "Later this year", "Just exploring"];
const GOALS = ["A weekend side thing", "A full second income", "Go legit with a hobby"];

type Onboarding = NonNullable<CupofsugarState["onboarding"]>;

export function OnboardingDialog({
  onComplete,
}: {
  onComplete: (data: Onboarding) => void;
}) {
  const [step, setStep] = useState(0);
  const [products, setProducts] = useState("");
  const [channels, setChannels] = useState("");
  const [when, setWhen] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");

  const steps: Array<
    | {
        kind: "choice";
        q: string;
        sub: string;
        options: string[];
        value: string;
        set: (v: string) => void;
      }
    | {
        kind: "email";
        q: string;
        sub: string;
        value: string;
        set: (v: string) => void;
      }
  > = [
    { kind: "choice", q: "What do you dream of baking?", sub: "You can change this later — we just want a warm starting point.", options: PRODUCTS, value: products, set: setProducts },
    { kind: "choice", q: "Where would you love to sell it?", sub: "Chicago cottage food bakers can sell direct to the neighbor.", options: CHANNELS, value: channels, set: setChannels },
    { kind: "choice", q: "When do you want to start selling?", sub: "This just paces the recipe — no wrong answer.", options: WHEN, value: when, set: setWhen },
    { kind: "email", q: "What's your email?", sub: "We'll simulate sending your CDPH application from here later.", value: email, set: setEmail },
    { kind: "choice", q: "And where do you want to end up?", sub: "This is really about turning passion into a paycheck.", options: GOALS, value: goal, set: setGoal },
  ];

  const cur = steps[step];
  const isValid = cur.kind === "email"
    ? /.+@.+\..+/.test(cur.value)
    : !!cur.value;

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

          {cur.kind === "choice" ? (
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
          ) : (
            <input
              type="email"
              autoFocus
              value={cur.value}
              onChange={(e) => cur.set(e.target.value)}
              placeholder="you@kitchen.com"
              className="mt-6 w-full rounded-2xl border-2 border-neutral-200 bg-white px-5 py-3.5 text-[15px] outline-none focus:border-cta-red"
            />
          )}
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
                onComplete({ products, channels, when, email, goal });
              }
            }}
            disabled={!isValid}
            className="rounded-full bg-cta-red px-6 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step < steps.length - 1 ? "Continue →" : "Start the recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}
