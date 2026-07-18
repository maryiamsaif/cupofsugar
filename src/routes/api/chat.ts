import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "ai";
import { z } from "zod";
import { createLovableGateway } from "@/lib/ai-gateway.server";
import { buildSystemPrompt, type StageId } from "@/lib/cupofsugar/stages";

type ChatBody = {
  messages?: UIMessage[];
  stage?: StageId;
  state?: unknown;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody;
        if (!Array.isArray(body.messages)) {
          return new Response("messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableGateway(key);
        const model = gateway("google/gemini-3-flash-preview");

        const tools = {
          record_product: tool({
            description: "Record a product the baker wants to sell.",
            inputSchema: z.object({
              name: z.string(),
              category: z.enum(["allowed", "prohibited", "edge"]),
              ingredients: z.array(z.string()).default([]),
              allergens: z.array(z.string()).default([]),
              needs_safety_plan: z.boolean().default(false),
            }),
            execute: async (input) => ({ ok: true, product: input }),
          }),
          set_business_profile: tool({
            description: "Save the operator business profile fields captured so far.",
            inputSchema: z.object({
              legal_name: z.string().optional(),
              address: z.string().optional(),
              phone: z.string().optional(),
              email: z.string().optional(),
              channels: z.array(z.string()).optional(),
            }),
            execute: async (input) => ({ ok: true, profile: input }),
          }),
          mark_stage_complete: tool({
            description: "Mark a journey stage complete and advance the user.",
            inputSchema: z.object({
              stage: z.number().int().min(1).max(4),
            }),
            execute: async (input) => ({ ok: true, stage: input.stage }),
          }),
          flag_needs_safety_plan: tool({
            description: "Flag a product as needing a Cottage Food Safety Plan (acidified/fermented).",
            inputSchema: z.object({ product: z.string() }),
            execute: async (input) => ({ ok: true, product: input.product }),
          }),
        };

        const result = streamText({
          model,
          system: buildSystemPrompt({ stage: (body.stage ?? 1) as StageId, state: body.state }),
          messages: convertToModelMessages(body.messages),
          tools,
          stopWhen: stepCountIs(6),
        });

        return result.toUIMessageStreamResponse({ originalMessages: body.messages });
      },
    },
  },
});
