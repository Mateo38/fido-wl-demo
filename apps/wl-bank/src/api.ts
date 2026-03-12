const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
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
  // Auth
  login: (email: string, password: string) =>
    request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<any>('/auth/me'),
  changePassword: (new_password: string) =>
    request<any>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ new_password }),
    }),

  // FIDO
  fidoRegistrationOptions: () =>
    request<any>('/fido/registration/options', { method: 'POST' }),
  fidoRegistrationVerify: (data: any) =>
    request<any>('/fido/registration/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  fidoAuthenticationOptions: () =>
    request<any>('/fido/authentication/options', { method: 'POST' }),
  fidoAuthenticationVerify: (data: any) =>
    request<any>('/fido/authentication/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getPasskeys: () => request<any>('/fido/passkeys'),
  deletePasskey: (id: string) =>
    request<any>(`/fido/passkeys/${id}`, { method: 'DELETE' }),

  // Banking
  getAccounts: () => request<any>('/accounts'),
  getTransactions: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/transactions${qs}`);
  },
  getCards: () => request<any>('/cards'),
  getBeneficiaries: () => request<any>('/beneficiaries'),
  createBeneficiary: (data: any) =>
    request<any>('/beneficiaries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteBeneficiary: (id: string) =>
    request<any>(`/beneficiaries/${id}`, { method: 'DELETE' }),
  createTransfer: (data: any) =>
    request<any>('/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Onboarding
  register: (data: { first_name: string; last_name: string; email: string }) =>
    request<any>('/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
