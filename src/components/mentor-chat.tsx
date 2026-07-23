import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, Paperclip, Mic, Square, X } from "lucide-react";
import type { CupofsugarState, CertificateFile } from "@/lib/cupofsugar/state";
import { applyToolCall } from "@/lib/cupofsugar/state";
import type { StageId } from "@/lib/cupofsugar/stages";
import { STAGES } from "@/lib/cupofsugar/stages";

const COMMON_ALLERGENS = [
  "Milk",
  "Eggs",
  "Wheat",
  "Soy",
  "Peanuts",
  "Tree nuts",
  "Fish",
  "Shellfish",
  "Sesame",
];

export function MentorChat({
  state,
  onStateChange,
}: {
  state: CupofsugarState;
  onStateChange: (updater: (s: CupofsugarState) => CupofsugarState) => void;
}) {
  const stage: StageId = state.current_stage;

  const initialMessages = useMemo(
    () => {
      const stage1Done = state.stages_completed.includes(1);
      const product = state.onboarding?.products;
      const text = stage1Done && product
        ? `Welcome to the kitchen. I'm your Cup of Sugar mentor — a fellow baker, not a suit. Good news: **${product}** are always allowed under Illinois cottage food law, so **Step 1: Confirm Eligibility** is already checked off. ✅\n\nWe're moving on to **Step 2: Food Handler Certification**. When you're ready, tell me a bit about your setup and I'll point you to a course. You can also tap 📎 to send a photo of your ingredients, or 🎤 to just talk to me.`
        : `Welcome to the kitchen. I'm your Cup of Sugar mentor — a fellow baker, not a suit — and I've helped plenty of folks in Chicago turn a favorite recipe into a real, licensed source of income. We're on **Step 1: Confirm Eligibility**.\n\nWhen you're ready, tell me a bit more about the recipe you have in mind. You can also tap 📎 to send me a photo of your ingredients, or 🎤 to just talk to me.`;
      return [
        {
          id: "greet",
          role: "assistant" as const,
          parts: [{ type: "text" as const, text }],
        },
      ];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage, state.products.length, state.certificate, state.business.legal_name, state.onboarded],
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
  const [attached, setAttached] = useState<File | null>(null);
  const [selectedAllergens, setSelectedAllergens] = useState<Set<string>>(new Set());
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const isBusy = status === "submitted" || status === "streaming";

  function toggleAllergen(a: string) {
    setSelectedAllergens((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  }

  async function handleAttach(file: File) {
    // Certificate PDFs go straight to state.
    if (file.type === "application/pdf" || /certificate/i.test(file.name)) {
      const reader = new FileReader();
      reader.onload = () => {
        const cert: CertificateFile = {
          filename: file.name,
          data_url: String(reader.result),
          uploaded_at: new Date().toISOString(),
        };
        onStateChange((s) => {
          const stages_completed = Array.from(new Set([...s.stages_completed, 2 as StageId]));
          const current_stage = Math.max(s.current_stage, 3) as StageId;
          return { ...s, certificate: cert, stages_completed, current_stage };
        });
        void sendMessage({ text: `I just uploaded my CFPM certificate: ${file.name}` });
      };
      reader.readAsDataURL(file);
      return;
    }
    // Otherwise treat as an image the mentor can look at.
    setAttached(file);
  }

  async function submit() {
    const text = input.trim();
    const allergenNote =
      selectedAllergens.size > 0
        ? `\n\nAllergens I've noticed: ${Array.from(selectedAllergens).join(", ")}.`
        : "";
    const combined = (text + allergenNote).trim();
    if (!combined && !attached) return;
    if (isBusy) return;

    if (attached) {
      const dataUrl = await fileToDataUrl(attached);
      const parts = [
        { type: "text", text: combined || "Here's a photo of my ingredients — what do you see?" },
        { type: "file", mediaType: attached.type || "image/jpeg", url: dataUrl },
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await sendMessage({ role: "user", parts } as any);
      setAttached(null);
    } else {
      await sendMessage({ text: combined });
    }

    setInput("");
    setSelectedAllergens(new Set());
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || "audio/webm" });
        if (blob.size < 1000) return;
        setTranscribing(true);
        try {
          const fd = new FormData();
          fd.append("file", blob, "recording.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: fd });
          if (res.ok) {
            const { text } = (await res.json()) as { text: string };
            if (text) setInput((prev) => (prev ? prev + " " + text : text));
          }
        } finally {
          setTranscribing(false);
        }
      };
      recorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (e) {
      console.error("mic error", e);
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  }

  const stageName = STAGES.find((s) => s.id === stage)?.name ?? "";

  return (
    <div className="flex h-[640px] flex-col overflow-hidden rounded-3xl bg-paper ring-1 ring-cta-red/15 shadow-sm">
      <div className="flex items-center justify-between border-b border-cta-red/15 bg-cta-red/5 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-cta-red text-white ring-4 ring-paper">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="font-hand text-lg leading-none text-cta-red">
              step {stage} · your mentor
            </p>
            <p className="font-display text-xl leading-tight text-ink">{stageName}</p>
          </div>
        </div>
        <span className="hidden font-hand text-lg text-ink/50 sm:inline">
          baker to baker
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

      {/* Allergen chips */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-cta-red/10 bg-surface/40 px-4 py-2">
        <span className="mr-1 font-hand text-base text-ink/60">allergens:</span>
        {COMMON_ALLERGENS.map((a) => {
          const on = selectedAllergens.has(a);
          return (
            <button
              key={a}
              type="button"
              onClick={() => toggleAllergen(a)}
              className={
                "rounded-full px-2.5 py-1 text-xs font-medium ring-1 transition-colors " +
                (on
                  ? "bg-cta-red text-white ring-cta-red"
                  : "bg-paper text-ink/70 ring-cta-red/20 hover:ring-cta-red/50")
              }
            >
              {on ? "✓ " : ""}{a}
            </button>
          );
        })}
      </div>

      {attached && (
        <div className="flex items-center gap-3 border-t border-cta-red/10 bg-surface/60 px-4 py-2">
          <img
            src={URL.createObjectURL(attached)}
            alt="attachment"
            className="size-10 rounded-md object-cover ring-1 ring-cta-red/20"
          />
          <span className="flex-1 truncate text-xs text-ink/70">{attached.name}</span>
          <button
            onClick={() => setAttached(null)}
            className="flex size-6 items-center justify-center rounded-full bg-white text-ink/50 hover:text-ink"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="flex items-center gap-2 border-t border-cta-red/15 bg-surface/50 p-4"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          capture="environment"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleAttach(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
          title="Attach a photo of ingredients or your certificate PDF"
          className="flex size-11 items-center justify-center rounded-full bg-paper text-ink/70 ring-1 ring-cta-red/15 hover:text-cta-red disabled:opacity-40"
        >
          <Paperclip className="size-4" />
        </button>
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={isBusy || transcribing}
          title={recording ? "Stop recording" : "Talk to the mentor"}
          className={
            "flex size-11 items-center justify-center rounded-full ring-1 transition-colors disabled:opacity-40 " +
            (recording
              ? "bg-cta-red text-white ring-cta-red animate-pulse"
              : "bg-paper text-ink/70 ring-cta-red/15 hover:text-cta-red")
          }
        >
          {recording ? <Square className="size-4" /> : <Mic className="size-4" />}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            transcribing
              ? "transcribing your voice..."
              : recording
                ? "listening..."
                : isBusy
                  ? "the mentor is thinking..."
                  : "type, talk, or paste your recipe here..."
          }
          disabled={isBusy}
          className="flex-1 rounded-full bg-paper px-5 py-3 text-sm outline-none ring-1 ring-cta-red/15 transition-shadow placeholder:text-ink/40 focus:ring-2 focus:ring-cta-red/50 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isBusy || (!input.trim() && !attached && selectedAllergens.size === 0)}
          className="flex size-11 items-center justify-center rounded-full bg-cta-red text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
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
  const parts = message.parts as Array<{ type: string; text?: string; url?: string; mediaType?: string }>;
  const text = parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
  const image = parts.find((p) => p.type === "file" && p.mediaType?.startsWith("image/"));

  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] space-y-2">
          {image?.url && (
            <img
              src={image.url}
              alt="uploaded"
              className="ml-auto max-h-48 rounded-2xl rounded-tr-sm ring-1 ring-cta-red/20"
            />
          )}
          {text && (
            <div className="rounded-2xl rounded-tr-sm bg-cta-red px-4 py-3 text-sm leading-relaxed text-white">
              {text}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cta-red/10 font-hand text-lg text-cta-red">
        m
      </div>
      <div className="flex-1 space-y-2">
        <RenderMarkdown text={text} />
        <ToolCallStrip parts={message.parts as Array<Record<string, unknown>>} />
      </div>
    </div>
  );
}

function RenderMarkdown({ text }: { text: string }) {
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
