/**
 * Typed client for the options-m FastAPI backend.
 *
 * Every function attaches the shared bearer token to the guarded /api/*
 * routes. That token is a hackathon-demo control (a single shared secret),
 * not production auth — see the dashboard README.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (ADMIN_TOKEN) {
    headers.set("Authorization", `Bearer ${ADMIN_TOKEN}`);
  }
  if (init?.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ApiError(response.status, body || response.statusText);
  }
  return (await response.json()) as T;
}

// ---- shared shapes ---------------------------------------------------

export interface BrokerHealth {
  enabled: boolean;
  connected: boolean;
  dry_run?: boolean | null;
  paper_corroborated?: boolean | null;
  options_trading_level?: number | null;
  error: string | null;
}

export interface StatusResponse {
  version: string;
  clock: Record<string, unknown> | null;
  account: Record<string, unknown> | null;
  broker: BrokerHealth;
  agents: string[];
  persistent: boolean;
  equity_tail: EquityPoint[];
}

export interface EquityPoint {
  ts: string;
  equity: number | null;
  cash: number | null;
  buying_power: number | null;
  positions_count: number;
}

export interface AgentRun {
  agent: string;
  started_at: string;
  duration_ms: number;
  ok: boolean;
  error: string | null;
  detail: Record<string, unknown> | null;
}

// ---- positions ---------------------------------------------------------

export interface OptionSnapshot {
  greeks?: { delta?: number; gamma?: number; theta?: number; vega?: number };
  impliedVolatility?: number;
  latestQuote?: { bp?: number; ap?: number };
  [key: string]: unknown;
}

export interface Position {
  symbol: string;
  asset_class?: string;
  qty?: string;
  side?: string;
  avg_entry_price?: string;
  current_price?: string;
  market_value?: string;
  unrealized_pl?: string;
  unrealized_plpc?: string;
  snapshot: OptionSnapshot | null;
  snapshot_error: string | null;
  [key: string]: unknown;
}

export interface PositionsResponse {
  positions: Position[];
  broker: { enabled: boolean; connected: boolean; error: string | null };
}

// ---- portfolio -----------------------------------------------------------

export interface PortfolioHistory {
  timestamp: number[];
  equity: number[];
  profit_loss: number[];
  profit_loss_pct: number[];
  base_value: number;
  timeframe: string;
}

export interface PortfolioResponse {
  account: Record<string, unknown> | null;
  portfolio_history: PortfolioHistory | null;
  equity_curve_tail: EquityPoint[];
  broker_error: string | null;
}

// ---- proposals / decisions ------------------------------------------------

export interface ProposalListRow {
  id: number;
  ts: string;
  underlying: string;
  status: string;
  has_arguments: boolean;
  has_verdict: boolean;
  is_mock: boolean;
}

export interface ProposalDetail {
  id: number;
  ts: string;
  underlying: string;
  status: string;
  intent: Record<string, unknown>;
  evidence: Record<string, unknown> | null;
  arguments: Record<string, unknown> | null;
  verdict: Record<string, unknown> | null;
  plan: Record<string, unknown> | null;
  error: string | null;
}

export interface OrderRow {
  id: number;
  proposal_id: number;
  client_order_id: string;
  submitted_at: string;
  status: string;
  request: Record<string, unknown>;
  response: Record<string, unknown> | null;
  filled_qty: number | null;
  filled_avg_price: number | null;
  error: string | null;
}

export interface ProposalDetailResponse {
  proposal: ProposalDetail;
  orders: OrderRow[];
}

// ---- risk events -----------------------------------------------------------

export interface RiskEvent {
  ts: string;
  proposal_id: number | null;
  rule: string;
  detail: Record<string, unknown>;
}

// ---- chat --------------------------------------------------------------

export interface ChatToolCall {
  name: string;
  args: Record<string, unknown>;
  risk: string | null;
}

export interface ChatAnswer {
  answer: string;
  tool_calls: ChatToolCall[];
  warnings: string[];
}

// ---- calls ---------------------------------------------------------------

export const getStatus = () => request<StatusResponse>("/api/status");

export const getAgentRuns = (limit = 50) =>
  request<{ runs: AgentRun[] }>(`/api/agent-runs?limit=${limit}`);

export const getPositions = () => request<PositionsResponse>("/api/positions");

export const getPortfolio = (period = "1M", timeframe = "1D") =>
  request<PortfolioResponse>(
    `/api/portfolio?period=${encodeURIComponent(period)}&timeframe=${encodeURIComponent(timeframe)}`
  );

export const getProposals = (limit = 50, status?: string) =>
  request<{ proposals: ProposalListRow[] }>(
    `/api/proposals?limit=${limit}${status ? `&status_filter=${encodeURIComponent(status)}` : ""}`
  );

export const getProposal = (id: number) =>
  request<ProposalDetailResponse>(`/api/proposals/${id}`);

export const getOrders = (limit = 50) =>
  request<{ orders: OrderRow[] }>(`/api/orders?limit=${limit}`);

export const getRiskEvents = (limit = 50) =>
  request<{ risk_events: RiskEvent[] }>(`/api/risk-events?limit=${limit}`);

export const postChat = (question: string) =>
  request<ChatAnswer>("/api/chat", { method: "POST", body: JSON.stringify({ question }) });
