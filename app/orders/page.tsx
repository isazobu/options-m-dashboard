"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueries, useQuery } from "@tanstack/react-query";
import { getOrders, getProposal, getProposals, type OrderRow } from "@/lib/api";
import { Badge } from "@/components/Badge";
import { NoiseFilterBanner } from "@/components/NoiseFilterBanner";
import { dateTime, money, number } from "@/lib/format";
import { mergeRowsById } from "@/lib/mergeRows";
import { isNoisyOrderStatus } from "@/lib/statusGroups";

/**
 * The orders endpoint has no status filter, unlike proposals — so unlike
 * the Decisions page, we can't ask the backend for "the successful ones"
 * directly. Instead, cross-reference: proposals with a positive outcome
 * (fetched by status) point at the orders that belong to them, via
 * getProposal(id). That surfaces a real fill even if it has scrolled out
 * of the plain "recent orders" window under a run of rejected retries.
 * Capped at 20 proposals so a busy account doesn't fan out into dozens of
 * requests.
 */
const POSITIVE_STATUSES = ["submitted", "close_submitted"];
const MAX_CROSS_REFERENCED_PROPOSALS = 20;

interface Leg {
  symbol?: string;
  side?: string;
  ratio_qty?: string | number;
}

/** The request payload is the broker kwargs: either a single `symbol` or `legs`. */
function legsOf(request: Record<string, unknown>): Leg[] {
  const legs = request.legs;
  if (Array.isArray(legs)) return legs as Leg[];
  if (typeof request.symbol === "string") {
    return [{ symbol: request.symbol, side: request.side as string | undefined }];
  }
  return [];
}

function OrderCard({ order }: { order: OrderRow }) {
  const legs = legsOf(order.request ?? {});
  const qty = order.request?.qty as string | undefined;
  const limit = order.request?.limit_price as number | string | undefined;

  return (
    <div className="surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-2">
            <Badge status={order.status} />
            <Link
              href={`/proposals/${order.proposal_id}`}
              className="text-sm text-secondary underline-offset-2 hover:underline"
            >
              proposal #{order.proposal_id}
            </Link>
          </span>
          <span className="font-mono text-xs text-tertiary">{order.client_order_id}</span>
        </div>
        <span className="text-xs text-tertiary">{dateTime(order.submitted_at)}</span>
      </div>

      <div className="mt-3 flex flex-col gap-1">
        {legs.map((leg, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span className="text-secondary">{leg.side ?? "—"}</span>
            <span className="font-mono text-[var(--text-primary)]">{leg.symbol ?? "—"}</span>
            {leg.ratio_qty !== undefined && (
              <span className="text-xs text-tertiary">×{leg.ratio_qty}</span>
            )}
          </div>
        ))}
        {legs.length === 0 && <span className="text-sm text-tertiary">No legs recorded.</span>}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-secondary">
        <span>qty {qty ?? "—"}</span>
        <span>limit {money(limit ?? null)}</span>
        <span>filled {order.filled_qty === null ? "—" : number(order.filled_qty, 0)}</span>
        <span>avg fill {money(order.filled_avg_price)}</span>
      </div>

      {order.error && (
        <p className="mt-2 text-xs" style={{ color: "var(--color-danger)" }}>
          {order.error}
        </p>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [showAll, setShowAll] = useState(false);
  const orders = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(100),
    refetchInterval: 15_000,
  });
  const positiveProposals = useQuery({
    queryKey: ["proposals", "positive"],
    queryFn: async () => {
      const results = await Promise.all(
        POSITIVE_STATUSES.map((status) => getProposals(50, status))
      );
      return mergeRowsById(...results.map((r) => r.proposals));
    },
    refetchInterval: 15_000,
  });
  const positiveProposalIds = (positiveProposals.data ?? [])
    .map((p) => p.id)
    .slice(0, MAX_CROSS_REFERENCED_PROPOSALS);
  const positiveProposalOrders = useQueries({
    queries: positiveProposalIds.map((id) => ({
      queryKey: ["proposal-orders", id],
      queryFn: () => getProposal(id),
      staleTime: 30_000,
    })),
  });

  const allRows = orders.data?.orders ?? [];
  const positiveRows: OrderRow[] = mergeRowsById(
    ...positiveProposalOrders.map((q) => q.data?.orders ?? [])
  );
  const noisyCount = allRows.filter((o) => isNoisyOrderStatus(o.status)).length;
  const surfacedCount = positiveRows.filter((o) => !allRows.some((r) => r.id === o.id)).length;

  const byNewestFirst = (a: OrderRow, b: OrderRow) =>
    a.submitted_at < b.submitted_at ? 1 : -1;
  const curatedRows = mergeRowsById(
    allRows.filter((o) => !isNoisyOrderStatus(o.status)),
    positiveRows
  ).sort(byNewestFirst);
  const rows = showAll
    ? mergeRowsById(allRows, positiveRows).sort(byNewestFirst)
    : curatedRows;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Recent orders</h1>
        <p className="mt-1 text-sm text-secondary">
          Every order attempt the execution agent sent to the broker, newest first — including
          the ones the broker rejected.
        </p>
      </div>
      <NoiseFilterBanner
        hiddenCount={noisyCount}
        surfacedCount={surfacedCount}
        noun="orders"
        showAll={showAll}
        onToggle={() => setShowAll((v) => !v)}
      />
      <div className="flex flex-col gap-2">
        {rows.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
        {orders.data && allRows.length === 0 && positiveRows.length === 0 && (
          <p className="text-sm text-tertiary">No orders yet.</p>
        )}
        {orders.data &&
          (allRows.length > 0 || positiveRows.length > 0) &&
          rows.length === 0 && (
            <p className="text-sm text-tertiary">
              Every order so far is filtered as noisy. Show all to see them.
            </p>
          )}
        {orders.isError && (
          <p className="text-sm" style={{ color: "var(--color-danger)" }}>
            Could not load orders.
          </p>
        )}
      </div>
    </div>
  );
}
