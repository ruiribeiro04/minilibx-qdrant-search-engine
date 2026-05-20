"use client";

import { ExpandingSearchPanel } from "./ExpandingSearchPanel";
import { SuggestionChips } from "./SuggestionChips";

interface WelcomeViewProps {
  query: string;
  onInputChange: (q: string) => void;
  onSubmit: (q: string) => void;
  onClear: () => void;
  isExpanded: boolean;
  children?: React.ReactNode;
}

export function WelcomeView({
  query,
  onInputChange,
  onSubmit,
  onClear,
  isExpanded,
  children,
}: WelcomeViewProps) {
  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center z-0 transition-[filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          backgroundImage: "url('/imgs/backdrop.png')",
          filter: isExpanded ? "blur(18px) brightness(0.35) saturate(0.7)" : "none",
        }}
      >
        <div
          className="absolute inset-0 transition-[background] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            background: isExpanded
              ? "oklch(0.04 0.01 250 / 0.75)"
              : "linear-gradient(to bottom, oklch(0.08 0.01 250 / 0.35), oklch(0.05 0.01 250 / 0.55))",
          }}
        />
      </div>

      <div
        className="relative z-5 flex flex-col items-center text-center gap-8 w-full max-w-[720px] px-8 py-8 transition-[transform,opacity] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: isExpanded ? "translateY(-32px)" : "translateY(0)" }}
      >
        <p
          className="text-xs font-medium tracking-[0.12em] uppercase text-white/55 transition-opacity duration-500"
        >
          Powered by AI
        </p>
        <h1
          className="font-display text-[clamp(2rem,1.2rem+2.5vw,3.5rem)] font-extrabold leading-[1.05] tracking-tight text-white"
        >
          Explore the <span className="text-[oklch(0.75_0.12_192)]">MiniLibX</span> docs
        </h1>
        <p
          className="text-base text-white/60 max-w-[46ch] leading-relaxed transition-opacity duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ opacity: isExpanded ? 0 : 1, pointerEvents: isExpanded ? "none" : "auto" }}
        >
          Search the 42 school graphics library documentation. Get AI-powered answers and instant code references.
        </p>

        <ExpandingSearchPanel
          query={query}
          onInputChange={onInputChange}
          onSubmit={onSubmit}
          onClear={onClear}
          isExpanded={isExpanded}
        >
          {children}
        </ExpandingSearchPanel>

        <div
          className="flex flex-wrap justify-center gap-2 transition-opacity duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ opacity: isExpanded ? 0 : 1, pointerEvents: isExpanded ? "none" : "auto" }}
        >
          <SuggestionChips onSelect={onSubmit} />
        </div>
      </div>
    </div>
  );
}
