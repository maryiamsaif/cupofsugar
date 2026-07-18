import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const inbound = await request.formData();
        const file = inbound.get("file");
        if (!(file instanceof File)) {
          return new Response("file required", { status: 400 });
        }

        // Name the file to match its real container so the model doesn't 400.
        const type = file.type.split(";")[0];
        const ext =
          type === "audio/webm"
            ? "webm"
            : type === "audio/mp4"
              ? "mp4"
              : type === "audio/mpeg"
                ? "mp3"
                : type === "audio/wav"
                  ? "wav"
                  : "webm";

        const upstream = new FormData();
        upstream.append("model", "openai/gpt-4o-mini-transcribe");
        upstream.append("file", file, `recording.${ext}`);

        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: upstream,
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          return new Response(txt || "transcription failed", { status: res.status });
        }
        const json = (await res.json()) as { text?: string };
        return Response.json({ text: json.text ?? "" });
      },
    },
  },
});
