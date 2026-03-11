const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  login: (email: string, password: string) =>
    request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getDashboard: () => request<any>('/admin/dashboard'),
  getUsers: () => request<any>('/admin/users'),
  getLogs: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/admin/logs${qs}`);
  },
  getHealth: () => request<any>('/health'),
  getClients: () => request<any>('/clients'),
  createClient: (data: { email: string; first_name: string; last_name: string; phone?: string }) =>
    request<any>('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClientStatus: (id: string, status: 'active' | 'blocked') =>
    request<any>(`/clients/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  resetClientPassword: (id: string) =>
    request<any>(`/clients/${id}/reset-password`, { method: 'PATCH' }),
  deleteClient: (id: string) =>
    request<any>(`/clients/${id}`, { method: 'DELETE' }),
  verifyAdminPassword: (password: string) =>
    request<any>('/admin/verify-password', { method: 'POST', body: JSON.stringify({ password }) }),
  getClientPasskeys: (clientId: string) =>
    request<any>(`/clients/${clientId}/passkeys`),
  updatePasskeyStatus: (clientId: string, passkeyId: string, status: 'active' | 'blocked') =>
    request<any>(`/clients/${clientId}/passkeys/${passkeyId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  revokePasskey: (clientId: string, passkeyId: string) =>
    request<any>(`/clients/${clientId}/passkeys/${passkeyId}`, { method: 'DELETE' }),
};
