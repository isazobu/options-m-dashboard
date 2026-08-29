"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { postChat, type ChatAnswer } from "@/lib/api";

interface Turn {
  question: string;
  answer?: ChatAnswer;
  pending?: boolean;
}

const SUGGESTIONS = [
  "What's my current equity?",
  "What positions are open right now?",
  "Why was the last trade rejected?",
  "What has the agent decided recently?",
];

export default function ChatPage() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");

  const mutation = useMutation({
    mutationFn: postChat,
  });

  const ask = (question: string) => {
    if (!question.trim() || mutation.isPending) return;
    setTurns((prev) => [...prev, { question, pending: true }]);
    setInput("");
    mutation.mutate(question, {
      onSuccess: (answer) => {
        setTurns((prev) =>
          prev.map((turn, index) =>
            index === prev.length - 1 ? { ...turn, answer, pending: false } : turn
          )
        );
      },
      onError: (error) => {
        setTurns((prev) =>
          prev.map((turn, index) =>
            index === prev.length - 1
              ? {
                  ...turn,
                  pending: false,
                  answer: {
                    answer: `Request failed: ${error instanceof Error ? error.message : "unknown error"}`,
                    tool_calls: [],
                    warnings: ["request_failed"],
                  },
                }
              : turn
          )
        );
      },
    });
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Chat</h1>
        <p className="mt-1 text-sm text-secondary">
          Read-only. Answers questions about the account, positions, and the agent&apos;s
          decision history — it cannot place, close, or modify anything.
        </p>
      </div>

      <div className="surface flex-1 overflow-y-auto p-4">
        {turns.length === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-tertiary">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="rounded-full border border-subtle px-3 py-1.5 text-xs text-secondary hover:text-[var(--text-primary)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-6">
          {turns.map((turn, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="self-end rounded-2xl rounded-br-sm bg-[var(--color-brand)] px-4 py-2 text-sm text-white">
                {turn.question}
              </div>
              <div className="self-start max-w-[85%] rounded-2xl rounded-bl-sm border border-subtle bg-[var(--bg-surface-raised)] px-4 py-2 text-sm">
                {turn.pending ? (
                  <span className="text-tertiary">Thinking…</span>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap">{turn.answer?.answer}</p>
                    {turn.answer && turn.answer.tool_calls.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {turn.answer.tool_calls.map((call, callIndex) => (
                          <span
                            key={callIndex}
                            className="rounded-full border border-subtle px-2 py-0.5 text-[10px] text-tertiary"
                            title={call.risk === "external_text" ? "untrusted external text" : undefined}
                          >
                            {call.name}
                            {call.risk === "external_text" ? " ⚠" : ""}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about the account, positions, or a recent decision…"
          className="flex-1 rounded-md border border-subtle bg-[var(--bg-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
