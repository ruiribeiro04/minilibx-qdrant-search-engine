"use client";

import { useEffect, useRef } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  query: string;
  onInputChange: (q: string) => void;
  onSubmit: (q: string) => void;
  variant?: "centered" | "top";
  onClear?: () => void;
  showClose?: boolean;
}

export function SearchBar({ query, onInputChange, onSubmit, variant = "centered", onClear, showClose = false }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSubmit(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", variant === "centered" ? "max-w-xl" : "max-w-3xl")}>
      <div className={cn(
        "group flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/90 backdrop-blur-xl shadow-md transition-[border-color,box-shadow] duration-[var(--transition-interactive)]",
        "has-[input:focus-visible]:border-primary/40 has-[input:focus-visible]:shadow-lg has-[input:focus-visible]:shadow-primary/5",
        variant === "centered" ? "px-5 py-4" : "px-4 py-3"
      )}>
        <SearchIcon className="size-5 shrink-0 text-muted-foreground transition-colors duration-[var(--transition-interactive)] group-has-[input:focus-visible]:text-primary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Search MiniLibX documentation..."
          className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/60 caret-primary"
          aria-label="Search documentation"
        />
        {showClose && query && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-full p-1 text-muted-foreground transition-[color,background,transform] duration-[var(--transition-interactive)] hover:bg-accent/50 hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        )}
        <button
          type="submit"
          className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-[background,transform,box-shadow] duration-[var(--transition-interactive)] hover:bg-primary-hover hover:-translate-y-px hover:shadow-lg hover:shadow-primary/30 active:translate-y-0"
        >
          Search
        </button>
      </div>
    </form>
  );
}
