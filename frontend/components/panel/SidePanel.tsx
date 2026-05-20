"use client";

import { XIcon } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { DocViewer } from "./DocViewer";

export function SidePanel({ children }: { children: React.ReactNode }) {
  const sidePanelOpen = useAppStore((s) => s.sidePanelOpen);
  const sidePanelModule = useAppStore((s) => s.sidePanelModule);
  const highlightChunk = useAppStore((s) => s.highlightChunk);
  const closeSidePanel = useAppStore((s) => s.closeSidePanel);
  const activeMode = useAppStore((s) => s.activeMode);

  if (!sidePanelOpen || !sidePanelModule) {
    return <>{children}</>;
  }

  if (activeMode === "ai") {
    return (
      <div className="flex h-full">
        <div className="min-w-[320px] flex-1 overflow-hidden">{children}</div>
        <div className="w-px cursor-col-resize bg-border/40 transition-colors hover:bg-primary/30 active:bg-primary/50" />
        <div className="flex w-[40%] min-w-[320px] max-w-[70vw] flex-col border-l border-border/40 bg-surface">
          <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
            <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>{sidePanelModule}</span>
            <button
              onClick={closeSidePanel}
              className="rounded-full p-1.5 text-muted-foreground transition-[color,background] duration-[var(--transition-interactive)] hover:bg-accent/50 hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <DocViewer module={sidePanelModule} highlightText={highlightChunk ?? undefined} />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
