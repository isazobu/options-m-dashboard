"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getProposals } from "@/lib/api";
import { Badge } from "@/components/Badge";
import { MockBadge } from "@/components/MockBadge";
import { NoiseFilterBanner } from "@/components/NoiseFilterBanner";
import { dateTime } from "@/lib/format";
import { isNoisyProposalStatus } from "@/lib/statusGroups";

export default function ProposalsPage() {
  const [showAll, setShowAll] = useState(false);
  const proposals = useQuery({
    queryKey: ["proposals"],
    queryFn: () => getProposals(100),
    refetchInterval: 15_000,
  });

  const allRows = proposals.data?.proposals ?? [];
  const noisyCount = allRows.filter((p) => isNoisyProposalStatus(p.status)).length;
  const rows = showAll ? allRows : allRows.filter((p) => !isNoisyProposalStatus(p.status));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Decisions</h1>
        <p className="mt-1 text-sm text-secondary">
          Every trade the strategist has proposed, and what happened to it.
        </p>
      </div>
      <NoiseFilterBanner
        hiddenCount={noisyCount}
        noun="decisions"
        showAll={showAll}
        onToggle={() => setShowAll((v) => !v)}
      />
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
            {rows.map((proposal) => (
              <tr key={proposal.id} className="border-b border-subtle last:border-0">
                <td className="px-4 py-2 text-tertiary">{dateTime(proposal.ts)}</td>
                <td className="px-4 py-2 font-mono-numeric">
                  <span className="inline-flex items-center gap-2">
                    <Link
                      href={`/proposals/${proposal.id}`}
                      className="hover:underline"
                      style={{ color: "var(--color-brand)" }}
                    >
                      {proposal.underlying}
                    </Link>
                    {proposal.is_mock && <MockBadge />}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <Badge status={proposal.status} />
                </td>
                <td className="px-4 py-2 text-xs text-tertiary">
                  {proposal.has_arguments ? "available" : "pending (Phase 3)"}
                </td>
              </tr>
            ))}
            {proposals.data && allRows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-tertiary">
                  No decisions yet.
                </td>
              </tr>
            )}
            {proposals.data && allRows.length > 0 && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-tertiary">
                  Every decision so far is filtered as noisy. Show all to see them.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
