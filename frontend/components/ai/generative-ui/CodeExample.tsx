"use client";

import { useState } from "react";
import { makeAssistantToolUI } from "@assistant-ui/react";
import { CheckIcon, CopyIcon } from "lucide-react";

interface CodeExampleArgs {
  code: string;
  language: string;
  description?: string;
}

interface CodeExampleResult {
  code: string;
  language: string;
  description: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };
  return (
    <button onClick={copy} className="rounded p-1 text-muted-foreground hover:text-foreground">
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
    </button>
  );
}

export const CodeExample = makeAssistantToolUI<CodeExampleArgs, CodeExampleResult>({
  toolName: "show_code_example",
  render: ({ args, result, status }) => {
    if (status?.type === "running") {
      return (
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Loading code example...</div>
        </div>
      );
    }

    const data = result ?? args;
    return (
      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">{data.language}</span>
          <CopyButton text={data.code} />
        </div>
        <pre className="overflow-x-auto bg-muted/30 p-3 text-xs leading-relaxed">
          <code>{data.code}</code>
        </pre>
        {data.description && (
          <p className="border-t px-3 py-2 text-xs text-muted-foreground">{data.description}</p>
        )}
      </div>
    );
  },
});
