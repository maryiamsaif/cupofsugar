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
import { PricingDialog } from "@/components/pricing-dialog";
import { SelfCertificationDialog } from "@/components/self-certification-dialog";

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
  const [priceOpen, setPriceOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);



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
    <div className="min-h-screen bg-surface font-body text-ink selection:bg-cta-red/20">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-cta-red/15 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-md bg-paper ring-1 ring-cta-red/25 shadow-[0_2px_0_0_rgba(168,50,71,0.15)] rotate-[-3deg]">
              <span className="font-hand text-2xl leading-none text-cta-red">c/s</span>
            </div>
            <div>
              <p className="font-display text-2xl leading-none tracking-tight text-ink">
                Cup of Sugar
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cta-red/70">
                A recipe · Passion → Paycheck
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-paper px-3 py-1.5 ring-1 ring-cta-red/20 sm:flex">
              <span className="size-2 rounded-full bg-cta-red animate-pulse" />
              <span className="text-xs font-semibold text-ink">Kitchen open · Live mentor</span>
            </div>
            <button
              onClick={() => {
                if (confirm("Start the recipe from scratch?")) reset();
              }}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-paper hover:text-ink"
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
              <MentorChat key={`${state.chatResetKey}-${state.onboarded}`} state={state} onStateChange={(fn) => update(fn)} />
              <DocumentsStrip
                state={state}
                onOpenCertificate={() => setCertOpen(true)}
                onOpenSubmission={() => setSubOpen(true)}
                onOpenBookkeeping={() => setBkOpen(true)}
                onOpenPricing={() => setPriceOpen(true)}
                onOpenChecklist={() => setChecklistOpen(true)}
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
            update((s) => {
              const allowed = ["Cookies", "Cakes", "Breads", "Muffins & scones"];
              const isAllowed = data.products && allowed.includes(data.products);
              const next: typeof s = { ...s, onboarded: true, onboarding: data };
              if (isAllowed && data.products) {
                next.products = [
                  ...s.products,
                  { name: data.products, category: "allowed", ingredients: [], allergens: [] },
                ];
                next.stages_completed = Array.from(new Set([...s.stages_completed, 1 as StageId]));
                next.current_stage = Math.max(s.current_stage, 2) as StageId;
              }
              return next;
            })
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
      {priceOpen && <PricingDialog onClose={() => setPriceOpen(false)} />}
      {checklistOpen && (
        <SelfCertificationDialog
          initial={state.selfCertification}
          onClose={() => setChecklistOpen(false)}
          onCertified={(sc) => update((s) => ({ ...s, selfCertification: sc }))}
        />
      )}


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
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-cta-red/5 p-5 ring-1 ring-cta-red/20">
      <div>
        <p className="font-hand text-xl leading-none text-cta-red">
          Chef's note · step {stage?.id}
        </p>
        <p className="mt-2 max-w-[54ch] text-sm text-neutral-800">{body}</p>
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
