import { useCallback, useEffect, useState } from "react";
import type { StageId } from "./stages";

export type Product = {
  name: string;
  category: "allowed" | "prohibited" | "edge";
  ingredients: string[];
  allergens: string[];
  needs_safety_plan?: boolean;
};

export type BusinessProfile = {
  legal_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  channels?: string[];
};

export type CertificateFile = {
  filename: string;
  data_url: string;
  provider?: string;
  uploaded_at: string;
};

export type Submission = {
  status: "signed" | "sent";
  filled_pdf_data_url: string;
  signature: string;
  signed_at: string;
};

export type CupofsugarState = {
  onboarded: boolean;
  onboarding?: {
    products?: string;
    channels?: string;
    when?: string;
    email?: string;
    goal?: string;
  };
  business: BusinessProfile;
  products: Product[];
  certificate: CertificateFile | null;
  submission: Submission | null;
  current_stage: StageId;
  stages_completed: StageId[];
  chatResetKey: number;
};



const KEY = "cupofsugar_state_v1";

export const DEFAULT_STATE: CupofsugarState = {
  onboarded: false,
  business: {},
  products: [],
  certificate: null,
  submission: null,
  current_stage: 1,
  stages_completed: [],
  chatResetKey: 0,
};


function read(): CupofsugarState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function write(state: CupofsugarState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function useCupofsugarState() {
  const [state, setState] = useState<CupofsugarState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read());
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<CupofsugarState> | ((s: CupofsugarState) => CupofsugarState)) => {
    setState((prev) => {
      const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      write(next);
      return next;
    });
  }, []);

  const completeStage = useCallback((stage: StageId) => {
    setState((prev) => {
      const stages_completed = Array.from(new Set([...prev.stages_completed, stage])) as StageId[];
      const current_stage = (Math.min(4, Math.max(prev.current_stage, stage + 1)) as StageId);
      const next = { ...prev, stages_completed, current_stage };
      write(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    write(DEFAULT_STATE);
    setState(DEFAULT_STATE);
  }, []);

  return { state, hydrated, update, completeStage, reset };
}

// Helpers to apply tool calls returned from the AI
export function applyToolCall(
  state: CupofsugarState,
  toolName: string,
  args: Record<string, unknown>,
): CupofsugarState {
  switch (toolName) {
    case "record_product": {
      const p: Product = {
        name: String(args.name ?? ""),
        category: (args.category as Product["category"]) ?? "allowed",
        ingredients: Array.isArray(args.ingredients) ? (args.ingredients as string[]) : [],
        allergens: Array.isArray(args.allergens) ? (args.allergens as string[]) : [],
        needs_safety_plan: Boolean(args.needs_safety_plan),
      };
      const products = [...state.products.filter((x) => x.name.toLowerCase() !== p.name.toLowerCase()), p];
      return { ...state, products };
    }
    case "set_business_profile": {
      return {
        ...state,
        business: { ...state.business, ...(args as BusinessProfile) },
      };
    }
    case "mark_stage_complete": {
      const stage = Number(args.stage) as StageId;
      if (!stage || stage < 1 || stage > 4) return state;
      const stages_completed = Array.from(new Set([...state.stages_completed, stage])) as StageId[];
      const current_stage = Math.min(4, Math.max(state.current_stage, stage + 1)) as StageId;
      return { ...state, stages_completed, current_stage };
    }
    case "flag_needs_safety_plan": {
      const name = String(args.product ?? "").toLowerCase();
      const products = state.products.map((p) =>
        p.name.toLowerCase() === name ? { ...p, needs_safety_plan: true } : p,
      );
      return { ...state, products };
    }
    default:
      return state;
  }
}
