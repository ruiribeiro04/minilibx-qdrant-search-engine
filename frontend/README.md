# Frontend — MiniLibX Documentation Search Engine

Next.js 16 + React 19 frontend with AG-UI agent integration.

## Setup

```bash
cp .env.example .env.local
# Edit if backend runs elsewhere (defaults work for local dev)
npm install
npm run dev
```

## Structure

| Path | Description |
|---|---|
| `app/page.tsx` | Dual-mode layout (Search / AI) |
| `app/MyRuntimeProvider.tsx` | AG-UI runtime with HttpAgent |
| `components/layout/` | AppLayout, ModeTabs |
| `components/search/` | WelcomeView, SearchBar, ResultCard, ResultsView, SearchAssist, SuggestionChips, ExpandingSearchPanel |
| `components/shared/` | MarkdownRenderer |
| `components/ai/` | AiModeView, CitationLink, FollowUpChips |
| `components/ai/generative-ui/` | ApiReferenceCard, DocsCard, CodeExample |
| `components/panel/` | SidePanel, DocViewer |
| `lib/` | Zustand store, API client, utilities |
| `server/agent.py` | Standalone AG-UI echo agent (legacy boilerplate) |
