"use client";

const FOLLOW_UPS = [
  "Show me an example",
  "What parameters does this take?",
  "Related functions",
  "Common pitfalls",
];

export function FollowUpChips({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {FOLLOW_UPS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
