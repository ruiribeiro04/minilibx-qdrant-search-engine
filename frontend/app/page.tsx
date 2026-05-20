"use client";

import { useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WelcomeView } from "@/components/search/WelcomeView";
import { ResultsView } from "@/components/search/ResultsView";
import { AiModeView } from "@/components/ai/AiModeView";
import { SidePanel } from "@/components/panel/SidePanel";
import { useAppStore } from "@/lib/store";
import { searchDocs } from "@/lib/search-api";

export default function Home() {
  const activeMode = useAppStore((s) => s.activeMode);
  const inputQuery = useAppStore((s) => s.inputQuery);
  const currentQuery = useAppStore((s) => s.currentQuery);
  const setInputQuery = useAppStore((s) => s.setInputQuery);
  const setCurrentQuery = useAppStore((s) => s.setCurrentQuery);
  const setSearchResults = useAppStore((s) => s.setSearchResults);
  const setIsSearching = useAppStore((s) => s.setIsSearching);
  const clearSearch = useAppStore((s) => s.clearSearch);

  const handleSearch = useCallback(async (q: string) => {
    setCurrentQuery(q);
    setIsSearching(true);
    try {
      const results = await searchDocs(q);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [setCurrentQuery, setSearchResults, setIsSearching]);

  return (
    <AppLayout>
      <SidePanel>
        {activeMode === "search" ? (
          currentQuery ? (
            <ResultsView
              query={inputQuery}
              onInputChange={setInputQuery}
              onSubmit={handleSearch}
              onClear={clearSearch}
            />
          ) : (
            <WelcomeView
              query={inputQuery}
              onInputChange={setInputQuery}
              onSubmit={handleSearch}
              onClear={clearSearch}
              isExpanded={false}
            />
          )
        ) : (
          <AiModeView />
        )}
      </SidePanel>
    </AppLayout>
  );
}
