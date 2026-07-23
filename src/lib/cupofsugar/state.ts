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

export type SelfCertification = {
  // Facility Requirements (1-4)
  facility_1_private_dwelling: boolean;
  facility_2_private_kitchen: boolean;
  facility_3_no_sleeping_quarters: boolean;
  facility_4_toilet_room_sink: boolean;
  // Equipment Sanitation (5-8)
  equipment_5_clean_utensils: boolean;
  equipment_6_wash_rinse_sanitize: boolean;
  equipment_7_pest_free: boolean;
  equipment_8_chemicals_stored: boolean;
  // Food Prep / Hygiene (9-19)
  prep_9_frequent_handwashing: boolean;
  prep_10_clean_hands_arms: boolean;
  prep_11_soap_towels_warm_water: boolean;
  prep_12_potable_water: boolean;
  prep_13_no_bare_hand_contact: boolean;
  prep_14a_no_pets: boolean;
  prep_14b_no_smoking: boolean;
  prep_14c_no_eating_drinking: boolean;
  prep_15_separate_domestic: boolean;
  prep_16_tasting_utensils: boolean;
  prep_17_no_ill_workers: boolean;
  prep_18_cuts_covered: boolean;
  prep_19_hair_restrained: boolean;
  // Transportation (20-21)
  transport_20_clean_vehicle: boolean;
  transport_21_clean_booth: boolean;
  // Chilled & Frozen (22 + a,b,c)
  handles_chilled_or_frozen: boolean;
  chilled_a_refrigerator_41f: boolean;
  chilled_b_freezer_32f: boolean;
  chilled_c_temp_maintained: boolean;
  // Signature attestation
  attest_true_and_accurate: boolean;
  certified_at: string | null;
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
  selfCertification: SelfCertification;
  submission: Submission | null;
  current_stage: StageId;
  stages_completed: StageId[];
  chatResetKey: number;
};

export const DEFAULT_SELF_CERTIFICATION: SelfCertification = {
  facility_1_private_dwelling: false,
  facility_2_private_kitchen: false,
  facility_3_no_sleeping_quarters: false,
  facility_4_toilet_room_sink: false,
  equipment_5_clean_utensils: false,
  equipment_6_wash_rinse_sanitize: false,
  equipment_7_pest_free: false,
  equipment_8_chemicals_stored: false,
  prep_9_frequent_handwashing: false,
  prep_10_clean_hands_arms: false,
  prep_11_soap_towels_warm_water: false,
  prep_12_potable_water: false,
  prep_13_no_bare_hand_contact: false,
  prep_14a_no_pets: false,
  prep_14b_no_smoking: false,
  prep_14c_no_eating_drinking: false,
  prep_15_separate_domestic: false,
  prep_16_tasting_utensils: false,
  prep_17_no_ill_workers: false,
  prep_18_cuts_covered: false,
  prep_19_hair_restrained: false,
  transport_20_clean_vehicle: false,
  transport_21_clean_booth: false,
  handles_chilled_or_frozen: false,
  chilled_a_refrigerator_41f: false,
  chilled_b_freezer_32f: false,
  chilled_c_temp_maintained: false,
  attest_true_and_accurate: false,
  certified_at: null,
};

// Item keys that must be true, independent of chilled/frozen gate.
const REQUIRED_ALWAYS: (keyof SelfCertification)[] = [
  "facility_1_private_dwelling",
  "facility_2_private_kitchen",
  "facility_3_no_sleeping_quarters",
  "facility_4_toilet_room_sink",
  "equipment_5_clean_utensils",
  "equipment_6_wash_rinse_sanitize",
  "equipment_7_pest_free",
  "equipment_8_chemicals_stored",
  "prep_9_frequent_handwashing",
  "prep_10_clean_hands_arms",
  "prep_11_soap_towels_warm_water",
  "prep_12_potable_water",
  "prep_13_no_bare_hand_contact",
  "prep_14a_no_pets",
  "prep_14b_no_smoking",
  "prep_14c_no_eating_drinking",
  "prep_15_separate_domestic",
  "prep_16_tasting_utensils",
  "prep_17_no_ill_workers",
  "prep_18_cuts_covered",
  "prep_19_hair_restrained",
  "transport_20_clean_vehicle",
  "transport_21_clean_booth",
  "attest_true_and_accurate",
];

export function isSelfCertificationComplete(sc: SelfCertification): boolean {
  for (const k of REQUIRED_ALWAYS) if (!sc[k]) return false;
  if (sc.handles_chilled_or_frozen) {
    if (!sc.chilled_a_refrigerator_41f) return false;
    if (!sc.chilled_b_freezer_32f) return false;
    if (!sc.chilled_c_temp_maintained) return false;
  }
  return true;
}



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
    setState((prev) => {
      const next: CupofsugarState = { ...DEFAULT_STATE, chatResetKey: (prev.chatResetKey ?? 0) + 1 };
      write(next);
      return next;
    });
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
