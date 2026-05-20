"use client";

import { useState } from "react";

interface CitationLinkProps {
  index: number;
  module: string;
}

export function CitationLink({ index, module }: CitationLinkProps) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <a href={`/api/docs/${module}`} className="text-xs text-primary no-underline hover:underline">
        [{index}]
      </a>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 rounded bg-foreground px-2 py-1 text-xs text-background whitespace-nowrap z-50">
          {module}
        </span>
      )}
    </span>
  );
}
