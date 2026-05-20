"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { useAppStore } from "@/lib/store";

interface DocsCardArgs {
  url: string;
  begin?: string;
  end?: string;
}

interface DocsCardResult {
  module: string;
  excerpt: string;
  url: string;
}

export const DocsCard = makeAssistantToolUI<DocsCardArgs, DocsCardResult>({
  toolName: "show_docs_card",
  render: ({ args, result, status }) => {
    const openSidePanel = useAppStore((s) => s.openSidePanel);

    if (status?.type === "running") {
      return (
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Loading documentation...</div>
        </div>
      );
    }

    if (!result) return null;

    return (
      <div className="rounded-lg border p-4">
        <p className="text-xs text-muted-foreground">{result.module}</p>
        <p className="mt-1 line-clamp-6 text-sm leading-relaxed">{result.excerpt}</p>
        <button
          onClick={() => openSidePanel(result.module)}
          className="mt-2 text-xs text-primary hover:underline"
        >
          View Full
        </button>
      </div>
    );
  },
});
