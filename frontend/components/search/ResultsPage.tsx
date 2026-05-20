"use client";

import { SearchBar } from "./SearchBar";
import { SearchAssist } from "./SearchAssist";
import { ResultCard } from "./ResultCard";
import { useAppStore } from "@/lib/store";
import { LoaderIcon } from "lucide-react";

interface ResultsPageProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSubmit: (q: string) => void;
}

export function ResultsPage({ query, onQueryChange, onSubmit }: ResultsPageProps) {
  const searchResults = useAppStore((s) => s.searchResults);
  const isSearching = useAppStore((s) => s.isSearching);

  const grouped = searchResults.reduce<Record<string, typeof searchResults>>((acc, r) => {
    (acc[r.module] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <SearchBar query={query} onChange={onQueryChange} onSubmit={onSubmit} variant="top" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-3xl space-y-4">
          <SearchAssist query={query} />
          {isSearching ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <LoaderIcon className="mr-2 size-4 animate-spin" />
              Searching...
            </div>
          ) : (
            Object.entries(grouped).map(([module, results]) => (
              <div key={module}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {module}
                </h3>
                <div className="space-y-2">
                  {results.map((r, i) => (
                    <ResultCard key={i} result={r} query={query} />
                  ))}
                </div>
              </div>
            ))
          )}
          {!isSearching && searchResults.length === 0 && query && (
            <p className="py-12 text-center text-muted-foreground">No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
