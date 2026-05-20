"use client";

import { SearchBar } from "./SearchBar";
import { SuggestionChips } from "./SuggestionChips";

interface WelcomeScreenProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSubmit: (q: string) => void;
}

export function WelcomeScreen({ query, onQueryChange, onSubmit }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h2 className="text-4xl font-bold tracking-tight">MiniLibX Search</h2>
        <p className="mt-2 text-muted-foreground">Documentation search for the 42 school graphics library</p>
      </div>
      <SearchBar query={query} onChange={onQueryChange} onSubmit={onSubmit} variant="centered" />
      <SuggestionChips onSelect={onSubmit} />
    </div>
  );
}
