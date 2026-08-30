"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, getKillSwitch, setKillSwitch } from "@/lib/api";
import { timeAgo } from "@/lib/format";

/**
 * The one control on this dashboard that changes what the agents do.
 *
 * Deliberately asymmetric, mirroring the API contract: halting is a single
 * click, resuming needs a typed reason. Stopping a trading system should never
 * be gated behind a form field, and restarting one should never be a stray
 * click on a page somebody left open.
 *
 * It renders `effective`, never `engaged`. The service halts on
 * `KILL_SWITCH=true` OR the stored flag, and this UI can only write the second
 * one — showing the stored flag alone would report "live" while the agents are
 * still refusing every order.
 */
export function KillSwitch() {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);

  const state = useQuery({
    queryKey: ["kill-switch"],
    queryFn: getKillSwitch,
    refetchInterval: 10_000,
  });

  const mutation = useMutation({
    mutationFn: ({ engaged, note }: { engaged: boolean; note?: string }) =>
      setKillSwitch(engaged, note),
    onSuccess: (next) => {
      queryClient.setQueryData(["kill-switch"], next);
      // A halt writes a risk_events row, so the feed is stale the moment this
      // returns.
      queryClient.invalidateQueries({ queryKey: ["risk-events"] });
      setReason("");
      setConfirming(false);
    },
  });

  const data = state.data;
  const halted = data?.effective ?? false;
  const envForced = data?.env_forced ?? false;
  const accent = halted ? "var(--color-danger)" : "var(--color-success)";

  const failure =
    mutation.error instanceof ApiError
      ? `${mutation.error.status}: ${mutation.error.message}`
      : mutation.error
        ? String(mutation.error)
        : null;

  return (
    <div
      className="surface p-4"
      style={{
        borderColor: halted ? accent : "var(--border-subtle)",
        backgroundColor: halted ? `color-mix(in srgb, ${accent} 6%, transparent)` : undefined,
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
            <h2 className="text-sm font-semibold" style={{ color: accent }}>
              {state.isLoading ? "Kill switch" : halted ? "Trading halted" : "Trading live"}
            </h2>
          </div>
          <p className="mt-1 text-xs text-secondary">
            {state.isError
              ? "Could not read the kill switch."
              : halted
                ? "Agents are refusing every order."
                : "Agents may submit orders."}
          </p>
        </div>

        {!halted && !confirming && (
          <button
            type="button"
            onClick={() => mutation.mutate({ engaged: true, note: reason.trim() || undefined })}
            disabled={mutation.isPending || state.isLoading}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--color-danger)" }}
          >
            {mutation.isPending ? "Halting…" : "Halt trading"}
          </button>
        )}

        {halted && !confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={mutation.isPending || envForced}
            title={
              envForced
                ? "KILL_SWITCH=true in the service environment — releasing here cannot resume trading."
                : undefined
            }
            className="rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            Resume trading…
          </button>
        )}
      </div>

      {data?.reason && (
        <p className="mt-3 text-xs text-secondary">
          <span className="text-tertiary">Reason:</span> {data.reason}
          {data.updated_at && (
            <span className="text-tertiary"> · {timeAgo(data.updated_at)}</span>
          )}
        </p>
      )}

      {envForced && (
        <p className="mt-3 text-xs" style={{ color: "var(--color-warning)" }}>
          <code>KILL_SWITCH=true</code> is set in the service environment. That
          outranks this control — the switch can only be released by changing the
          environment and restarting.
        </p>
      )}

      {confirming && (
        <div className="mt-3 flex flex-col gap-2">
          <label htmlFor="kill-reason" className="text-xs text-secondary">
            Why is it safe to resume? Required, and recorded on the risk-events feed.
          </label>
          <input
            id="kill-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. spreads back inside the limit, positions verified"
            className="rounded-md border px-3 py-1.5 text-sm"
            style={{ borderColor: "var(--border-subtle)", background: "transparent" }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => mutation.mutate({ engaged: false, note: reason.trim() })}
              disabled={reason.trim().length === 0 || mutation.isPending}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--color-brand)" }}
            >
              {mutation.isPending ? "Resuming…" : "Confirm resume"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                setReason("");
              }}
              className="rounded-md border px-3 py-1.5 text-xs"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {failure && (
        <p className="mt-3 text-xs" style={{ color: "var(--color-danger)" }}>
          {failure}
        </p>
      )}
    </div>
  );
}
