import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { JourneyRail } from "@/components/journey-rail";
import { MentorChat } from "@/components/mentor-chat";
import { ProgressCard } from "@/components/progress-card";
import { DocumentsStrip } from "@/components/documents-strip";
import { OnboardingDialog } from "@/components/onboarding-dialog";
import { CertificateDialog } from "@/components/certificate-dialog";
import { SubmissionDialog } from "@/components/submission-dialog";
import { BookkeepingDialog } from "@/components/bookkeeping-dialog";
import { useCupofsugarState } from "@/lib/cupofsugar/state";
import type { StageId } from "@/lib/cupofsugar/stages";
import { STAGES } from "@/lib/cupofsugar/stages";
import { RotateCcw } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { state, hydrated, update, reset } = useCupofsugarState();
  const [certOpen, setCertOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [bkOpen, setBkOpen] = useState(false);

  // Auto-open certificate dialog when the AI marks stage 2 without a cert yet
  useEffect(() => {
    if (
      hydrated &&
      state.onboarded &&
      state.current_stage === 2 &&
      !state.certificate &&
      !certOpen
    ) {
      // gentle nudge — don't auto-open, let user click. Just noop.
    }
  }, [hydrated, state.current_stage, state.certificate, state.onboarded, certOpen]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-surface" />
    );
  }

  return (
    <div className="min-h-screen bg-surface font-body text-neutral-900 selection:bg-cta-red/15">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-neutral-950/5 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-cta-red text-white shadow-sm">
              <span className="font-display text-2xl font-semibold leading-none">C</span>
            </div>
            <div>
              <p className="font-display text-xl font-semibold tracking-wide leading-none">
                CUPOFSUGAR
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 mt-1">
                Chicago Cottage Food · CDPH Guide
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-white px-3 py-1.5 ring-1 ring-black/5 sm:flex">
              <span className="size-2 rounded-full bg-cta-red animate-pulse" />
              <span className="text-xs font-semibold">The Cup Of Sugar Line · Live</span>
            </div>
            <button
              onClick={() => {
                if (confirm("Start the whole journey over?")) reset();
              }}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              title="Reset demo state"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <section className="lg:col-span-5">
            <JourneyRail
              currentStage={state.current_stage}
              completed={state.stages_completed}
              onSelect={(id: StageId) => {
                update((s) => ({ ...s, current_stage: id }));
              }}
            />
          </section>

          <section className="lg:col-span-7">
            <div className="flex flex-col gap-5">
              <ProgressCard
                currentStage={state.current_stage}
                completedCount={state.stages_completed.length}
              />
              <MentorChat state={state} onStateChange={(fn) => update(fn)} />
              <DocumentsStrip
                state={state}
                onOpenCertificate={() => setCertOpen(true)}
                onOpenSubmission={() => setSubOpen(true)}
                onOpenBookkeeping={() => setBkOpen(true)}
              />
              <StageActionHint
                currentStage={state.current_stage}
                hasCert={!!state.certificate}
                hasProfile={!!state.business.legal_name}
                productsCount={state.products.length}
                hasSubmission={!!state.submission}
                onOpenCert={() => setCertOpen(true)}
                onOpenSub={() => setSubOpen(true)}
              />
            </div>
          </section>
        </div>
      </main>

      {!state.onboarded && (
        <OnboardingDialog
          onComplete={(data) =>
            update((s) => ({ ...s, onboarded: true, onboarding: data }))
          }
        />
      )}
      {certOpen && (
        <CertificateDialog
          onClose={() => setCertOpen(false)}
          onUploaded={(cert) => {
            update((s) => {
              const stages_completed = Array.from(new Set([...s.stages_completed, 2 as StageId]));
              const current_stage = Math.max(s.current_stage, 3) as StageId;
              return { ...s, certificate: cert, stages_completed, current_stage };
            });
            setCertOpen(false);
          }}
        />
      )}
      {subOpen && (
        <SubmissionDialog
          state={state}
          onClose={() => setSubOpen(false)}
          onSubmitted={(sub) => {
            update((s) => {
              const stages_completed = Array.from(new Set([...s.stages_completed, 4 as StageId]));
              return { ...s, submission: sub, stages_completed, current_stage: 4 };
            });
          }}
        />
      )}
      {bkOpen && <BookkeepingDialog onClose={() => setBkOpen(false)} />}
    </div>
  );
}

function StageActionHint(props: {
  currentStage: StageId;
  hasCert: boolean;
  hasProfile: boolean;
  productsCount: number;
  hasSubmission: boolean;
  onOpenCert: () => void;
  onOpenSub: () => void;
}) {
  const stage = STAGES.find((s) => s.id === props.currentStage);
  let cta: { label: string; onClick: () => void } | null = null;
  let body = "";

  if (props.currentStage === 2 && !props.hasCert) {
    cta = { label: "Open certificate desk", onClick: props.onOpenCert };
    body = "When your mentor recommends a course, open the certificate desk to pick a provider and upload your CFPM certificate.";
  } else if (props.currentStage === 4 && !props.hasSubmission && props.hasProfile && props.productsCount > 0) {
    cta = { label: "Review & sign application", onClick: props.onOpenSub };
    body = "Your application is drafted. Open the review to preview the PDF, type your signature, and send it to CDPH.";
  } else if (props.currentStage === 4 && props.hasSubmission) {
    cta = { label: "Reopen sent packet", onClick: props.onOpenSub };
    body = "You've submitted. Reopen anytime to download the signed PDF.";
  }

  if (!cta) return null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-cta-red/5 p-5 ring-1 ring-cta-red/15">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cta-red">
          Conductor's note · Stop {stage?.id}
        </p>
        <p className="mt-1 max-w-[54ch] text-sm text-neutral-800">{body}</p>
      </div>
      <button
        onClick={cta.onClick}
        className="shrink-0 rounded-full bg-cta-red px-4 py-2 text-xs font-semibold text-white active:scale-95"
      >
        {cta.label}
      </button>
    </div>
  );
}
