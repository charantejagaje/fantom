/**
 * Platform API client - the ONLY place the platform UI touches the backend.
 * Base URL comes from env (VITE_API_BASE_URL); empty means same-origin (proxied).
 *
 * Auth: JWT bearer token in localStorage (fantom.auth). All requests attach it
 * when present; 401 responses clear the session so the UI returns to login.
 */

const BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? '/api/v1';
const AUTH_KEY = 'fantom.auth';

export interface AuthUser {
  id: number;
  email: string;
  full_name: string | null;
  role: 'worker' | 'engineer' | 'owner';
  email_verified: boolean;
  assigned_station: string | null;
  created_at: string;
}

export const authStore = {
  get(): { token: string; user: AuthUser } | null {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set(token: string, user: AuthUser) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ token, user }));
  },
  clear() {
    localStorage.removeItem(AUTH_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function authHeaders(): Record<string, string> {
  const a = authStore.get();
  return a ? { Authorization: `Bearer ${a.token}` } : {};
}

async function handle(res: Response, path: string): Promise<any> {
  if (res.status === 401) {
    authStore.clear();
    throw new ApiError(401, 'Session expired - please log in again.');
  }
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail ?? body);
    } catch {
      detail = await res.text().catch(() => '');
    }
    throw new ApiError(res.status, `${path} -> HTTP ${res.status}${detail ? `: ${detail.slice(0, 240)}` : ''}`);
  }
  return res.json();
}

async function get<T = any>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { ...authHeaders() } });
  return handle(res, path);
}

async function post<T = any>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return handle(res, path);
}

async function patch<T = any>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  return handle(res, path);
}

export const api = {
  // health is public (no auth required)
  health: () => get<any>('/health'),

  // ---- auth ----
  register: (payload: {
    full_name: string;
    email: string;
    password: string;
    role: string;
    assigned_station?: string;
    invite_code?: string;
  }) => post<AuthUser>('/auth/register', payload),
  verifyEmail: (token: string) => post<{ status: string }>('/auth/verify-email', { token }),
  resendVerification: (email: string) =>
    post<{ status: string }>('/auth/resend-verification', { email }),
  login: (email: string, password: string) =>
    post<{ access_token: string; user: AuthUser }>('/auth/login', { email, password }),
  forgotPassword: (email: string) => post<{ status: string }>('/auth/forgot-password', { email }),
  resetPassword: (token: string, new_password: string) =>
    post<{ status: string }>('/auth/reset-password', { token, new_password }),
  me: () => get<AuthUser>('/auth/me'),
  users: () => get<{ count: number; users: AuthUser[] }>('/auth/users'),
  promote: (email: string, role: string, assigned_station?: string) =>
    post<AuthUser>('/auth/users/promote', { email, role, assigned_station }),

  // ---- data / analytics (authenticated) ----
  datasets: () => get<any[]>('/dataset'),
  dataset: (name: string) => get<any>(`/dataset/${encodeURIComponent(name)}`),
  analytics: () => get<any>('/analytics'),
  production: () => get<any>('/production'),
  bottlenecks: () => get<any>('/bottlenecks'),
  associations: () => get<any>('/associations'),
  anomalies: (threshold = 3.5) => post<any>('/anomalies', { threshold_z: threshold }),
  variableValues: (v: string, limit = 3000) =>
    get<any>(`/variables/${encodeURIComponent(v)}/values?limit=${limit}`),
  ml: () => get<any>('/ml'),
  mlPredict: (model_name: string, features: Record<string, number>) =>
    post<any>('/ml/predict', { model_name, features }),
  friendCapabilities: () => get<any>('/friend-feature/capabilities'),

  // ---- engineer+ ----
  simulation: (wip_multipliers: Record<string, number>, label?: string) =>
    post<any>('/simulation', { wip_multipliers, label }),
  recommendations: () => get<any>('/recommendations'),
  createRecommendation: (analysis_type: string) => post<any>('/recommendations', { analysis_type }),

  // ---- operations (alerts / issues) ----
  alerts: () => get<{ count: number; alerts: any[] }>('/alerts'),
  refreshAlerts: () => post<{ count: number; alerts: any[] }>('/alerts/refresh'),
  issues: () => get<{ count: number; issues: any[] }>('/issues'),
  createIssue: (message: string, station?: string, severity = 'warning') =>
    post<any>('/issues', { message, station, severity }),
  updateIssue: (id: number, status: string, resolution_note?: string) =>
    patch<any>(`/issues/${id}`, { status, resolution_note }),
};

export const fmt = (v: unknown, d = 0): string =>
  typeof v === 'number' ? v.toLocaleString(undefined, { maximumFractionDigits: d }) : '—';

export const NA = 'Not available in current dataset';
