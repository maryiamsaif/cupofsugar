import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from "pdf-lib";
import type { CupofsugarState, SelfCertification } from "./state";
import { isSelfCertificationComplete } from "./state";

export async function renderApplicationPdf(
  state: CupofsugarState,
  signature: string,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]); // US Letter
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const red = rgb(0.933, 0.207, 0.18);
  const ink = rgb(0.08, 0.08, 0.08);
  const muted = rgb(0.4, 0.4, 0.4);

  let y = 750;
  page.drawRectangle({ x: 40, y: y - 4, width: 20, height: 20, color: red });
  page.drawText("C", { x: 45, y: y, size: 14, font: bold, color: rgb(1, 1, 1) });
  page.drawText("City of Chicago", { x: 68, y: y + 6, size: 10, font, color: muted });
  page.drawText("Cottage Food Operation Registration", {
    x: 68,
    y: y - 6,
    size: 13,
    font: bold,
    color: ink,
  });

  y -= 40;
  page.drawLine({
    start: { x: 40, y },
    end: { x: 572, y },
    thickness: 1,
    color: red,
  });
  y -= 24;

  const section = (title: string) => {
    page.drawText(title.toUpperCase(), { x: 40, y, size: 9, font: bold, color: red });
    y -= 14;
    page.drawLine({ start: { x: 40, y: y + 4 }, end: { x: 572, y: y + 4 }, thickness: 0.5, color: muted });
  };
  const field = (label: string, value: string) => {
    page.drawText(label, { x: 40, y, size: 8, font, color: muted });
    page.drawText(value || "—", { x: 40, y: y - 12, size: 10, font: bold, color: ink });
    y -= 30;
  };

  section("Operator Information");
  field("Legal Name of Operator", state.business.legal_name ?? "");
  field("Home Address (must be in Chicago)", state.business.address ?? "");
  field("Phone", state.business.phone ?? "");
  field("Email", state.business.email ?? "");

  y -= 6;
  section("Sales Channels");
  field(
    "Where products will be sold",
    (state.business.channels ?? []).join(", ") || state.onboarding?.channels || "",
  );

  y -= 6;
  section("Products");
  if (state.products.length === 0) {
    page.drawText("No products recorded.", { x: 40, y, size: 10, font: italic, color: muted });
    y -= 20;
  } else {
    for (const p of state.products) {
      page.drawText(p.name, { x: 40, y, size: 11, font: bold, color: ink });
      page.drawText(`(${p.category})`, { x: 40 + p.name.length * 6.5, y, size: 9, font: italic, color: muted });
      y -= 14;
      const ing = "Ingredients: " + (p.ingredients.join(", ") || "—");
      page.drawText(ing.slice(0, 90), { x: 52, y, size: 9, font, color: ink });
      y -= 12;
      const al = "Allergens: " + (p.allergens.join(", ") || "none");
      page.drawText(al, { x: 52, y, size: 9, font, color: ink });
      y -= 18;
    }
  }

  y -= 10;
  section("Certification");
  field(
    "Certified Food Protection Manager (CFPM)",
    state.certificate ? `On file — ${state.certificate.filename}` : "Not on file",
  );

  y -= 20;
  section("Signature");
  page.drawText("I certify the information above is true and correct.", {
    x: 40,
    y,
    size: 9,
    font: italic,
    color: muted,
  });
  y -= 30;
  page.drawText(signature, { x: 40, y, size: 20, font: italic, color: ink });
  page.drawLine({ start: { x: 40, y: y - 4 }, end: { x: 320, y: y - 4 }, thickness: 0.5, color: ink });
  page.drawText("Signature", { x: 40, y: y - 16, size: 8, font, color: muted });
  page.drawText(new Date().toLocaleDateString(), { x: 360, y, size: 11, font, color: ink });
  page.drawLine({ start: { x: 360, y: y - 4 }, end: { x: 500, y: y - 4 }, thickness: 0.5, color: ink });
  page.drawText("Date", { x: 360, y: y - 16, size: 8, font, color: muted });

  page.drawText("Submitted via Cupofsugar to food@cityofchicago.org", {
    x: 40,
    y: 40,
    size: 8,
    font: italic,
    color: muted,
  });

  return await pdf.save();
}

export function bytesToDataUrl(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)),
    );
  }
  return "data:application/pdf;base64," + btoa(binary);
}

type ChecklistItem = { key: keyof SelfCertification; label: string };

const FACILITY_ITEMS: ChecklistItem[] = [
  { key: "facility_1_private_dwelling", label: "The CFO shall be located in a private dwelling where the operator resides or a farm property." },
  { key: "facility_2_private_kitchen", label: "CFO food preparation takes place in the private kitchen within that home or an equipped farm kitchen." },
  { key: "facility_3_no_sleeping_quarters", label: "Sleeping quarters are excluded from areas used for CFO food preparation or storage." },
  { key: "facility_4_toilet_room_sink", label: "The kitchen sink is not used for handwashing after toilet use; a sink exists in the toilet room." },
];
const EQUIPMENT_ITEMS: ChecklistItem[] = [
  { key: "equipment_5_clean_utensils", label: "Kitchen equipment and utensils are clean and in good repair before use and during storage." },
  { key: "equipment_6_wash_rinse_sanitize", label: "All food-contact surfaces, equipment, and utensils are washed, rinsed, and sanitized before each use." },
  { key: "equipment_7_pest_free", label: "All food preparation and storage areas are maintained free of rodents and insects." },
  { key: "equipment_8_chemicals_stored", label: "Chemicals and pesticides are used per label instructions and stored away from food and packaging." },
];
const PREP_ITEMS: ChecklistItem[] = [
  { key: "prep_9_frequent_handwashing", label: "Proper handwashing is carried out often (after toilet, sneezing, changing tasks, before gloves, etc.)." },
  { key: "prep_10_clean_hands_arms", label: "Employees clean hands and exposed arms before food processing and after any unsanitary activity." },
  { key: "prep_11_soap_towels_warm_water", label: "Liquid soap, paper towels, and warm water are available at the handwashing sink at all times." },
  { key: "prep_12_potable_water", label: "Potable water is used for hand washing, ware-washing, and as an ingredient." },
  { key: "prep_13_no_bare_hand_contact", label: "No bare hand contact with ready-to-eat foods (gloves, papers, tongs, or utensils used)." },
  { key: "prep_14a_no_pets", label: "Pets are not allowed during preparation, packaging, or handling of cottage food products." },
  { key: "prep_14b_no_smoking", label: "Smoking, vaping, and tobacco use are not allowed during CFO activities." },
  { key: "prep_14c_no_eating_drinking", label: "Eating, drinking, and chewing gum are not allowed during CFO activities." },
  { key: "prep_15_separate_domestic", label: "Domestic activities (family meals, laundry, guests) are separated from cottage food operations." },
  { key: "prep_16_tasting_utensils", label: "Utensils used for tasting are not used more than once before being washed." },
  { key: "prep_17_no_ill_workers", label: "Any person with a contagious illness, vomiting, jaundice, or pus lesion refrains from CFO work." },
  { key: "prep_18_cuts_covered", label: "Cuts on wrists or hands are covered with a bandage and a disposable glove during CFO work." },
  { key: "prep_19_hair_restrained", label: "Hair is restrained (tied back, hat, hairnet, or scarf) and clothes are free of soil and debris." },
];
const TRANSPORT_ITEMS: ChecklistItem[] = [
  { key: "transport_20_clean_vehicle", label: "Transport vehicle is clean and products are in containers that protect from contaminants." },
  { key: "transport_21_clean_booth", label: "Market/event booth is clean and clutter-free; pre-packaged products are protected from contamination." },
];
const CHILLED_ITEMS: ChecklistItem[] = [
  { key: "chilled_a_refrigerator_41f", label: "Chilled foods stored in a home refrigerator at 41°F or below, temperature checked frequently." },
  { key: "chilled_b_freezer_32f", label: "Frozen foods stored in a freezer capable of maintaining 32°F or below." },
  { key: "chilled_c_temp_maintained", label: "During purchase, transport, and sale, chilled/frozen foods held at required temps; thermometer used." },
];

export async function renderChecklistPdf(
  state: CupofsugarState,
  signature: string,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const red = rgb(0.933, 0.207, 0.18);
  const ink = rgb(0.08, 0.08, 0.08);
  const muted = rgb(0.4, 0.4, 0.4);

  const sc = state.selfCertification;
  const certified = isSelfCertificationComplete(sc);

  const MARGIN_L = 40;
  const MARGIN_R = 572;
  const PAGE_W = 612;
  const PAGE_H = 792;
  const LINE_W = MARGIN_R - MARGIN_L - 24; // room for checkbox

  let page: PDFPage = pdf.addPage([PAGE_W, PAGE_H]);
  let y = 750;

  const wrap = (text: string, size: number, f: PDFFont, maxWidth: number): string[] => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const trial = cur ? cur + " " + w : w;
      if (f.widthOfTextAtSize(trial, size) <= maxWidth) cur = trial;
      else {
        if (cur) lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  };

  const ensure = (need: number) => {
    if (y - need < 60) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = 750;
    }
  };

  const header = () => {
    page.drawRectangle({ x: MARGIN_L, y: y - 4, width: 20, height: 20, color: red });
    page.drawText("C", { x: MARGIN_L + 5, y, size: 14, font: bold, color: rgb(1, 1, 1) });
    page.drawText("City of Chicago · CDPH", { x: MARGIN_L + 28, y: y + 6, size: 10, font, color: muted });
    page.drawText("Cottage Food Home Self-Certification Checklist", {
      x: MARGIN_L + 28,
      y: y - 6,
      size: 13,
      font: bold,
      color: ink,
    });
    y -= 40;
    page.drawLine({ start: { x: MARGIN_L, y }, end: { x: MARGIN_R, y }, thickness: 1, color: red });
    y -= 20;
  };
  header();

  const section = (title: string) => {
    ensure(30);
    page.drawText(title.toUpperCase(), { x: MARGIN_L, y, size: 9, font: bold, color: red });
    y -= 12;
    page.drawLine({ start: { x: MARGIN_L, y: y + 4 }, end: { x: MARGIN_R, y: y + 4 }, thickness: 0.5, color: muted });
    y -= 8;
  };

  const drawItem = (item: ChecklistItem) => {
    const checked = Boolean(sc[item.key]);
    const lines = wrap(item.label, 9, font, LINE_W);
    const blockH = Math.max(14, lines.length * 12) + 6;
    ensure(blockH);
    // checkbox
    page.drawRectangle({
      x: MARGIN_L,
      y: y - 10,
      width: 10,
      height: 10,
      borderColor: ink,
      borderWidth: 0.8,
      color: checked ? red : rgb(1, 1, 1),
    });
    if (checked) {
      // small checkmark
      page.drawText("x", {
        x: MARGIN_L + 2.2,
        y: y - 9,
        size: 9,
        font: bold,
        color: rgb(1, 1, 1),
      });
    }
    let ly = y;
    for (const line of lines) {
      page.drawText(line, { x: MARGIN_L + 18, y: ly - 8, size: 9, font, color: ink });
      ly -= 12;
    }
    y = ly - 4;
  };

  section("Facility Requirements");
  FACILITY_ITEMS.forEach(drawItem);
  section("Equipment Sanitation Requirements");
  EQUIPMENT_ITEMS.forEach(drawItem);
  section("Food Preparation Requirements");
  PREP_ITEMS.forEach(drawItem);
  section("Transportation");
  TRANSPORT_ITEMS.forEach(drawItem);

  section("Chilled and Frozen Foods");
  ensure(24);
  page.drawText(
    sc.handles_chilled_or_frozen
      ? "Operator handles chilled or frozen ingredients — items below apply:"
      : "Operator does not handle chilled or frozen ingredients — section not applicable.",
    { x: MARGIN_L, y, size: 9, font: italic, color: muted },
  );
  y -= 16;
  if (sc.handles_chilled_or_frozen) {
    CHILLED_ITEMS.forEach(drawItem);
  }

  section("Signature");
  ensure(80);
  page.drawText(
    certified
      ? "I certify that the above information is true and accurate."
      : "Certification incomplete — not all applicable items were checked.",
    { x: MARGIN_L, y, size: 9, font: italic, color: certified ? ink : red },
  );
  y -= 26;
  page.drawText(signature || "—", { x: MARGIN_L, y, size: 20, font: italic, color: ink });
  page.drawLine({ start: { x: MARGIN_L, y: y - 4 }, end: { x: 320, y: y - 4 }, thickness: 0.5, color: ink });
  page.drawText("Signature", { x: MARGIN_L, y: y - 16, size: 8, font, color: muted });

  const dateStr = sc.certified_at
    ? new Date(sc.certified_at).toLocaleDateString()
    : new Date().toLocaleDateString();
  page.drawText(dateStr, { x: 360, y, size: 11, font, color: ink });
  page.drawLine({ start: { x: 360, y: y - 4 }, end: { x: 500, y: y - 4 }, thickness: 0.5, color: ink });
  page.drawText("Date", { x: 360, y: y - 16, size: 8, font, color: muted });

  y -= 40;
  ensure(30);
  page.drawText("Operator: " + (state.business.legal_name ?? "—"), { x: MARGIN_L, y, size: 9, font: bold, color: ink });
  y -= 12;
  page.drawText("CFO name: " + (state.business.legal_name ?? "—"), { x: MARGIN_L, y, size: 9, font, color: ink });
  y -= 12;
  page.drawText("Address: " + (state.business.address ?? "—"), { x: MARGIN_L, y, size: 9, font, color: ink });

  const pages = pdf.getPages();
  pages.forEach((p) => {
    p.drawText("CDPH Food Protection Program · 2133 W Lexington Street, Chicago, IL 60612 · (312) 746-8030", {
      x: MARGIN_L,
      y: 40,
      size: 8,
      font: italic,
      color: muted,
    });
  });

  return await pdf.save();
}
