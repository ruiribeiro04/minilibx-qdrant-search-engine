"use client";

import { ExpandingSearchPanel } from "./ExpandingSearchPanel";
import { SearchAssist } from "./SearchAssist";
import { ResultCard } from "./ResultCard";
import { SuggestionChips } from "./SuggestionChips";
import { DocViewer } from "@/components/panel/DocViewer";
import { useAppStore } from "@/lib/store";
import { LoaderIcon, ArrowLeftIcon } from "lucide-react";

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
  const sidePanelOpen = useAppStore((s) => s.sidePanelOpen);
  const sidePanelModule = useAppStore((s) => s.sidePanelModule);
  const highlightChunk = useAppStore((s) => s.highlightChunk);
  const closeSidePanel = useAppStore((s) => s.closeSidePanel);

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('/imgs/backdrop.png')",
          filter: "blur(18px) brightness(0.6) saturate(0.85)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "oklch(0.04 0.01 250 / 0.45)" }}
        />
      </div>

      <div className="relative z-5 flex flex-col items-center gap-8 w-full max-w-[720px] px-8 py-8 -translate-y-8">
        <ExpandingSearchPanel
          query={query}
          onInputChange={onInputChange}
          onSubmit={onSubmit}
          onClear={onClear}
          isExpanded={true}
        >
          <div className="py-1">
            <div style={sidePanelOpen && sidePanelModule ? { display: "none" } : undefined}>
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

            {sidePanelOpen && sidePanelModule && (
              <div>
                <div className="flex items-center gap-2 px-5 pt-3 pb-1">
                  <button
                    onClick={closeSidePanel}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <ArrowLeftIcon className="size-3" />
                    Back to results
                  </button>
                  <span className="text-xs font-semibold text-muted-foreground" style={{ fontFamily: "var(--font-display)" }}>
                    {sidePanelModule}
                  </span>
                </div>
                <DocViewer module={sidePanelModule} highlightText={highlightChunk ?? undefined} />
              </div>
            )}
          </div>
        </ExpandingSearchPanel>
      </div>
    </div>
  );
}
