"use client";

import { useQuery } from "@tanstack/react-query";
import { getPortfolio, getPositions, getStatus } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { EquityChart } from "@/components/EquityChart";
import { money, number, percent } from "@/lib/format";

export default function OverviewPage() {
  const status = useQuery({
    queryKey: ["status"],
    queryFn: getStatus,
    refetchInterval: 10_000,
  });
  const portfolio = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => getPortfolio(),
    refetchInterval: 30_000,
  });
  const positions = useQuery({
    queryKey: ["positions"],
    queryFn: getPositions,
    refetchInterval: 10_000,
  });

  const account = portfolio.data?.account ?? status.data?.account ?? null;
  const equity = account ? Number(account.equity) : null;
  const lastEquity = account ? Number(account.last_equity) : null;
  const dayPnl = equity !== null && lastEquity !== null ? equity - lastEquity : null;
  const dayPnlPct =
    dayPnl !== null && lastEquity ? dayPnl / lastEquity : null;
  const totalPnl = equity !== null ? equity - 100_000 : null;

  const history = portfolio.data?.portfolio_history;
  const chartData =
    history?.timestamp.map((ts, index) => ({
      ts: new Date(ts * 1000).toISOString(),
      equity: history.equity[index],
    })) ?? [];

  const broker = status.data?.broker;
  const clock = status.data?.clock as { is_open?: boolean } | null;

  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Overview</h1>
          <div className="flex items-center gap-3 text-xs text-secondary">
            {broker && (
              <span
                className="flex items-center gap-1.5"
                style={{ color: broker.connected ? "var(--color-success)" : "var(--color-danger)" }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: broker.connected ? "var(--color-success)" : "var(--color-danger)",
                  }}
                />
                {broker.connected ? "Broker connected" : "Broker unavailable"}
              </span>
            )}
            {broker?.dry_run && (
              <span className="rounded-full bg-[var(--bg-surface-raised)] px-2 py-0.5">
                DRY RUN
              </span>
            )}
            {clock && (
              <span>{clock.is_open ? "Market open" : "Market closed"}</span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Equity" value={money(equity)} />
          <StatCard
            label="Day P/L"
            value={`${dayPnl !== null && dayPnl >= 0 ? "+" : ""}${money(dayPnl)}${
              dayPnlPct !== null ? ` (${percent(dayPnlPct)})` : ""
            }`}
            tone={dayPnl === null ? "default" : dayPnl >= 0 ? "success" : "danger"}
          />
          <StatCard
            label="Total P/L vs $100k"
            value={`${totalPnl !== null && totalPnl >= 0 ? "+" : ""}${money(totalPnl)}`}
            tone={totalPnl === null ? "default" : totalPnl >= 0 ? "success" : "danger"}
          />
          <StatCard label="Open positions" value={String(positions.data?.positions.length ?? "—")} />
        </div>
      </section>

      <section className="surface p-4">
        <h2 className="mb-3 text-sm font-medium text-secondary">Equity curve</h2>
        <EquityChart data={chartData} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-secondary">Open positions</h2>
        <div className="surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-subtle text-left text-xs text-tertiary">
                <th className="px-4 py-2 font-normal">Symbol</th>
                <th className="px-4 py-2 font-normal">Side</th>
                <th className="px-4 py-2 font-normal">Qty</th>
                <th className="px-4 py-2 font-normal text-right">Entry</th>
                <th className="px-4 py-2 font-normal text-right">Mark</th>
                <th className="px-4 py-2 font-normal text-right">Unrealized P/L</th>
                <th className="px-4 py-2 font-normal text-right">Delta</th>
                <th className="px-4 py-2 font-normal text-right">IV</th>
              </tr>
            </thead>
            <tbody>
              {(positions.data?.positions ?? []).map((position) => {
                const pnl = position.unrealized_pl ? Number(position.unrealized_pl) : null;
                return (
                  <tr key={position.symbol} className="border-b border-subtle last:border-0">
                    <td className="px-4 py-2 font-mono-numeric">{position.symbol}</td>
                    <td className="px-4 py-2 capitalize">{position.side ?? "—"}</td>
                    <td className="px-4 py-2 font-mono-numeric">{position.qty ?? "—"}</td>
                    <td className="px-4 py-2 text-right font-mono-numeric">
                      {money(position.avg_entry_price)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono-numeric">
                      {money(position.current_price)}
                    </td>
                    <td
                      className="px-4 py-2 text-right font-mono-numeric"
                      style={{
                        color:
                          pnl === null
                            ? undefined
                            : pnl >= 0
                              ? "var(--color-success)"
                              : "var(--color-danger)",
                      }}
                    >
                      {money(position.unrealized_pl)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono-numeric">
                      {position.snapshot?.greeks?.delta !== undefined
                        ? number(position.snapshot.greeks.delta, 3)
                        : position.snapshot_error
                          ? "—"
                          : "—"}
                    </td>
                    <td className="px-4 py-2 text-right font-mono-numeric">
                      {position.snapshot?.impliedVolatility !== undefined
                        ? percent(position.snapshot.impliedVolatility, 1)
                        : "—"}
                    </td>
                  </tr>
                );
              })}
              {positions.data && positions.data.positions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-tertiary">
                    No open positions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
