"use client";

import { XIcon } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { DocViewer } from "./DocViewer";

export function SidePanel({ children }: { children: React.ReactNode }) {
  const sidePanelOpen = useAppStore((s) => s.sidePanelOpen);
  const sidePanelModule = useAppStore((s) => s.sidePanelModule);
  const closeSidePanel = useAppStore((s) => s.closeSidePanel);

  if (!sidePanelOpen || !sidePanelModule) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full">
      <div className="min-w-[320px] flex-1 overflow-hidden">{children}</div>
      <div className="w-1 cursor-col-resize bg-border transition-colors hover:bg-primary/30 active:bg-primary/50" />
      <div className="flex w-[40%] min-w-[320px] max-w-[70vw] flex-col border-l">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">{sidePanelModule}</span>
          <button
            onClick={closeSidePanel}
            className="rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <DocViewer module={sidePanelModule} />
        </div>
      </div>
    </div>
  );
}
