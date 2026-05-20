"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { useAppStore } from "@/lib/store";

interface ApiReferenceArgs {
  function_name: string;
}

interface ApiReferenceResult {
  function_name: string;
  module: string;
  content: string;
  url: string;
}

export const ApiReferenceCard = makeAssistantToolUI<ApiReferenceArgs, ApiReferenceResult>({
  toolName: "show_api_reference",
  render: ({ args, result, status }) => {
    if (status?.type === "running") {
      return (
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Loading API reference for <code>{args.function_name}</code>...</div>
        </div>
      );
    }

    if (!result) return null;

    return (
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-mono text-sm font-semibold">{result.function_name}</h4>
          <span className="text-xs text-muted-foreground">{result.module}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-6">
          {result.content}
        </p>
      </div>
    );
  },
});
