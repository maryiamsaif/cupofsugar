import { useEffect, useState } from "react";
import { X, CheckCircle2, Download, Mail } from "lucide-react";
import type { CupofsugarState, Submission } from "@/lib/cupofsugar/state";
import { renderApplicationPdf, bytesToDataUrl } from "@/lib/cupofsugar/pdf";

export function SubmissionDialog({
  state,
  onClose,
  onSubmitted,
}: {
  state: CupofsugarState;
  onClose: () => void;
  onSubmitted: (sub: Submission) => void;
}) {
  const [signature, setSignature] = useState(state.business.legal_name ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Submission | null>(state.submission);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const bytes = await renderApplicationPdf(state, signature || "Preview");
      const url = bytesToDataUrl(bytes);
      if (!cancelled) setPreviewUrl(url);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, state.products.length, state.business.legal_name, state.business.address]);

  async function handleSubmit() {
    if (!signature.trim()) return;
    setSubmitting(true);
    const bytes = await renderApplicationPdf(state, signature.trim());
    const url = bytesToDataUrl(bytes);
    const sub: Submission = {
      status: "sent",
      filled_pdf_data_url: url,
      signature: signature.trim(),
      signed_at: new Date().toISOString(),
    };
    setTimeout(() => {
      setDone(sub);
      onSubmitted(sub);
      setSubmitting(false);
    }, 700);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-sm p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
        >
          <X className="size-4" />
        </button>

        {done ? (
          <SentPanel submission={done} />
        ) : (
          <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-5">
            <div className="col-span-1 flex flex-col p-8 md:col-span-2">
              <p className="font-display text-xs uppercase tracking-[0.2em] text-cta-red">
                Stop 4 · Submit to City
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-neutral-950">
                Review and sign
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Your CDPH cottage food application is drafted from what we
                captured together. Take a look on the right — anything wrong,
                we'll fix in the chat.
              </p>

              <div className="mt-6 space-y-2 rounded-2xl bg-neutral-50 p-4 text-xs ring-1 ring-black/5">
                <Row label="Operator" value={state.business.legal_name || "—"} />
                <Row label="Address" value={state.business.address || "—"} />
                <Row label="Products" value={String(state.products.length)} />
                <Row
                  label="CFPM"
                  value={state.certificate ? "On file" : "Missing"}
                />
              </div>

              <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Type your signature
              </label>
              <input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Your full legal name"
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 font-['Caveat',cursive] text-2xl italic ring-2 ring-neutral-200 focus:outline-none focus:ring-cta-red"
              />
              <p className="mt-1 text-[11px] text-neutral-500 italic">
                CDPH accepts a typed signature on emailed applications.
              </p>

              <button
                onClick={handleSubmit}
                disabled={!signature.trim() || submitting}
                className="mt-6 flex items-center justify-center gap-2 rounded-full bg-cta-red px-6 py-3 text-sm font-semibold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Mail className="size-4" />
                {submitting ? "Sending..." : "Sign & send to CDPH"}
              </button>
              <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
                This demo simulates the email to{" "}
                <span className="font-semibold text-neutral-700">food@cityofchicago.org</span>.
                Your signed PDF is stored in your browser.
              </p>
            </div>

            <div className="col-span-1 border-t border-neutral-950/5 bg-neutral-100 p-4 md:col-span-3 md:border-l md:border-t-0">
              {previewUrl ? (
                <iframe
                  title="Application preview"
                  src={previewUrl}
                  className="h-[520px] w-full rounded-2xl bg-white ring-1 ring-black/5"
                />
              ) : (
                <div className="grid h-[520px] w-full place-items-center rounded-2xl bg-white text-sm text-neutral-500 ring-1 ring-black/5">
                  Rendering your application…
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold text-neutral-900">{value}</span>
    </div>
  );
}

function SentPanel({ submission }: { submission: Submission }) {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-cta-red/10 text-cta-red">
        <CheckCircle2 className="size-9" strokeWidth={2.2} />
      </div>
      <p className="mt-6 font-display text-xs uppercase tracking-[0.22em] text-cta-red">
        Sent · Stop 4 complete
      </p>
      <h2 className="mt-2 max-w-[24ch] font-display text-4xl font-semibold leading-tight text-neutral-950">
        Your application is on its way to CDPH.
      </h2>
      <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-neutral-600">
        In the real deal, this goes to{" "}
        <span className="font-semibold text-neutral-900">food@cityofchicago.org</span>.
        CDPH typically responds in <span className="font-semibold">6–8 weeks</span>.
        They'll invoice you for the small registration fee — pay them
        directly. Cupofsugar never handles government fees.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={submission.filled_pdf_data_url}
          download="cupofsugar-cottage-food-application.pdf"
          className="inline-flex items-center gap-2 rounded-full bg-cta-red px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Download className="size-4" />
          Download signed PDF
        </a>
        <a
          href={submission.filled_pdf_data_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 ring-1 ring-black/10"
        >
          Open in new tab
        </a>
      </div>

      <p className="mt-8 text-xs italic text-neutral-500">
        Signed as "{submission.signature}" · {new Date(submission.signed_at).toLocaleString()}
      </p>
    </div>
  );
}
