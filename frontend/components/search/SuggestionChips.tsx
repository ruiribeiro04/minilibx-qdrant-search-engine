"use client";

const SUGGESTIONS = [
  "How to create a window?",
  "Drawing functions",
  "Event handling",
  "How to use images?",
  "Mouse input",
  "XPM image loading",
];

export function SuggestionChips({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="rounded-full border border-border/60 px-4 py-1.5 text-xs font-medium text-muted-foreground transition-[color,background,border-color] duration-[var(--transition-interactive)] hover:text-foreground hover:bg-accent/40 hover:border-border"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
