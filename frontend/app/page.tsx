"use client";

import { useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WelcomeScreen } from "@/components/search/WelcomeScreen";
import { ResultsPage } from "@/components/search/ResultsPage";
import { AiModeView } from "@/components/ai/AiModeView";
import { SidePanel } from "@/components/panel/SidePanel";
import { useAppStore } from "@/lib/store";
import { searchDocs } from "@/lib/search-api";

export default function Home() {
  const activeMode = useAppStore((s) => s.activeMode);
  const currentQuery = useAppStore((s) => s.currentQuery);
  const setCurrentQuery = useAppStore((s) => s.setCurrentQuery);
  const setSearchResults = useAppStore((s) => s.setSearchResults);
  const setIsSearching = useAppStore((s) => s.setIsSearching);

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
            <ResultsPage
              query={currentQuery}
              onQueryChange={setCurrentQuery}
              onSubmit={handleSearch}
            />
          ) : (
            <WelcomeScreen
              query={currentQuery}
              onQueryChange={setCurrentQuery}
              onSubmit={handleSearch}
            />
          )
        ) : (
          <AiModeView />
        )}
      </SidePanel>
    </AppLayout>
  );
}
