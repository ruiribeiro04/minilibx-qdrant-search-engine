"use client";

import { cn } from "@/lib/utils";
import { useAppStore, type ActiveMode } from "@/lib/store";

const tabs: { id: ActiveMode; label: string }[] = [
  { id: "search", label: "Search" },
  { id: "ai", label: "AI Mode" },
];

export function ModeTabs({ variant = "default" }: { variant?: "default" | "glass" }) {
  const activeMode = useAppStore((s) => s.activeMode);
  const setActiveMode = useAppStore((s) => s.setActiveMode);

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-full p-0.5",
        variant === "glass"
          ? "bg-white/6 border border-white/12 backdrop-blur-sm"
          : "bg-muted/60"
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveMode(tab.id)}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-[color,background,shadow] duration-[var(--transition-interactive)]",
            variant === "glass" ? (
              activeMode === tab.id
                ? "bg-white/14 text-white shadow-sm"
                : "text-white/65 hover:text-white hover:bg-white/8"
            ) : (
              activeMode === tab.id
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
