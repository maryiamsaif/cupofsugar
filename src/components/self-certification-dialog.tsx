import { useState } from "react";
import { X, ClipboardCheck } from "lucide-react";
import {
  DEFAULT_SELF_CERTIFICATION,
  isSelfCertificationComplete,
  type SelfCertification,
} from "@/lib/cupofsugar/state";

type ItemKey = keyof SelfCertification;

type Item = { key: ItemKey; label: string };

const FACILITY: Item[] = [
  {
    key: "facility_1_private_dwelling",
    label:
      "The CFO shall be located in a private dwelling where the CFO operator currently resides or a farm property.",
  },
  {
    key: "facility_2_private_kitchen",
    label:
      "CFO food preparation will take place in the private kitchen within that home or another appropriately designed and equipped kitchen on a farm property under the control of the cottage food producer.",
  },
  {
    key: "facility_3_no_sleeping_quarters",
    label:
      "Sleeping quarters are excluded from areas used for CFO food preparation or storage.",
  },
  {
    key: "facility_4_toilet_room_sink",
    label:
      "The kitchen sink is not used for handwashing after toilet use; therefore, there must also be a sink in the toilet room.",
  },
];

const EQUIPMENT: Item[] = [
  {
    key: "equipment_5_clean_utensils",
    label:
      "Kitchen equipment and utensils used to produce cottage food products are clean and maintained in a good state of repair before use and during storage.",
  },
  {
    key: "equipment_6_wash_rinse_sanitize",
    label:
      "All food contact surfaces, equipment, and utensils used for the preparation, packaging, or handling of any cottage food products are washed, rinsed, and sanitized before each use.",
  },
  {
    key: "equipment_7_pest_free",
    label:
      "All food preparation and food and equipment storage areas are maintained free of rodents and insects.",
  },
  {
    key: "equipment_8_chemicals_stored",
    label:
      "Chemicals, including pesticides, are used according to the label instructions, and stored in a manner to prevent contamination of food contact surfaces, ingredients and finished products, single use articles, and packaging materials.",
  },
];

const PREP: Item[] = [
  {
    key: "prep_9_frequent_handwashing",
    label:
      "Proper handwashing is carried out often—after touching bare body parts, such as the face or hair; after using the toilet; after touching animals; after coughing or sneezing, after eating, drinking, or using tobacco; after handling soiled equipment; when changing tasks; before donning gloves; and any other activity that could contaminate the hands.",
  },
  {
    key: "prep_10_clean_hands_arms",
    label:
      "Employees involved with the preparation and packaging of cottage food products will clean their hands and exposed portions of their arms before starting food processing and after any activity that renders the hands unsanitary.",
  },
  {
    key: "prep_11_soap_towels_warm_water",
    label:
      "Liquid soap, paper towels, and water warm to the touch are used for handwashing and are available at the handwashing sink at all times.",
  },
  {
    key: "prep_12_potable_water",
    label:
      "Potable water is used for hand washing, ware-washing, and as an ingredient.",
  },
  {
    key: "prep_13_no_bare_hand_contact",
    label:
      "All persons involved in the preparation, packaging, or handling of food will not have bare hand contact with ready-to-eat foods through the use of single-service gloves, bakery papers, tongs, or other utensils.",
  },
  {
    key: "prep_14a_no_pets",
    label:
      "During the preparation, packaging or handling of cottage food products: Pets are not allowed.",
  },
  {
    key: "prep_14b_no_smoking",
    label:
      "During the preparation, packaging or handling of cottage food products: Smoking, vaping, and tobacco use are not allowed.",
  },
  {
    key: "prep_14c_no_eating_drinking",
    label:
      "During the preparation, packaging or handling of cottage food products: Eating / drinking / chewing gum are not allowed.",
  },
  {
    key: "prep_15_separate_domestic",
    label:
      "I will make every effort to separate domestic activities, such as family meal preparation, clothes washing, or ironing, or guest entertainment, from cottage food operations, such as preparation, packaging, or handling of cottage food products.",
  },
  {
    key: "prep_16_tasting_utensils",
    label:
      "Utensils used for tasting are not used more than once before being washed.",
  },
  {
    key: "prep_17_no_ill_workers",
    label:
      "Any person with a contagious illness, diarrhea, temperature with sore throat, vomiting, jaundice, or a lesion containing pus on hands or wrists shall refrain from working in the cottage food operation.",
  },
  {
    key: "prep_18_cuts_covered",
    label:
      "Cuts on wrists or hands are covered with a bandage and a disposable glove during food preparation and packaging.",
  },
  {
    key: "prep_19_hair_restrained",
    label:
      "Hair is restrained during food preparation and packaging; tied back or up; covered with a hat, hairnet, or scarf, and clothes are free from soil and debris.",
  },
];

const TRANSPORT: Item[] = [
  {
    key: "transport_20_clean_vehicle",
    label:
      "When transporting your cottage foods, the vehicle is clean, and your food products are transported in containers that keep dirt, dust, bugs, or other contaminants away from the food products.",
  },
  {
    key: "transport_21_clean_booth",
    label:
      "When selling your cottage foods at a market or public event, your booth is clean and clutter-free, and your pre-packaged food products are protected from contamination.",
  },
];

const CHILLED: Item[] = [
  {
    key: "chilled_a_refrigerator_41f",
    label:
      "Chilled foods are stored in a refrigerator in the home kitchen at 41 degrees F or below and are checked frequently to ensure maintenance of this temperature.",
  },
  {
    key: "chilled_b_freezer_32f",
    label:
      "Frozen foods are stored in a freezer capable of maintaining a freezing point at 32 degrees F.",
  },
  {
    key: "chilled_c_temp_maintained",
    label:
      "During purchase, transport, and sale, chilled foods and ingredients are kept at 41 degrees F or below, and frozen foods are kept solidly frozen at 32 degrees F or below via mechanical refrigeration, a cooler with ice, or other non-mechanical refrigeration. A thermometer is used and checked periodically after transport and during sales to ensure that the temperature is being maintained.",
  },
];

export function SelfCertificationDialog({
  initial,
  onClose,
  onCertified,
}: {
  initial: SelfCertification;
  onClose: () => void;
  onCertified: (sc: SelfCertification) => void;
}) {
  const [sc, setSc] = useState<SelfCertification>({
    ...DEFAULT_SELF_CERTIFICATION,
    ...initial,
  });

  const toggle = (key: ItemKey) =>
    setSc((prev) => ({ ...prev, [key]: !prev[key] } as SelfCertification));

  const complete = isSelfCertificationComplete(sc);

  const save = () => {
    const next: SelfCertification = {
      ...sc,
      certified_at: complete
        ? sc.certified_at ?? new Date().toISOString()
        : null,
    };
    onCertified(next);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-sm p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
        >
          <X className="size-4" />
        </button>

        <div className="px-8 pt-8 pb-4">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-cta-red">
            Packet · Home Self-Certification
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-neutral-950">
            CDPH Cottage Food Home Self-Certification Checklist
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Certify that the following statements are true and accurate. Every
            applicable box must be checked before your packet can be sent.
          </p>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-8 pb-6">
          <Section title="Facility Requirements" items={FACILITY} sc={sc} toggle={toggle} />
          <Section title="Equipment Sanitation Requirements" items={EQUIPMENT} sc={sc} toggle={toggle} />
          <Section title="Food Preparation Requirements" items={PREP} sc={sc} toggle={toggle} />
          <Section title="Transportation" items={TRANSPORT} sc={sc} toggle={toggle} />

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-cta-red">
              Chilled and Frozen Foods
            </h3>
            <label className="mt-3 flex items-start gap-3 rounded-2xl bg-neutral-50 p-4 ring-1 ring-black/5">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-cta-red"
                checked={sc.handles_chilled_or_frozen}
                onChange={() => toggle("handles_chilled_or_frozen")}
              />
              <span className="text-sm text-neutral-800">
                Do you prepare any foods or use any ingredients that require
                refrigeration or freezing?
              </span>
            </label>
            {sc.handles_chilled_or_frozen && (
              <div className="mt-3 space-y-2">
                {CHILLED.map((it) => (
                  <CheckRow key={it.key} item={it} sc={sc} toggle={toggle} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-cta-red">
              Signature
            </h3>
            <div className="mt-3">
              <CheckRow
                item={{
                  key: "attest_true_and_accurate",
                  label:
                    "I certify that the above information is true and accurate.",
                }}
                sc={sc}
                toggle={toggle}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-neutral-950/5 bg-neutral-50/60 px-8 py-5">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <ClipboardCheck
              className={
                "size-4 " + (complete ? "text-cta-red" : "text-neutral-400")
              }
            />
            {complete
              ? "All applicable items certified."
              : "Check each applicable item to certify."}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-700 ring-1 ring-black/10"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="rounded-full bg-cta-red px-5 py-2 text-xs font-semibold text-white active:scale-95 disabled:opacity-40"
              disabled={!complete}
            >
              Save certification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  sc,
  toggle,
}: {
  title: string;
  items: Item[];
  sc: SelfCertification;
  toggle: (k: ItemKey) => void;
}) {
  return (
    <div>
      <h3 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-cta-red">
        {title}
      </h3>
      <div className="mt-3 space-y-2">
        {items.map((it) => (
          <CheckRow key={it.key} item={it} sc={sc} toggle={toggle} />
        ))}
      </div>
    </div>
  );
}

function CheckRow({
  item,
  sc,
  toggle,
}: {
  item: Item;
  sc: SelfCertification;
  toggle: (k: ItemKey) => void;
}) {
  const checked = Boolean(sc[item.key]);
  return (
    <label
      className={
        "flex cursor-pointer items-start gap-3 rounded-2xl p-4 text-sm ring-1 transition-colors " +
        (checked
          ? "bg-cta-red/5 ring-cta-red/30"
          : "bg-white ring-black/10 hover:bg-neutral-50")
      }
    >
      <input
        type="checkbox"
        className="mt-1 size-4 shrink-0 accent-cta-red"
        checked={checked}
        onChange={() => toggle(item.key)}
      />
      <span className="text-neutral-800">{item.label}</span>
    </label>
  );
}
