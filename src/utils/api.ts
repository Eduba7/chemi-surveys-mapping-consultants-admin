// Central API client that connects to the live Chemi Surveys & Mapping
// Consultants backend (Express + tRPC on Render/Railway).
// Set VITE_API_URL in your .env to your deployed backend URL.

const DEFAULT_LIVE_SITE_URL = 'https://chemi-surveys-and-mapping-consultants.vercel.app';

export function getApiBaseUrl() {
  return (
    localStorage.getItem('csmc_api_url_override') ||
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? 'http://localhost:4000' : '')
  ).replace(/\/+$/, '');
}

export function getLiveSiteUrl() {
  return localStorage.getItem('csmc_site_url_override') || import.meta.env.VITE_LIVE_SITE_URL || DEFAULT_LIVE_SITE_URL;
}

function getToken() {
  return localStorage.getItem('csmc_admin_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const base = getApiBaseUrl();
  if (!base) throw new Error('VITE_API_URL is not configured for this deployment.');
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// tRPC batch endpoint helper
async function trpc<T>(
  procedure: string,
  input: unknown = {},
  method: 'query' | 'mutation' = 'query'
): Promise<T> {
  if (method === 'query') {
    const encoded = encodeURIComponent(JSON.stringify(input));
    const data = await request<any>(
      `/trpc/${procedure}?input=${encoded}`,
      { method: 'GET' }
    );
    if (data.error) throw new Error(data.error.message || 'tRPC error');
    return data.result?.data ?? data;
  } else {
    const data = await request<any>(`/trpc/${procedure}`, {
      method: 'POST',
      body: JSON.stringify({ json: input }),
    });
    if (data?.error || data?.[0]?.error) {
      const msg = data?.error?.message || data?.[0]?.error?.message || 'tRPC error';
      throw new Error(msg);
    }
    return data?.result?.data ?? data?.[0]?.result?.data ?? data;
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    login: (email: string, password: string) =>
      trpc<{ token: string; user: any }>('auth.login', { email, password }, 'mutation'),
    me: () => trpc<any>('auth.me', {}),
    staffDirectory: () => trpc<any[]>('auth.staffDirectory', {}),
  },

  // ── Users / Staff ────────────────────────────────────────────────────────
  users: {
    getAll: () => request<any[]>('/api/users'),
    create: (data: any) => request<any>('/api/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/api/users/${id}`, { method: 'DELETE' }),
  },

  // ── Clients ──────────────────────────────────────────────────────────────
  clients: {
    getAll: () => trpc<any[]>('clients.getAll', {}),
    create: (data: any) => trpc<any>('clients.create', data, 'mutation'),
    update: (data: any) => trpc<any>('clients.update', data, 'mutation'),
    delete: (id: number) => trpc<any>('clients.delete', { id }, 'mutation'),
  },

  // ── Services ─────────────────────────────────────────────────────────────
  services: {
    getAll: () => trpc<any[]>('service.getAll', {}),
    create: (data: any) => trpc<any>('service.create', data, 'mutation'),
    update: (data: any) => trpc<any>('service.update', data, 'mutation'),
    delete: (id: number) => trpc<any>('service.delete', { id }, 'mutation'),
  },

  // ── Projects ─────────────────────────────────────────────────────────────
  projects: {
    getGrid: () => trpc<any[]>('projects.getGrid', {}),
    upsertSlot: (data: any) => trpc<any>('projects.upsertSlot', data, 'mutation'),
    clearSlot: (slotIndex: number) => trpc<any>('projects.clearSlot', { slotIndex }, 'mutation'),
  },

  // ── Consultations ────────────────────────────────────────────────────────
  consultations: {
    getAll: () => trpc<any[]>('consultation.getAll', {}),
    getToday: () => trpc<any[]>('consultation.getToday', {}),
    getUpcoming: () => trpc<any[]>('consultation.getUpcoming', {}),
    create: (data: any) => trpc<any>('consultation.create', data, 'mutation'),
    updateStatus: (id: number, status: string) =>
      trpc<any>('consultation.updateStatus', { id, status }, 'mutation'),
    delete: (id: number) => trpc<any>('consultation.delete', { id }, 'mutation'),
    stats: () => trpc<any>('consultation.stats', {}),
  },

  // ── Site settings (contact, logo, hero) ──────────────────────────────────
  settings: {
    get: () => request<any>('/api/settings'),
    update: (data: any) => request<any>('/api/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  },

  // ── Health check ─────────────────────────────────────────────────────────
  health: () => request<any>('/health'),
};
