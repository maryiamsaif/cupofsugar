import { ShieldCheck, FileText, Plus, ClipboardList, BookOpen, DollarSign } from "lucide-react";
import type { CupofsugarState } from "@/lib/cupofsugar/state";

export function DocumentsStrip({
  state,
  onOpenCertificate,
  onOpenSubmission,
  onOpenBookkeeping,
  onOpenPricing,
}: {
  state: CupofsugarState;
  onOpenCertificate: () => void;
  onOpenSubmission: () => void;
  onOpenBookkeeping: () => void;
  onOpenPricing: () => void;
}) {
  const hasCert = !!state.certificate;
  const hasSubmission = !!state.submission;
  const productsCount = state.products.length;
  const hasProfile = !!state.business.legal_name;

  type Slot = {
    key: string;
    title: string;
    sub: string;
    hand: string;
    icon: typeof ShieldCheck;
    active: boolean;
    action?: () => void;
    disabled?: boolean;
    accent?: boolean;
  };
  const slots: Slot[] = [
    {
      key: "cert",
      title: hasCert ? "CFPM Certificate" : "Upload certificate",
      sub: hasCert ? state.certificate?.filename ?? "" : "PDF from your CFPM course",
      hand: hasCert ? "on file · verified" : "next step · step 2",
      icon: ShieldCheck,
      active: hasCert,
      action: onOpenCertificate,
      accent: !hasCert,
    },
    {
      key: "submit",
      title: hasSubmission ? "Application sent" : "Review & sign",
      sub: hasSubmission ? "PDF saved locally" : "the CDPH packet",
      hand: hasSubmission ? "sent · saved" : "unlocks at step 4",
      icon: hasSubmission ? FileText : Plus,
      active: hasSubmission,
      action: onOpenSubmission,
      disabled: !hasProfile || productsCount === 0,
      accent: hasProfile && productsCount > 0 && !hasSubmission,
    },
    {
      key: "pricing",
      title: "Price your goods",
      sub: "ingredients + time + margin",
      hand: "bonus step",
      icon: DollarSign,
      active: false,
      action: onOpenPricing,
      accent: true,
    },
    {
      key: "products",
      title: `${productsCount || 0} recipe${productsCount === 1 ? "" : "s"}`,
      sub: productsCount ? "captured in chat" : "tell your mentor",
      hand: productsCount ? "gathered" : "waiting",
      icon: ClipboardList,
      active: productsCount > 0,
    },
    {
      key: "profile",
      title: hasProfile ? "Operator profile" : "Operator info",
      sub: hasProfile ? state.business.legal_name ?? "" : "captured through chat",
      hand: hasProfile ? "on file" : "waiting",
      icon: FileText,
      active: hasProfile,
    },
    {
      key: "bookkeeping",
      title: "Bookkeeping",
      sub: "track income & expenses",
      hand: "post-registration",
      icon: BookOpen,
      active: false,
      action: onOpenBookkeeping,
    },
  ];

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="font-display text-lg text-ink">Your next steps</p>
        <p className="font-hand text-lg text-ink/50">tap a card to work on it</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((s) => {
          const Icon = s.icon;
          const clickable = !!s.action && !s.disabled;
          return (
            <button
              key={s.key}
              onClick={clickable ? s.action : undefined}
              disabled={!clickable}
              className={
                "group relative flex min-h-[168px] flex-col items-start gap-3 overflow-hidden rounded-3xl p-6 text-left ring-1 transition-all " +
                (s.accent
                  ? "bg-paper ring-cta-red/40 shadow-[0_2px_0_0_rgba(168,50,71,0.15)] "
                  : "bg-paper ring-cta-red/15 ") +
                (clickable ? "hover:-translate-y-0.5 hover:shadow-lg cursor-pointer " : "cursor-default ") +
                (s.disabled ? "opacity-40 " : "")
              }
            >
              {s.accent && (
                <span className="pointer-events-none absolute -top-3 left-8 h-5 w-16 rotate-[-4deg] bg-butter/80 ring-1 ring-black/5" />
              )}
              <div className="flex w-full items-center justify-between">
                <span
                  className={
                    "flex size-12 items-center justify-center rounded-2xl ring-1 ring-cta-red/10 " +
                    (s.active || s.accent ? "bg-cta-red/10 text-cta-red" : "bg-surface text-ink/40")
                  }
                >
                  <Icon className="size-5" />
                </span>
                <span className="font-hand text-base text-cta-red/70">{s.hand}</span>
              </div>
              <span className="font-display text-2xl leading-tight text-ink">
                {s.title}
              </span>
              <span className="text-sm text-ink/60 line-clamp-2">
                {s.sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
