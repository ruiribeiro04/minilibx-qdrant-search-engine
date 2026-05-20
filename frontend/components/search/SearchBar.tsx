"use client";

import { useEffect, useRef } from "react";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  query: string;
  onChange: (q: string) => void;
  onSubmit: (q: string) => void;
  variant?: "centered" | "top";
}

export function SearchBar({ query, onChange, onSubmit, variant = "centered" }: SearchBarProps) {
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
        "flex items-center gap-2 rounded-full border bg-background shadow-sm transition-shadow",
        "has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring/20",
        variant === "centered" ? "px-5 py-3" : "px-4 py-2.5"
      )}>
        <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search MiniLibX documentation..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Search documentation"
        />
        <kbd className="hidden rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </div>
    </form>
  );
}
