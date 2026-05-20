"use client";

import { useRef, useState, useEffect } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandingSearchPanelProps {
  query: string;
  onInputChange: (q: string) => void;
  onSubmit: (q: string) => void;
  onClear: () => void;
  isExpanded: boolean;
  children?: React.ReactNode;
}

export function ExpandingSearchPanel({
  query,
  onInputChange,
  onSubmit,
  onClear,
  isExpanded,
  children,
}: ExpandingSearchPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && isExpanded) {
        onClear();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isExpanded, onClear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSubmit(query.trim());
  };

  return (
    <div
      className={cn(
        "relative z-20 overflow-hidden transition-[width,max-height,border-radius,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "border border-border/60 bg-surface/92 backdrop-blur-xl",
        isExpanded
          ? "w-[min(780px,calc(100vw-2rem))] max-h-[72vh] rounded-xl shadow-xl shadow-primary/8"
          : "w-[min(680px,calc(100vw-2rem))] max-h-16 rounded-2xl shadow-xl"
      )}
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 h-16 border-b border-transparent transition-colors duration-300" style={isExpanded ? { borderBottomColor: "oklch(from var(--foreground) l c h / 0.08)" } : undefined}>
        <SearchIcon className="size-5 shrink-0 text-muted-foreground transition-colors duration-[var(--transition-interactive)] group-focus-within:text-primary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Search MiniLibX documentation..."
          className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/60 caret-primary"
          aria-label="Search documentation"
        />
        <button
          type="button"
          onClick={onClear}
          className={cn(
            "shrink-0 flex items-center justify-center size-8 rounded-full text-muted-foreground transition-[opacity,transform,color,background] duration-[var(--transition-interactive)]",
            "hover:bg-accent/50 hover:text-foreground",
            isExpanded ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75 pointer-events-none"
          )}
          aria-label="Close results"
        >
          <XIcon className="size-4" />
        </button>
        <button
          type="submit"
          className="shrink-0 rounded-full bg-primary px-5 py-1.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-[background,transform,box-shadow] duration-[var(--transition-interactive)] hover:bg-primary-hover hover:-translate-y-px hover:shadow-lg hover:shadow-primary/30 active:translate-y-0"
        >
          Search
        </button>
      </form>

      <div
        className={cn(
          "overflow-y-auto transition-[opacity,transform] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100",
          isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        )}
        style={{ maxHeight: "calc(72vh - 64px - 56px)", scrollbarWidth: "thin", scrollbarColor: "oklch(from var(--foreground) l c h / 0.15) transparent" }}
      >
        {children}
      </div>

      <div
        className={cn(
          "flex items-center justify-between px-5 py-3 border-t border-border/10 transition-opacity duration-300 delay-200",
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <span className="text-xs text-muted-foreground/60">
          {isExpanded ? "Results loaded" : ""}
        </span>
      </div>
    </div>
  );
}
