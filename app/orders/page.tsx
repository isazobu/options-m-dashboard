"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getOrders, type OrderRow } from "@/lib/api";
import { Badge } from "@/components/Badge";
import { dateTime, money, number } from "@/lib/format";

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
  const orders = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(100),
    refetchInterval: 15_000,
  });

  const rows = orders.data?.orders ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Recent orders</h1>
        <p className="mt-1 text-sm text-secondary">
          Every order attempt the execution agent sent to the broker, newest first — including
          the ones the broker rejected.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
        {orders.data && rows.length === 0 && (
          <p className="text-sm text-tertiary">No orders yet.</p>
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
