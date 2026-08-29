"use client";

import { useQuery } from "@tanstack/react-query";
import { getRiskEvents } from "@/lib/api";
import { dateTime } from "@/lib/format";

export default function RiskEventsPage() {
  const events = useQuery({
    queryKey: ["risk-events"],
    queryFn: () => getRiskEvents(100),
    refetchInterval: 15_000,
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Risk events</h1>
        <p className="mt-1 text-sm text-secondary">
          Every trade the risk engine rejected, and why. Declined trades are stronger evidence
          of discipline than trades taken.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {(events.data?.risk_events ?? []).map((event, index) => (
          <div key={index} className="surface p-4">
            <div className="flex items-center justify-between">
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  color: "var(--color-danger)",
                  backgroundColor: "color-mix(in srgb, var(--color-danger) 15%, transparent)",
                }}
              >
                {event.rule}
              </span>
              <span className="text-xs text-tertiary">{dateTime(event.ts)}</span>
            </div>
            <pre className="mt-2 overflow-x-auto text-xs text-secondary">
              {JSON.stringify(event.detail, null, 2)}
            </pre>
          </div>
        ))}
        {events.data && events.data.risk_events.length === 0 && (
          <p className="text-sm text-tertiary">No risk events yet.</p>
        )}
      </div>
    </div>
  );
}
