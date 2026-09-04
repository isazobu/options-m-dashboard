/**
 * Which statuses read as "noise" rather than a meaningful outcome, for the
 * default view on the decisions and orders pages. Hidden by default, never
 * dropped — a toggle always lets the noisy ones back in. This is a display
 * grouping only; the underlying data (and both pages' "all" view) is
 * unchanged.
 *
 * - Proposal `no_action` is a real decision (the strategist chose not to
 *   trade), not noise, so it stays visible by default.
 * - `rejected` / `failed` / `llm_failed` are the retry/error churn that
 *   floods a long-running paper account and isn't representative of a
 *   single trade's story.
 */
export const NOISY_PROPOSAL_STATUSES = new Set(["rejected", "failed", "llm_failed"]);

/**
 * Order `canceled` here means the *replaced-away* leg of an internal
 * resubmit, not a broker rejection — still noise for the default view.
 */
export const NOISY_ORDER_STATUSES = new Set(["rejected", "broker_rejected", "failed", "canceled"]);

export const isNoisyProposalStatus = (status: string): boolean =>
  NOISY_PROPOSAL_STATUSES.has(status);

export const isNoisyOrderStatus = (status: string): boolean => NOISY_ORDER_STATUSES.has(status);
