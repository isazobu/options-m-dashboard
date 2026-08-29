"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getProposal } from "@/lib/api";
import { Badge } from "@/components/Badge";
import { MockBadge } from "@/components/MockBadge";
import { dateTime } from "@/lib/format";

function JsonBlock({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <p className="text-sm text-tertiary">Not available yet.</p>;
  }
  return (
    <pre className="overflow-x-auto rounded-md bg-[var(--bg-surface-raised)] p-3 text-xs">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const proposalId = Number(id);

  const detail = useQuery({
    queryKey: ["proposal", proposalId],
    queryFn: () => getProposal(proposalId),
    enabled: Number.isFinite(proposalId),
  });

  if (detail.isError) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/proposals" className="text-sm text-secondary hover:underline">
          ← Decisions
        </Link>
        <p className="text-sm text-tertiary">Proposal not found.</p>
      </div>
    );
  }

  const proposal = detail.data?.proposal;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/proposals" className="text-sm text-secondary hover:underline">
          ← Decisions
        </Link>
        {proposal && (
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-lg font-semibold">{proposal.underlying}</h1>
            <Badge status={proposal.status} />
            {Boolean(proposal.evidence?.mock) && <MockBadge />}
            <span className="text-xs text-tertiary">{dateTime(proposal.ts)}</span>
          </div>
        )}
      </div>

      {proposal && (
        <>
          <section className="surface p-4">
            <h2 className="mb-2 text-sm font-medium text-secondary">Intent</h2>
            <JsonBlock value={proposal.intent} />
          </section>

          <section className="surface p-4">
            <h2 className="mb-2 text-sm font-medium text-secondary">Evidence</h2>
            <JsonBlock value={proposal.evidence} />
          </section>

          <section className="surface p-4">
            <h2 className="mb-2 text-sm font-medium text-secondary">Reasoning (bull/bear/PM)</h2>
            {proposal.arguments ? (
              <JsonBlock value={proposal.arguments} />
            ) : (
              <p className="text-sm text-tertiary">
                Not yet available — the LLM reasoning crew (Phase 3) has not run for this
                proposal.
              </p>
            )}
          </section>

          <section className="surface p-4">
            <h2 className="mb-2 text-sm font-medium text-secondary">Verdict</h2>
            {proposal.verdict ? (
              <JsonBlock value={proposal.verdict} />
            ) : (
              <p className="text-sm text-tertiary">Not yet available (Phase 3).</p>
            )}
          </section>

          <section className="surface p-4">
            <h2 className="mb-2 text-sm font-medium text-secondary">Plan</h2>
            <JsonBlock value={proposal.plan} />
          </section>

          {proposal.error && (
            <section className="surface p-4" style={{ borderColor: "var(--color-danger)" }}>
              <h2 className="mb-2 text-sm font-medium" style={{ color: "var(--color-danger)" }}>
                Error
              </h2>
              <p className="text-sm">{proposal.error}</p>
            </section>
          )}

          <section className="surface p-4">
            <h2 className="mb-2 text-sm font-medium text-secondary">Resulting orders</h2>
            {detail.data && detail.data.orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-subtle text-left text-xs text-tertiary">
                      <th className="py-2 font-normal">Client order id</th>
                      <th className="py-2 font-normal">Status</th>
                      <th className="py-2 font-normal">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.data.orders.map((order) => (
                      <tr key={order.client_order_id} className="border-b border-subtle last:border-0">
                        <td className="py-2 font-mono-numeric">{order.client_order_id}</td>
                        <td className="py-2">
                          <Badge status={order.status} />
                        </td>
                        <td className="py-2 text-tertiary">{dateTime(order.submitted_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-tertiary">No order was placed for this proposal.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
