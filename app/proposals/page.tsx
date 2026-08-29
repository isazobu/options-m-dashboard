"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getProposals } from "@/lib/api";
import { Badge } from "@/components/Badge";
import { dateTime } from "@/lib/format";

export default function ProposalsPage() {
  const proposals = useQuery({
    queryKey: ["proposals"],
    queryFn: () => getProposals(100),
    refetchInterval: 15_000,
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Decisions</h1>
        <p className="mt-1 text-sm text-secondary">
          Every trade the strategist has proposed, and what happened to it.
        </p>
      </div>
      <div className="surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-subtle text-left text-xs text-tertiary">
              <th className="px-4 py-2 font-normal">Time</th>
              <th className="px-4 py-2 font-normal">Underlying</th>
              <th className="px-4 py-2 font-normal">Status</th>
              <th className="px-4 py-2 font-normal">Reasoning</th>
            </tr>
          </thead>
          <tbody>
            {(proposals.data?.proposals ?? []).map((proposal) => (
              <tr key={proposal.id} className="border-b border-subtle last:border-0">
                <td className="px-4 py-2 text-tertiary">{dateTime(proposal.ts)}</td>
                <td className="px-4 py-2 font-mono-numeric">
                  <Link
                    href={`/proposals/${proposal.id}`}
                    className="hover:underline"
                    style={{ color: "var(--color-brand)" }}
                  >
                    {proposal.underlying}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <Badge status={proposal.status} />
                </td>
                <td className="px-4 py-2 text-xs text-tertiary">
                  {proposal.has_arguments ? "available" : "pending (Phase 3)"}
                </td>
              </tr>
            ))}
            {proposals.data && proposals.data.proposals.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-tertiary">
                  No decisions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
