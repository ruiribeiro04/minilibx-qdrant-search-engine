"use client";

import { useState, useEffect } from "react";
import { XIcon, LoaderIcon } from "lucide-react";
import { getDoc } from "@/lib/search-api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DocViewerProps {
  module: string;
}

export function DocViewer({ module }: DocViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDoc(module)
      .then((data) => setContent(data.content))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [module]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <LoaderIcon className="mr-2 size-4 animate-spin" />
        Loading...
      </div>
    );
  }

  if (error) {
    return <p className="p-4 text-sm text-destructive">Error: {error}</p>;
  }

  return (
    <div className="doc-viewer p-4 text-sm leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content ?? ""}</ReactMarkdown>
    </div>
  );
}
