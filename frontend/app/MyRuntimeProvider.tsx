"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AssistantRuntimeProvider,
  type ThreadMessage,
} from "@assistant-ui/react";
import { HttpAgent } from "@ag-ui/client";
import { useAgUiRuntime } from "@assistant-ui/react-ag-ui";
import { useAppStore } from "@/lib/store";

type StoredThread = {
  id: string;
  messages: readonly ThreadMessage[];
};

export function MyRuntimeProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const agentUrl =
    (process.env.NEXT_PUBLIC_AGUI_AGENT_URL as string | undefined) ?? "http://localhost:8000/api/agent";
  const pendingChatContext = useAppStore((s) => s.pendingChatContext);
  const setPendingChatContext = useAppStore((s) => s.setPendingChatContext);

  const threadsRef = useRef<Map<string, StoredThread>>(new Map());
  const pendingCtxToInject = useRef<typeof pendingChatContext>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string>(() => {
    const id = crypto.randomUUID();
    threadsRef.current.set(id, { id, messages: [] });
    return id;
  });

  useEffect(() => {
    if (pendingChatContext && !pendingCtxToInject.current) {
      pendingCtxToInject.current = pendingChatContext;
      setPendingChatContext(null);
    }
  }, [pendingChatContext, setPendingChatContext]);

  const agent = useMemo(() => {
    return new HttpAgent({
      url: agentUrl,
      threadId: currentThreadId,
      headers: { Accept: "text/event-stream" },
    });
  }, [agentUrl, currentThreadId]);

  const threadListAdapter = useMemo(
    () => ({
      threadId: currentThreadId,
      onSwitchToNewThread: async () => {
        const newId = crypto.randomUUID();
        threadsRef.current.set(newId, { id: newId, messages: [] });
        setCurrentThreadId(newId);
        console.debug("[agui] Switched to new thread:", newId);
      },
      onSwitchToThread: async (threadId: string) => {
        const thread = threadsRef.current.get(threadId);
        if (!thread) {
          throw new Error(`Thread ${threadId} not found`);
        }
        setCurrentThreadId(threadId);
        console.debug("[agui] Switched to thread:", threadId);
        return { messages: thread.messages };
      },
    }),
    [currentThreadId],
  );

  const runtime = useAgUiRuntime({
    agent,
    logger: {
      debug: (...a: any[]) => console.debug("[agui]", ...a),
      error: (...a: any[]) => console.error("[agui]", ...a),
    },
    adapters: {
      threadList: threadListAdapter,
    },
  });

  useEffect(() => {
    const ctx = pendingCtxToInject.current;
    if (ctx) {
      pendingCtxToInject.current = null;
      const msgs: ThreadMessage[] = [
        {
          id: crypto.randomUUID(),
          role: "user",
          content: [{ type: "text" as const, text: ctx.query }],
          attachments: [],
          createdAt: new Date(),
          metadata: { custom: {} },
        },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: [{ type: "text" as const, text: ctx.summary }],
          status: { type: "complete" as const, reason: "stop" as const },
          createdAt: new Date(),
          metadata: {
            unstable_state: {},
            unstable_annotations: [],
            unstable_data: [],
            steps: [],
            custom: {},
          },
        },
      ];
      if (ctx.followUp) {
        msgs.push({
          id: crypto.randomUUID(),
          role: "user",
          content: [{ type: "text" as const, text: ctx.followUp }],
          attachments: [],
          createdAt: new Date(),
          metadata: { custom: {} },
        });
      }
      runtime.thread.reset(msgs);
      console.debug("[agui] Injected pre-populated messages:", msgs.length);
      if (ctx.followUp) {
        setTimeout(() => {
          try {
            runtime.thread.composer.send();
          } catch (e) {
            console.debug("[agui] Auto-send failed:", e);
          }
        }, 100);
      }
    }
  }, [runtime, pendingChatContext]);

  useEffect(() => {
    return runtime.thread.subscribe(() => {
      threadsRef.current.set(currentThreadId, {
        id: currentThreadId,
        messages: runtime.thread.getState().messages,
      });
    });
  }, [runtime, currentThreadId]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
