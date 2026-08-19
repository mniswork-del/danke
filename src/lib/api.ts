import { PaperItem, User } from '../types';

const API_BASE = '/api';

// Token Management for User & Admin Sessions
const TOKEN_KEYS = {
  USER: 'universitytree_user_token',
  ADMIN: 'universitytree_admin_token',
};

export function getUserToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEYS.USER);
}

export function setUserToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEYS.USER, token);
  } else {
    localStorage.removeItem(TOKEN_KEYS.USER);
  }
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEYS.ADMIN);
}

export function setAdminToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEYS.ADMIN, token);
  } else {
    localStorage.removeItem(TOKEN_KEYS.ADMIN);
  }
}

// Request Helper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  // Attach user or admin token if present
  const userToken = getUserToken();
  const adminToken = getAdminToken();

  if (endpoint.startsWith('/admin')) {
    if (adminToken) {
      headers.set('Authorization', `Bearer ${adminToken}`);
    }
  } else {
    if (userToken) {
      headers.set('Authorization', `Bearer ${userToken}`);
    }
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({
    success: false,
    error: `HTTP Error: ${response.status} ${response.statusText}`,
  }));

  if (!response.ok || data.success === false) {
    throw new Error(data.error || 'An unexpected error occurred.');
  }

  return data as T;
}

// ========================================================
// 1. USER AUTHENTICATION API
// ========================================================
export const authApi = {
  async register(phone_number: string, password: string) {
    const res = await request<{
      success: boolean;
      token: string;
      user: any;
      message: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phone_number, password }),
    });

    if (res.token) {
      setUserToken(res.token);
    }
    return res;
  },

  async login(phone_number: string, password: string) {
    const res = await request<{
      success: boolean;
      token: string;
      user: any;
      message: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone_number, password }),
    });

    if (res.token) {
      setUserToken(res.token);
    }
    return res;
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {}
    setUserToken(null);
  },

  async getMe() {
    if (!getUserToken()) return null;
    try {
      const res = await request<{ success: boolean; user: any }>('/auth/me');
      return res.user;
    } catch (e) {
      setUserToken(null);
      return null;
    }
  },
};

// ========================================================
// 2. USER PROFILE API
// ========================================================
export const profileApi = {
  async getProfile() {
    const res = await request<{ success: boolean; user: any }>('/profile');
    return res.user;
  },

  async updateProfile(profileData: {
    name?: string;
    profession?: string;
    address?: string;
    city?: string;
    email?: string;
    age?: number | null;
  }) {
    const res = await request<{
      success: boolean;
      message: string;
      user: any;
    }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return res;
  },
};

// ========================================================
// 3. PAPER & REPOSITORY API
// ========================================================
export const paperApi = {
  async getPaperTypes() {
    const res = await request<{ success: boolean; types: Array<{ id: number; name: string; code: string; description: string }> }>('/paper-types');
    return res.types;
  },

  async getSubjects() {
    const res = await request<{ success: boolean; subjects: Array<{ id: number; name: string; code: string; category: string }> }>('/subjects');
    return res.subjects;
  },

  async getYears() {
    const res = await request<{ success: boolean; years: Array<{ id: number; year: number }> }>('/years');
    return res.years;
  },

  async getPapers(filters: { search?: string; type_id?: number; subject_id?: number; year_id?: number } = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.type_id) params.append('type_id', String(filters.type_id));
    if (filters.subject_id) params.append('subject_id', String(filters.subject_id));
    if (filters.year_id) params.append('year_id', String(filters.year_id));

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await request<{ success: boolean; papers: PaperItem[] }>(`/papers${qs}`);
    return res.papers;
  },

  async getUserPapers() {
    const res = await request<{ success: boolean; papers: PaperItem[] }>('/user/papers');
    return res.papers;
  },

  async uploadPaper(formData: FormData) {
    const res = await request<{
      success: boolean;
      message: string;
      paper: any;
    }>('/papers/upload', {
      method: 'POST',
      body: formData,
    });
    return res;
  },
};

// ========================================================
// 4. ADMIN API
// ========================================================
export const adminApi = {
  async login(username: string, password: string) {
    const res = await request<{
      success: boolean;
      token: string;
      admin: any;
      message: string;
    }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (res.token) {
      setAdminToken(res.token);
    }
    return res;
  },

  async logout() {
    try {
      await request('/admin/logout', { method: 'POST' });
    } catch {}
    setAdminToken(null);
  },

  async getMe() {
    if (!getAdminToken()) return null;
    try {
      const res = await request<{ success: boolean; admin: any }>('/admin/me');
      return res.admin;
    } catch (e) {
      setAdminToken(null);
      return null;
    }
  },

  async getDashboard() {
    const res = await request<{
      success: boolean;
      stats: {
        totalUsers: number;
        activeUsers: number;
        suspendedUsers: number;
        totalPapers: number;
        livePapers: number;
        rejectedPapers: number;
        pendingPapers: number;
        todayUploads: number;
        weekUploads: number;
        monthUploads: number;
      };
      recentUploads: any[];
    }>('/admin/dashboard');
    return res;
  },

  async getUsers() {
    const res = await request<{ success: boolean; users: any[] }>('/admin/users');
    return res.users;
  },

  async getUserPapers(userId: number | string) {
    const res = await request<{ success: boolean; papers: any[] }>(`/admin/users/${userId}/papers`);
    return res.papers;
  },

  async getPapers(filters: {
    date_filter?: string;
    status?: string;
    subject_id?: number;
    year_id?: number;
    type_id?: number;
    search?: string;
  } = {}) {
    const params = new URLSearchParams();
    if (filters.date_filter) params.append('date_filter', filters.date_filter);
    if (filters.status) params.append('status', filters.status);
    if (filters.subject_id) params.append('subject_id', String(filters.subject_id));
    if (filters.year_id) params.append('year_id', String(filters.year_id));
    if (filters.type_id) params.append('type_id', String(filters.type_id));
    if (filters.search) params.append('search', filters.search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await request<{ success: boolean; papers: any[] }>(`/admin/papers${qs}`);
    return res.papers;
  },

  async rejectPaper(paperId: number | string, rejection_reason: string) {
    const res = await request<{ success: boolean; message: string }>(`/admin/papers/${paperId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejection_reason }),
    });
    return res;
  },

  async suspendUser(userId: number | string) {
    const res = await request<{ success: boolean; message: string }>(`/admin/users/${userId}/suspend`, {
      method: 'POST',
    });
    return res;
  },

  async activateUser(userId: number | string) {
    const res = await request<{ success: boolean; message: string }>(`/admin/users/${userId}/activate`, {
      method: 'POST',
    });
    return res;
  },

  async getReports() {
    const res = await request<{ success: boolean; summary: any; userReports: any[] }>('/admin/reports');
    return res;
  },

  async getLogs() {
    const res = await request<{ success: boolean; logs: any[] }>('/admin/logs');
    return res.logs;
  },
};
