import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { CupofsugarState } from "./state";

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
