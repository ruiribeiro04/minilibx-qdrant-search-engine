"use client";

const SUGGESTIONS = [
  "How to create a window?",
  "Drawing functions",
  "Event handling",
  "How to use images?",
  "Mouse input",
  "XPM image loading",
];

export function SuggestionChips({ onSelect, variant = "default" }: { onSelect: (q: string) => void; variant?: "default" | "overlay" }) {
  const chipClass = variant === "overlay"
    ? "rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white/80 transition-[color,background,border-color] duration-[var(--transition-interactive)] hover:text-white hover:bg-white/10 hover:border-white/40"
    : "rounded-full border border-border/60 px-4 py-1.5 text-xs font-medium text-muted-foreground transition-[color,background,border-color] duration-[var(--transition-interactive)] hover:text-foreground hover:bg-accent/40 hover:border-border";

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className={chipClass}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
