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
      <mark key={i} className="rounded bg-primary/10 font-semibold text-foreground">{part}</mark>
    ) : (
      part
    )
  );
}

export function ResultCard({ result, query }: ResultCardProps) {
  const openSidePanel = useAppStore((s) => s.openSidePanel);

  return (
    <button
      onClick={() => openSidePanel(result.module)}
      className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{result.module}</p>
          <h3 className="mt-0.5 font-mono text-sm font-semibold">{result.title}</h3>
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {highlightText(result.content.slice(0, 300), query)}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {result.score.toFixed(2)}
        </span>
      </div>
    </button>
  );
}
