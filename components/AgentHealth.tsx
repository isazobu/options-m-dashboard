"use client";

import { useQuery } from "@tanstack/react-query";
import { getAgentRuns, type AgentRun } from "@/lib/api";
import { timeAgo } from "@/lib/format";

function summarize(agent: string, runs: AgentRun[]) {
  const forAgent = runs.filter((run) => run.agent === agent);
  const last = forAgent[0];
  let consecutiveFailures = 0;
  for (const run of forAgent) {
    if (run.ok) break;
    consecutiveFailures += 1;
  }
  return { last, consecutiveFailures };
}

export function AgentHealth({ agents }: { agents: string[] }) {
  const runs = useQuery({
    queryKey: ["agent-runs"],
    queryFn: () => getAgentRuns(200),
    refetchInterval: 5_000,
  });

  const rows = runs.data?.runs ?? [];

  return (
    <div className="surface overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-subtle text-left text-xs text-tertiary">
            <th className="px-4 py-2 font-normal">Agent</th>
            <th className="px-4 py-2 font-normal">Last run</th>
            <th className="px-4 py-2 font-normal text-right">Duration</th>
            <th className="px-4 py-2 font-normal text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => {
            const { last, consecutiveFailures } = summarize(agent, rows);
            return (
              <tr key={agent} className="border-b border-subtle last:border-0">
                <td className="px-4 py-2">{agent}</td>
                <td className="px-4 py-2 text-tertiary">
                  {last ? timeAgo(last.started_at) : "never"}
                </td>
                <td className="px-4 py-2 text-right font-mono-numeric">
                  {last ? `${last.duration_ms}ms` : "—"}
                </td>
                <td className="px-4 py-2 text-right">
                  {!last ? (
                    <span className="text-tertiary">—</span>
                  ) : consecutiveFailures > 0 ? (
                    <span style={{ color: "var(--color-danger)" }}>
                      {consecutiveFailures} failure{consecutiveFailures > 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span style={{ color: "var(--color-success)" }}>healthy</span>
                  )}
                </td>
              </tr>
            );
          })}
          {agents.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-tertiary">
                No agents registered.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
