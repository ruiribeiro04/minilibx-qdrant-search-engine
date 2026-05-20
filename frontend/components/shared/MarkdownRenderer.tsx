"use client";

import { useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  variant?: "docs" | "chat";
  highlightText?: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  variant = "docs",
  highlightText,
  className,
}: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightId = "chunk-highlight-target";

  useEffect(() => {
    if (!highlightText || !containerRef.current) return;
    const el = containerRef.current.querySelector(`#${highlightId}`);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    }
  }, [highlightText, content]);

  const processContent = useCallback(
    (text: string) => {
      if (!highlightText || variant !== "docs") return text;
      const normalized = text.replace(/\s+/g, " ");
      const normalizedQuery = highlightText.replace(/\s+/g, " ");
      const idx = normalized.indexOf(normalizedQuery);
      if (idx === -1) return text;
      const before = normalized.slice(0, idx);
      const match = normalized.slice(idx, idx + normalizedQuery.length);
      const after = normalized.slice(idx + normalizedQuery.length);
      return `${before}<span id="${highlightId}" class="chunk-highlight">${match}</span>${after}`;
    },
    [highlightText, variant]
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "text-sm leading-relaxed",
        variant === "docs" && "prose-custom",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1
              className="font-display text-2xl font-extrabold tracking-tight mt-8 mb-3 first:mt-0 scroll-mt-16"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className="font-display text-xl font-bold tracking-tight mt-6 mb-2 first:mt-0 scroll-mt-16"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className="font-display text-lg font-bold mt-5 mb-2 first:mt-0 scroll-mt-16"
              {...props}
            />
          ),
          h4: ({ ...props }) => (
            <h4
              className="font-display text-base font-semibold mt-4 mb-1.5 first:mt-0 scroll-mt-16"
              {...props}
            />
          ),
          h5: ({ ...props }) => (
            <h5 className="font-display text-sm font-semibold mt-3 mb-1" {...props} />
          ),
          h6: ({ ...props }) => (
            <h6 className="font-display text-xs font-semibold text-muted-foreground mt-3 mb-1 uppercase tracking-wide" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="my-3 leading-relaxed first:mt-0 last:mb-0" {...props} />
          ),
          a: ({ href, ...props }) => (
            <a
              href={href}
              className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="my-3 border-l-3 border-primary/40 pl-4 italic text-muted-foreground bg-primary/4 py-2 rounded-r-lg"
              {...props}
            />
          ),
          ul: ({ ...props }) => (
            <ul className="my-2 ml-5 list-disc marker:text-primary/40 [&>li]:mt-1" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="my-2 ml-5 list-decimal marker:text-primary/40 marker:font-semibold [&>li]:mt-1" {...props} />
          ),
          li: ({ children, ...props }) => (
            <li className="leading-relaxed pl-1" {...props}>
              {children}
            </li>
          ),
          hr: ({ ...props }) => (
            <hr
              className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
              {...props}
            />
          ),
          table: ({ ...props }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full border-separate border-spacing-0" {...props} />
            </div>
          ),
          thead: ({ ...props }) => <thead className="bg-accent/50" {...props} />,
          th: ({ ...props }) => (
            <th
              className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border/40 first:rounded-tl-lg last:rounded-tr-lg"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td
              className="px-3 py-2 text-sm border-b border-border/20 last:border-b-0"
              {...props}
            />
          ),
          tr: ({ ...props }) => (
            <tr className="even:bg-accent/20 transition-colors" {...props} />
          ),
          pre: ({ ...props }) => (
            <pre
              className="my-3 overflow-x-auto rounded-xl border border-border/40 bg-surface-2 p-4 text-xs leading-relaxed shadow-sm"
              {...props}
            />
          ),
          code: function Code({ className, children, ...props }) {
            const isBlock = className?.startsWith("language-");
            if (isBlock) {
              const lang = className?.replace("language-", "") || "";
              return (
                <div className="my-3 rounded-xl border border-border/40 overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-accent/40 border-b border-border/30">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {lang}
                    </span>
                  </div>
                  <pre className="bg-surface-2 p-4 overflow-x-auto text-xs leading-relaxed m-0 border-0">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }
            return (
              <code
                className="rounded-md bg-primary/8 border border-primary/12 px-1.5 py-0.5 font-mono text-[0.85em] text-primary"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {processContent(content)}
      </ReactMarkdown>
    </div>
  );
}
