import { useMemo, useState } from "react";
import { X, Calculator } from "lucide-react";

export function PricingDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("Chocolate chip cookie");
  const [ingredients, setIngredients] = useState("2.50");
  const [packaging, setPackaging] = useState("0.35");
  const [minutes, setMinutes] = useState("15");
  const [wage, setWage] = useState("22");
  const [batch, setBatch] = useState("12");
  const [margin, setMargin] = useState("60");

  const nums = {
    ing: parseFloat(ingredients) || 0,
    pkg: parseFloat(packaging) || 0,
    min: parseFloat(minutes) || 0,
    wage: parseFloat(wage) || 0,
    batch: Math.max(1, parseFloat(batch) || 1),
    margin: parseFloat(margin) || 0,
  };

  const result = useMemo(() => {
    const laborCost = (nums.min / 60) * nums.wage;
    const totalCost = nums.ing + nums.pkg + laborCost;
    const perUnitCost = totalCost / nums.batch;
    const price = perUnitCost * (1 + nums.margin / 100);
    return {
      perUnitCost: perUnitCost.toFixed(2),
      laborCost: laborCost.toFixed(2),
      totalCost: totalCost.toFixed(2),
      price: price.toFixed(2),
      profit: (price - perUnitCost).toFixed(2),
    };
  }, [nums.ing, nums.pkg, nums.min, nums.wage, nums.batch, nums.margin]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-paper shadow-2xl ring-1 ring-cta-red/20">
        <div className="pointer-events-none absolute -top-3 left-10 h-6 w-24 rotate-[-4deg] bg-butter/80 shadow-sm ring-1 ring-black/5" />
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-white/70 text-neutral-500 hover:bg-white"
        >
          <X className="size-4" />
        </button>

        <div className="px-8 pt-10 pb-4">
          <p className="font-hand text-xl leading-none text-cta-red">
            bonus step · price your goods
          </p>
          <h2 className="mt-2 font-display text-3xl leading-tight text-ink">
            What should you charge?
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            A simple ingredients + time + margin recipe. Adjust any number — the price updates as you go.
          </p>
        </div>

        <div className="grid gap-6 px-8 pb-6 md:grid-cols-2">
          <div className="space-y-3">
            <Field label="Product" value={name} onChange={setName} />
            <Field label="Ingredients cost per batch ($)" value={ingredients} onChange={setIngredients} type="number" />
            <Field label="Packaging per batch ($)" value={packaging} onChange={setPackaging} type="number" />
            <Field label="Minutes to make a batch" value={minutes} onChange={setMinutes} type="number" />
            <Field label="Your hourly rate ($)" value={wage} onChange={setWage} type="number" />
            <Field label="Units per batch" value={batch} onChange={setBatch} type="number" />
            <Field label="Profit margin (%)" value={margin} onChange={setMargin} type="number" />
          </div>
          <div className="flex flex-col justify-between rounded-2xl bg-cta-red/5 p-5 ring-1 ring-cta-red/15">
            <div>
              <div className="flex items-center gap-2 text-cta-red">
                <Calculator className="size-4" />
                <p className="font-hand text-lg leading-none">the number</p>
              </div>
              <p className="mt-3 font-display text-xs uppercase tracking-widest text-ink/60">
                Suggested price per unit
              </p>
              <p className="mt-1 font-display text-5xl leading-none text-ink">
                ${result.price}
              </p>
              <p className="mt-1 font-hand text-lg text-ink/60">
                per {name.toLowerCase()}
              </p>
            </div>
            <div className="mt-6 space-y-1.5 text-sm text-ink/80">
              <Row label="Ingredients" value={`$${nums.ing.toFixed(2)}`} />
              <Row label="Packaging" value={`$${nums.pkg.toFixed(2)}`} />
              <Row label="Your time" value={`$${result.laborCost}`} />
              <Row label="Total batch cost" value={`$${result.totalCost}`} strong />
              <Row label="Cost per unit" value={`$${result.perUnitCost}`} />
              <Row label="Profit per unit" value={`$${result.profit}`} strong />
            </div>
          </div>
        </div>

        <div className="border-t border-cta-red/10 bg-white/40 px-8 py-4 text-xs text-ink/60">
          Tip: check Chicago farmers-market prices for a similar item and land within ~15% of the middle of the range.
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/60">
        {label}
      </span>
      <input
        type={type}
        inputMode={type === "number" ? "decimal" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-cta-red/20 bg-white px-3 py-2 text-sm outline-none focus:border-cta-red"
      />
    </label>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={"flex items-center justify-between " + (strong ? "font-semibold text-ink" : "")}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
