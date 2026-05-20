"use client";

import { SettingsIcon } from "lucide-react";
import { ModeTabs } from "./ModeTabs";
import { useAppStore, type AiFrequency } from "@/lib/store";
import { useState } from "react";
import { cn } from "@/lib/utils";

const frequencies: { id: AiFrequency; label: string }[] = [
  { id: "always", label: "Always" },
  { id: "on-demand", label: "On-demand" },
  { id: "never", label: "Never" },
];

function AiFrequencySettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const aiFrequency = useAppStore((s) => s.aiFrequency);
  const setAiFrequency = useAppStore((s) => s.setAiFrequency);

  if (!open) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/12 bg-surface/90 backdrop-blur-xl p-1.5 shadow-lg z-50">
      <p className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground tracking-wide uppercase">AI Summary</p>
      {frequencies.map((f) => (
        <button
          key={f.id}
          onClick={() => { setAiFrequency(f.id); onClose(); }}
          className={cn(
            "w-full rounded-lg px-2.5 py-2 text-left text-sm transition-[background,color] duration-[var(--transition-interactive)]",
            aiFrequency === f.id
              ? "bg-primary/10 text-primary font-medium"
              : "text-foreground hover:bg-accent/60"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const activeMode = useAppStore((s) => s.activeMode);
  const isSearchMode = activeMode === "search";

  return (
    <div className="flex h-dvh flex-col">
      <header
        className={cn(
          "absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3",
          isSearchMode
            ? "text-white border-none"
            : "bg-surface/80 backdrop-blur-xl border-b border-border/40 text-foreground"
        )}
      >
        <div className="flex items-center gap-5">
          <h1
            className={cn(
              "text-base font-bold tracking-tight",
              isSearchMode ? "text-white" : ""
            )}
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className={isSearchMode ? "text-[oklch(0.75_0.12_192)]" : "text-primary"}>
              MiniLibX
            </span>{" "}
            Search
          </h1>
          <ModeTabs variant={isSearchMode ? "glass" : "default"} />
        </div>
        <div className="relative">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={cn(
              "rounded-full p-2 transition-[color,background] duration-[var(--transition-interactive)]",
              isSearchMode
                ? "text-white/75 hover:text-white hover:bg-white/10"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <SettingsIcon className="size-4" />
          </button>
          <AiFrequencySettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
