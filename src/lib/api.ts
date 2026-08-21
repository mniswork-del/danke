const API_BASE_URL = '/api';

// Auth API
export const authApi = {
  register: async (phone_number: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ phone_number, password }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  login: async (phone_number: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ phone_number, password }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  logout: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// Profile API - NEW: Sync and update profile data to database
export const profileApi = {
  sync: async (profileData: any) => {
    const res = await fetch(`${API_BASE_URL}/profile/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(profileData),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  get: async () => {
    const res = await fetch(`${API_BASE_URL}/profile/get`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  update: async (profileData: any) => {
    const res = await fetch(`${API_BASE_URL}/profile/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(profileData),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// Paper API
export const paperApi = {
  getAllPapers: async () => {
    const res = await fetch(`${API_BASE_URL}/papers`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getPaperById: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/papers/${id}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  uploadPaper: async (formData: FormData) => {
    const res = await fetch(`${API_BASE_URL}/papers/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  downloadPaper: async (paperId: string) => {
    const res = await fetch(`${API_BASE_URL}/papers/${paperId}/download`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.blob();
  },

  viewPaper: async (paperId: string) => {
    const res = await fetch(`${API_BASE_URL}/papers/${paperId}/view`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getMyPapers: async () => {
    const res = await fetch(`${API_BASE_URL}/papers/my-papers`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  searchPapers: async (query: string) => {
    const res = await fetch(`${API_BASE_URL}/papers/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  reportPaper: async (paperId: string, reason: string, description: string) => {
    const res = await fetch(`${API_BASE_URL}/papers/${paperId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason, description }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// Admin API
export const adminApi = {
  getPendingPapers: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/pending-papers`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  approvePaper: async (paperId: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/papers/${paperId}/approve`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  rejectPaper: async (paperId: string, reason: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/papers/${paperId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ rejection_reason: reason }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getReports: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/reports`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  resolveReport: async (reportId: string, resolution: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ resolution }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getPayments: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/payments`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  processPayment: async (userId: string, amount: number) => {
    const res = await fetch(`${API_BASE_URL}/admin/payments/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ user_id: userId, amount }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/audit-logs`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  suspendUser: async (userId: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/suspend`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  activateUser: async (userId: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/activate`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
