"use client";

import { Thread } from "@/components/assistant-ui/thread";
import { ApiReferenceCard } from "./generative-ui/ApiReferenceCard";
import { DocsCard } from "./generative-ui/DocsCard";
import { CodeExample } from "./generative-ui/CodeExample";

export function AiModeView() {
  return (
    <div className="h-full">
      <ApiReferenceCard />
      <DocsCard />
      <CodeExample />
      <Thread />
    </div>
  );
}
