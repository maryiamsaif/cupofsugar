
## What we're building

Cupofsugar is a single-user local demo of a conversational, gamified guide for Chicago home bakers. A warm mentor-baker AI walks them through 4 stages of the CDPH cottage food process. Progress is shown as a CTA-inspired L-line journey. State lives in `localStorage` — no accounts, no backend user data. Only server-side surface is the AI chat endpoint.

## Scope (v1)

**Built stages** — Confirm Eligibility, Get Certified, Complete Application, Submit to City.
**Locked stages** — Set Up Taxes, Get Insured, Ready to Sell (visible on the line as "Coming soon").
**Deferred** — real auth, real email to CDPH, tax/insurance/label/pricing features.

## Design direction

Selected prototype: **Transit poster modern** (diagonal rail), tuned to the CTA **Red Line** reference image the user shared — CTA red (`#ee352e`) as the primary rail color instead of blue, hollow-ring circles for transfer/active stations, solid dots for completed, muted outlines for locked. Barlow Condensed for display, Public Sans for body. Off-white surface. Warm, reassuring, low-density.

## Screens (all one route `/`)

Single-page app view with three regions:

```text
+------------------------------------------------------------------+
|  header: Cupofsugar mark + "Chicago CDPH Guide" pill             |
+------------------------------------------------------------------+
|  [ Journey rail (5 cols)   |  Working surface (7 cols)         ] |
|  - Title + intro           |  - Progress card (stage % + next)  |
|  - Diagonal red L line     |  - Mentor chat (assistant + input) |
|  - 7 station nodes         |  - Documents strip (4 slots)       |
|    (4 active + 3 locked)   |                                    |
+------------------------------------------------------------------+
```

Modals/overlays layered over the working surface for stage-specific screens:
- **Onboarding** (first visit): "What do you want to make? Where do you want to sell?" — 2–3 friendly picker questions, stored to localStorage.
- **CFPM directory** (Stage 2): a small card list (Responsible Training as default, Trust20 as premium peace-of-mind) with links + a "Mark certificate uploaded" button that captures a file locally as a data URL.
- **Application review** (Stage 4): renders the filled PDF preview + typed-signature capture + "Send" button that simulates submission (writes to localStorage, shows a confirmation screen with the emailed-to list and stored PDF).

## Journey stages — what each does

1. **Confirm Eligibility** — AI conversationally asks what the user makes and where they'll sell; it categorizes products against the Illinois allowed list and reassures on the safe cookie/cake/bread path. Prohibited items get a gentle "not allowed under cottage food" flag; acidified/fermented get a "needs safety plan" flag (out of v1 scope, but named).
2. **Get Certified** — AI explains CFPM requirement (5-year validity), routes to two provider cards, lets the user upload a certificate file (stored as data URL in localStorage). "Verified" badge lights up on the station when a certificate is present.
3. **Complete Application** — AI walks through every CDPH application field conversationally: operator name, address, phone, email, product categories, per-product ingredient lists, allergens. Each answer is written into an `application` object in localStorage. The AI reads back captured ingredients for confirmation.
4. **Submit to City** — Client-side renders the completed application as a PDF using pdf-lib, overlays a typed signature, stores the PDF as a base64 data URL, then shows a "Sent" confirmation screen listing the CDPH email address, expected 6–8 week processing time, and a "Download signed PDF" link.

## AI mentor

- Server route `src/routes/api/chat.ts` uses AI SDK `streamText` through the Lovable AI Gateway (`google/gemini-3-flash-preview`).
- System prompt encodes the mentor-baker persona (warm, plain-spoken, celebrates correctness, one question at a time), the current stage the user is on, the eligibility rules for Illinois cottage food, and the field list for the CDPH application.
- The client passes the current stage + captured state each turn so the model always knows where the user is.
- A small set of AI SDK tools lets the model advance state deterministically:
  - `record_product({name, category, ingredients[], allergens[]})`
  - `set_business_profile({legal_name, address, phone, email, sales_channels[]})`
  - `mark_stage_complete({stage})`
  - `flag_needs_safety_plan({product})`
- The chat UI is built with AI Elements (`conversation`, `message`, `prompt-input`, `shimmer`, `tool`); tool calls render collapsed under the assistant message.

## Data model (localStorage)

Single `cupofsugar_state_v1` blob:

```text
{
  onboarding: { products, channels, goal },
  business: { legal_name, address, phone, email, channels[] },
  products: [{ name, category, ingredients[], allergens[], needs_safety_plan }],
  certificate: { filename, data_url, provider, uploaded_at } | null,
  application: { status, filled_pdf_data_url, signature, signed_at } | null,
  current_stage: 1..4,
  stages_completed: [1,2,...],
  messages: UIMessage[]  // chat history for the current session
}
```

## Files

New:
- `src/routes/api/chat.ts` — streaming chat handler with tools + system prompt.
- `src/lib/ai-gateway.server.ts` — Lovable AI Gateway provider helper.
- `src/lib/cupofsugar/state.ts` — typed `useCupofsugarState` hook wrapping localStorage.
- `src/lib/cupofsugar/stages.ts` — stage definitions + system prompts per stage.
- `src/lib/cupofsugar/pdf.ts` — pdf-lib helpers to render + sign the CDPH application.
- `src/components/journey-rail.tsx` — the diagonal red L-line map with 7 stations.
- `src/components/mentor-chat.tsx` — AI Elements chat window bound to state.
- `src/components/progress-card.tsx`, `documents-strip.tsx`, `onboarding-dialog.tsx`, `certificate-upload-dialog.tsx`, `submission-review-dialog.tsx`.

Modified:
- `src/routes/index.tsx` — rewrite the placeholder as the main app view (header + rail + working surface).
- `src/routes/__root.tsx` — set real title/description ("Cupofsugar — Chicago Cottage Food Guide"), load Barlow Condensed + Public Sans via `<link>`.
- `src/styles.css` — add CTA red / cream / neutral tokens tuned to the transit poster + Red Line reference.

## Dependencies

Add via `bun add`: `ai`, `@ai-sdk/react`, `@ai-sdk/openai-compatible`, `zod`, `pdf-lib`. Install AI Elements primitives via `bun x ai-elements@latest add conversation message prompt-input shimmer tool`.

Ensure `LOVABLE_API_KEY` is provisioned (via `ai_gateway--create`).

## Explicit non-goals

- No Supabase / Lovable Cloud; no accounts; no server persistence.
- No real email to CDPH (or to the user) — Stage 4 shows a success screen and stores the signed PDF locally.
- No fax, no payment of city fee.
- No avatar customization (stretch, skipped for scope).
- No tax / insurance / label generation UI beyond the locked "Coming soon" station nodes.

## Success check

- First visit shows onboarding; completing it lands the user on Stage 1 with a warm greeting from the mentor.
- Asking the AI about cookies/cakes/breads → it confirms allowed, marks Stage 1 done, station 1 fills red, train glides to station 2.
- Uploading a certificate file lights up Stage 2's "Verified" badge.
- Completing the application conversation populates every CDPH field; opening review renders a real PDF with those values.
- Signing → "Sent" screen with the CDPH address, download link, and 6–8 week note.
- Locked stations 5–7 remain visible but non-interactive.
