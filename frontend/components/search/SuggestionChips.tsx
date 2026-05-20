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
          className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
