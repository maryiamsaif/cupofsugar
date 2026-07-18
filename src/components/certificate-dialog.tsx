import { useState } from "react";
import { X, ExternalLink, ShieldCheck } from "lucide-react";
import type { CertificateFile } from "@/lib/cupofsugar/state";

const PROVIDERS = [
  {
    name: "Responsible Training",
    price: "~$99",
    tag: "Most affordable",
    blurb: "ANSI/ANAB accredited. Fully online course + proctored exam. Good default choice.",
    url: "https://www.responsibletraining.com/",
  },
  {
    name: "Trust20",
    price: "~$139",
    tag: "Chicago-approved",
    blurb: "Explicitly names Chicago on their site — max peace of mind for the cautious baker.",
    url: "https://trust20.co/",
  },
];

export function CertificateDialog({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: (cert: CertificateFile) => void;
}) {
  const [selectedProvider, setSelectedProvider] = useState<string>("Responsible Training");
  const [reading, setReading] = useState(false);

  async function handleFile(file: File) {
    setReading(true);
    const reader = new FileReader();
    reader.onload = () => {
      onUploaded({
        filename: file.name,
        data_url: String(reader.result),
        provider: selectedProvider,
        uploaded_at: new Date().toISOString(),
      });
      setReading(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
        >
          <X className="size-4" />
        </button>

        <div className="px-8 pt-8 pb-6">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-cta-red">
            Stop 2 · Get Certified
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-neutral-950">
            Your Food Protection Manager certificate
          </h2>
          <p className="mt-2 max-w-[54ch] text-sm text-neutral-600">
            Chicago requires an ANSI/ANAB-accredited CFPM certificate (good for
            5 years) before you register. Pick a course, complete the exam,
            then upload the PDF you're emailed.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 px-8 pb-6 sm:grid-cols-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.name}
              onClick={() => setSelectedProvider(p.name)}
              className={
                "flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all " +
                (selectedProvider === p.name
                  ? "border-cta-red bg-cta-red/5"
                  : "border-neutral-200 hover:border-neutral-300")
              }
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-display text-lg font-semibold">{p.name}</span>
                <span className="text-sm font-semibold text-cta-red">{p.price}</span>
              </div>
              <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                {p.tag}
              </span>
              <p className="text-xs leading-relaxed text-neutral-600">{p.blurb}</p>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-cta-red hover:underline"
              >
                Open course <ExternalLink className="size-3" />
              </a>
            </button>
          ))}
        </div>

        <div className="border-t border-neutral-950/5 bg-neutral-50/60 px-8 py-6">
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-neutral-300 bg-white px-5 py-4 transition-colors hover:border-cta-red">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-6 text-cta-red" />
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {reading ? "Reading certificate..." : "Upload your CFPM certificate"}
                </p>
                <p className="text-xs text-neutral-500">
                  PDF, PNG, or JPG. Stored locally in your browser.
                </p>
              </div>
            </div>
            <input
              type="file"
              accept=".pdf,image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <span className="rounded-full bg-cta-red px-4 py-2 text-xs font-semibold text-white">
              Choose file
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
