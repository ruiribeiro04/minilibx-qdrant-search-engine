"use client";

import { cn } from "@/lib/utils";
import { useAppStore, type ActiveMode } from "@/lib/store";

const tabs: { id: ActiveMode; label: string }[] = [
  { id: "search", label: "Search" },
  { id: "ai", label: "AI Mode" },
];

export function ModeTabs() {
  const activeMode = useAppStore((s) => s.activeMode);
  const setActiveMode = useAppStore((s) => s.setActiveMode);

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveMode(tab.id)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            activeMode === tab.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
