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
    <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-background p-2 shadow-lg z-50">
      <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">AI Summary</p>
      {frequencies.map((f) => (
        <button
          key={f.id}
          onClick={() => { setAiFrequency(f.id); onClose(); }}
          className={cn(
            "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors",
            aiFrequency === f.id ? "bg-accent text-foreground" : "hover:bg-accent/50"
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

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold tracking-tight">MiniLibX Search</h1>
          <ModeTabs />
        </div>
        <div className="relative">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
