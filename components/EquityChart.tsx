"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface EquityChartPoint {
  ts: string;
  equity: number;
}

export function EquityChart({ data }: { data: EquityChartPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-tertiary">
        No equity history yet.
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="ts"
            tickFormatter={(value: string) =>
              new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            }
            stroke="var(--text-tertiary)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            minTickGap={40}
          />
          <YAxis
            stroke="var(--text-tertiary)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={["auto", "auto"]}
            tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`}
            width={48}
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg-surface-raised)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(value) => new Date(String(value)).toLocaleString()}
            formatter={(value) => [`$${Number(value).toLocaleString()}`, "Equity"]}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke="var(--color-brand)"
            strokeWidth={2}
            fill="url(#equityFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
