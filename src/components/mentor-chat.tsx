import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import type { CupofsugarState } from "@/lib/cupofsugar/state";
import { applyToolCall } from "@/lib/cupofsugar/state";
import type { StageId } from "@/lib/cupofsugar/stages";
import { STAGES } from "@/lib/cupofsugar/stages";

export function MentorChat({
  state,
  onStateChange,
}: {
  state: CupofsugarState;
  onStateChange: (updater: (s: CupofsugarState) => CupofsugarState) => void;
}) {
  const stage: StageId = state.current_stage;

  const initialMessages = useMemo(
    () => [
      {
        id: "greet",
        role: "assistant" as const,
        parts: [
          {
            type: "text" as const,
            text: `Good morning! I'm your Cupofsugar mentor — I've walked plenty of Chicago bakers through this exact ride. We're at **Stop 1: Confirm Eligibility**.\n\nSo tell me — what are you dreaming of selling? A single kind of cookie, a small menu of cakes, sourdough loaves?`,
          },
        ],
      },
    ],
    [],
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: { messages, stage, state, ...body },
        }),
      }),
    // Rebuild transport when stage or key state changes so the server sees fresh context
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage, state.products.length, state.certificate, state.business.legal_name],
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: initialMessages,
    onToolCall: ({ toolCall }) => {
      onStateChange((s) =>
        applyToolCall(s, toolCall.toolName, toolCall.input as Record<string, unknown>),
      );
    },
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const isBusy = status === "submitted" || status === "streaming";

  const stageName = STAGES.find((s) => s.id === stage)?.name ?? "";

  return (
    <div className="flex h-[640px] flex-col rounded-3xl bg-white ring-1 ring-black/5 shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-950/5 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-cta-red/10 text-cta-red">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Mentor · Stop {stage}
            </p>
            <p className="font-display text-lg font-medium leading-none">{stageName}</p>
          </div>
        </div>
        <span className="hidden text-xs italic text-neutral-500 sm:inline">
          one question at a time
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {isBusy && (
          <div className="flex gap-3">
            <div className="size-7 shrink-0 rounded-full bg-cta-red/10" />
            <div className="flex items-center gap-1.5 pt-3">
              <Dot />
              <Dot delay="150ms" />
              <Dot delay="300ms" />
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            The mentor's line is quiet. {error.message}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const text = input.trim();
          if (!text || isBusy) return;
          sendMessage({ text });
          setInput("");
        }}
        className="flex items-center gap-2 border-t border-neutral-950/5 p-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isBusy ? "The mentor is thinking..." : "Type your answer..."}
          disabled={isBusy}
          className="flex-1 rounded-full bg-neutral-100 px-5 py-3 text-sm outline-none ring-1 ring-black/5 transition-shadow placeholder:text-neutral-400 focus:ring-2 focus:ring-cta-red/40 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isBusy || !input.trim()}
          className="flex size-11 items-center justify-center rounded-full bg-cta-red text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="block size-1.5 animate-bounce rounded-full bg-neutral-400"
      style={{ animationDelay: delay }}
    />
  );
}

function MessageBubble({ message }: { message: { id: string; role: string; parts: unknown[] } }) {
  const text = (message.parts as Array<{ type: string; text?: string }>)
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");

  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-cta-red px-4 py-3 text-sm leading-relaxed text-white">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cta-red/10 text-[11px] font-bold text-cta-red">
        C
      </div>
      <div className="flex-1 space-y-2">
        <RenderMarkdown text={text} />
        <ToolCallStrip parts={message.parts as Array<Record<string, unknown>>} />
      </div>
    </div>
  );
}

function RenderMarkdown({ text }: { text: string }) {
  // Very light markdown: bold, paragraphs, line breaks
  const paragraphs = text.split(/\n\n+/);
  return (
    <div className="space-y-3">
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className="whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-800"
          dangerouslySetInnerHTML={{
            __html: p
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
              .replace(/\*(.+?)\*/g, "<em>$1</em>"),
          }}
        />
      ))}
    </div>
  );
}

function ToolCallStrip({ parts }: { parts: Array<Record<string, unknown>> }) {
  const toolParts = parts.filter((p) => typeof p.type === "string" && (p.type as string).startsWith("tool-"));
  if (toolParts.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {toolParts.map((p, i) => {
        const rawType = String(p.type);
        const name = rawType.replace(/^tool-/, "");
        return (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-600 ring-1 ring-black/5"
          >
            <span className="size-1.5 rounded-full bg-cta-red" />
            {name.replace(/_/g, " ")}
          </span>
        );
      })}
    </div>
  );
}
