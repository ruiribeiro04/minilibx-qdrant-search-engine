"use client";

import { useAppStore, type SearchResult } from "@/lib/store";

interface ResultCardProps {
  result: SearchResult;
  query: string;
}

function highlightText(text: string, query: string) {
  if (!query) return text;
  const words = query.split(/\s+/).filter(Boolean);
  const regex = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <em key={i} className="not-italic font-semibold text-primary">{part}</em>
    ) : (
      part
    )
  );
}

export function ResultCard({ result, query }: ResultCardProps) {
  const openSidePanel = useAppStore((s) => s.openSidePanel);

  return (
    <button
      onClick={() => openSidePanel(result.module, result.content.slice(0, 150))}
      className="w-full text-left transition-[background] duration-[var(--transition-interactive)] hover:bg-accent/40 border-b border-border/30 last:border-b-0"
    >
      <div className="flex items-start gap-4 p-4 px-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/60 text-sm mt-0.5">
          📄
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground/70">{result.module}</p>
          <h3 className="mt-0.5 text-sm font-semibold leading-snug">{result.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {highlightText(result.content.slice(0, 300), query)}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/8 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/15">
          {result.score.toFixed(2)}
        </span>
      </div>
    </button>
  );
}
