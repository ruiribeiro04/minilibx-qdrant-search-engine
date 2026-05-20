"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDownIcon, MessageSquareIcon, LoaderIcon } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";

interface SearchAssistProps {
  query: string;
}

export function SearchAssist({ query }: SearchAssistProps) {
  const aiFrequency = useAppStore((s) => s.aiFrequency);
  const setActiveMode = useAppStore((s) => s.setActiveMode);
  const setPendingChatContext = useAppStore((s) => s.setPendingChatContext);

  const [summary, setSummary] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [showButton, setShowButton] = useState(false);
  const [sources, setSources] = useState<Array<{id: number; title: string; module: string; url: string}>>([]);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSummary = useCallback(async (q: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsStreaming(true);
    setSummary("");
    setSources([]);
    setExpanded(false);

    try {
      const agentUrl =
        (process.env.NEXT_PUBLIC_AGUI_ASSIST_URL as string | undefined) ??
        "http://localhost:8000/api/assist-agent";

      const res = await fetch(agentUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: crypto.randomUUID(),
          runId: crypto.randomUUID(),
          state: null,
          messages: [{ id: crypto.randomUUID(), role: "user", content: q }],
          tools: [],
          context: [],
          forwardedProps: {},
        }),
        signal: controller.signal,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === "TEXT_MESSAGE_CONTENT" && event.delta) {
                accumulated += event.delta;
                setSummary(accumulated);
              }
              if (event.type === "SOURCES" && event.sources) {
                setSources(event.sources);
              }
            } catch {}
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setSummary("AI summary unavailable.");
      }
    } finally {
      setIsStreaming(false);
    }
  }, []);

  useEffect(() => {
    if (aiFrequency === "never" || !query) return;
    if (aiFrequency === "always") {
      fetchSummary(query);
    }
    return () => abortRef.current?.abort();
  }, [query, aiFrequency, fetchSummary]);

  if (aiFrequency === "never") return null;

  if (aiFrequency === "on-demand" && !showButton && !summary) {
    return (
      <div className="rounded-xl border border-border/40 bg-surface p-3">
        <button
          onClick={() => { setShowButton(true); fetchSummary(query); }}
          className="text-sm font-medium text-primary hover:underline"
        >
          Show AI Summary
        </button>
      </div>
    );
  }

  const handleChat = () => {
    setPendingChatContext({ query, summary });
    setActiveMode("ai");
  };

  return (
    <div className="mx-4 mt-3 mb-2 rounded-xl bg-primary/6 border border-primary/15 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold tracking-widest uppercase text-primary bg-primary/12 px-2 py-0.5 rounded-full">
          AI Answer
        </span>
      </div>
      {isStreaming && !summary ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderIcon className="size-4 animate-spin" />
          Generating AI summary...
        </div>
      ) : (
        <>
          <div className={expanded ? "" : "relative"}>
            <div className={expanded ? "" : "line-clamp-3"}>
              <MarkdownRenderer content={summary} variant="chat" sources={sources} />
            </div>
            {!expanded && summary.length > 120 && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-primary/6 to-transparent" />
            )}
          </div>
          <div className="mt-3 flex items-center gap-3">
            {summary.length > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                {expanded ? "Less" : "More"}
                <ChevronDownIcon className={"size-3 transition-transform " + (expanded ? "rotate-180" : "")} />
              </button>
            )}
            <button
              onClick={handleChat}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <MessageSquareIcon className="size-3" />
              Chat
            </button>
          </div>
          {expanded && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (followUp.trim()) {
                  setPendingChatContext({ query, summary, followUp: followUp.trim() });
                  setActiveMode("ai");
                }
              }}
              className="mt-4 flex gap-2 border-t border-primary/10 pt-3"
            >
              <input
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                placeholder="Ask a follow-up..."
                className="flex-1 rounded-lg border border-border/50 bg-surface/50 px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-shadow duration-[var(--transition-interactive)]"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary-hover transition-[background] duration-[var(--transition-interactive)]"
              >
                Ask
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
