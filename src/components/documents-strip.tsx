import { ShieldCheck, FileText, Plus, ClipboardList, BookOpen } from "lucide-react";
import type { CupofsugarState } from "@/lib/cupofsugar/state";

export function DocumentsStrip({
  state,
  onOpenCertificate,
  onOpenSubmission,
  onOpenBookkeeping,
}: {
  state: CupofsugarState;
  onOpenCertificate: () => void;
  onOpenSubmission: () => void;
  onOpenBookkeeping: () => void;
}) {
  const hasCert = !!state.certificate;
  const hasSubmission = !!state.submission;
  const productsCount = state.products.length;
  const hasProfile = !!state.business.legal_name;

  type Slot = {
    key: string;
    title: string;
    sub: string;
    icon: typeof ShieldCheck;
    active: boolean;
    action?: () => void;
    disabled?: boolean;
  };
  const slots: Slot[] = [
    {
      key: "cert",
      title: hasCert ? "CFPM Certificate" : "Add CFPM cert",
      sub: hasCert
        ? `${state.certificate?.filename.slice(0, 22)}...`
        : "needed for step 2",
      icon: ShieldCheck,
      active: hasCert,
      action: onOpenCertificate,
    },
    {
      key: "products",
      title: `${productsCount || 0} product${productsCount === 1 ? "" : "s"}`,
      sub: productsCount ? "recipes noted" : "tell the mentor",
      icon: ClipboardList,
      active: productsCount > 0,
    },
    {
      key: "profile",
      title: hasProfile ? "Operator profile" : "Operator info",
      sub: hasProfile ? state.business.legal_name ?? "" : "chat to fill in",
      icon: FileText,
      active: hasProfile,
    },
    {
      key: "submit",
      title: hasSubmission ? "Application sent" : "Review & sign",
      sub: hasSubmission ? "PDF saved locally" : "available at step 4",
      icon: hasSubmission ? FileText : Plus,
      active: hasSubmission,
      action: onOpenSubmission,
      disabled: !hasProfile || productsCount === 0,
    },
    {
      key: "bookkeeping",
      title: "Bookkeeping",
      sub: "track income & expenses",
      icon: BookOpen,
      active: false,
      action: onOpenBookkeeping,
    },
  ];


  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {slots.map((s) => {
        const Icon = s.icon;
        const clickable = !!s.action && !s.disabled;
        return (
          <button
            key={s.key}
            onClick={clickable ? s.action : undefined}
            disabled={!clickable}
            className={
              "flex flex-col items-start gap-2 rounded-2xl bg-white p-4 text-left ring-1 ring-black/5 transition-all " +
              (clickable ? "hover:-translate-y-0.5 hover:shadow-md cursor-pointer " : "cursor-default ") +
              (s.disabled ? "opacity-40 " : "")
            }
          >
            <span
              className={
                "flex size-9 items-center justify-center rounded-xl ring-1 ring-black/5 " +
                (s.active ? "bg-cta-red/10 text-cta-red" : "bg-neutral-50 text-neutral-400")
              }
            >
              <Icon className="size-4" />
            </span>
            <span className="text-xs font-semibold text-neutral-900">
              {s.title}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 truncate w-full">
              {s.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}
