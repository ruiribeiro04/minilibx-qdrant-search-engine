"use client";

import { ExpandingSearchPanel } from "./ExpandingSearchPanel";
import { SearchAssist } from "./SearchAssist";
import { ResultCard } from "./ResultCard";
import { SuggestionChips } from "./SuggestionChips";
import { useAppStore } from "@/lib/store";
import { LoaderIcon } from "lucide-react";

interface ResultsViewProps {
  query: string;
  onInputChange: (q: string) => void;
  onSubmit: (q: string) => void;
  onClear: () => void;
}

export function ResultsView({
  query,
  onInputChange,
  onSubmit,
  onClear,
}: ResultsViewProps) {
  const currentQuery = useAppStore((s) => s.currentQuery);
  const searchResults = useAppStore((s) => s.searchResults);
  const isSearching = useAppStore((s) => s.isSearching);

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('/imgs/backdrop.png')",
          filter: "blur(18px) brightness(0.35) saturate(0.7)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "oklch(0.04 0.01 250 / 0.75)" }}
        />
      </div>

      <div className="relative z-5 flex flex-col items-center text-center gap-8 w-full max-w-[720px] px-8 py-8 -translate-y-8">
        <ExpandingSearchPanel
          query={query}
          onInputChange={onInputChange}
          onSubmit={onSubmit}
          onClear={onClear}
          isExpanded={true}
        >
          <div className="py-1">
            <SearchAssist query={currentQuery} />

            {isSearching ? (
              <div className="flex items-center justify-center py-12 text-white/60">
                <LoaderIcon className="mr-2 size-4 animate-spin" />
                <span className="text-sm">Searching...</span>
              </div>
            ) : (
              searchResults.map((r, i) => (
                <ResultCard key={i} result={r} query={currentQuery} />
              ))
            )}

            {!isSearching && searchResults.length === 0 && currentQuery && (
              <p className="py-12 text-center text-sm text-white/50">No results found.</p>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div className="px-5 py-4">
                <SuggestionChips onSelect={onSubmit} />
              </div>
            )}
          </div>
        </ExpandingSearchPanel>
      </div>
    </div>
  );
}
