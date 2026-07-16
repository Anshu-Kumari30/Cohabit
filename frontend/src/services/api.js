import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(err);
  }
);

// ─── Auth API ───
export const authAPI = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  demoLogin: async () => {
    const res = await api.post('/auth/demo-login');
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.patch('/users/me', data);
    return res.data;
  },
  googleLogin: async (credential) => {
    const res = await api.post('/auth/google', { credential });
    return res.data;
  },
};

// ─── Expenses API ───
export const expensesAPI = {
  getAllExpenses: async () => {
    const res = await api.get('/expenses');
    return res.data;
  },
  addExpense: async (expenseData) => {
    const res = await api.post('/expenses', expenseData);
    return res.data;
  },
  deleteExpense: async (expenseId) => {
    const res = await api.delete(`/expenses/${expenseId}`);
    return res.data;
  },
  getAnalytics: async (range = '30d') => {
    const res = await api.get(`/expenses/analytics?range=${range}`);
    return res.data;
  },
};

// ─── Chores API ───
export const choresAPI = {
  getAllChores: async () => {
    const res = await api.get('/chores');
    return res.data;
  },
  addChore: async (choreData) => {
    const res = await api.post('/chores', choreData);
    return res.data;
  },
  toggleChore: async (choreId) => {
    const res = await api.patch(`/chores/${choreId}/toggle`);
    return res.data;
  },
  deleteChore: async (choreId) => {
    const res = await api.delete(`/chores/${choreId}`);
    return res.data;
  },
};

// ─── Users API ───
export const usersAPI = {
  getAllUsers: async () => {
    const res = await api.get('/users');
    return res.data;
  },
};

// ─── Balances API ───
export const balancesAPI = {
  getBalances: async () => {
    const res = await api.get('/balances');
    return res.data;
  },
};

// ─── Settlements API ───
export const settlementsAPI = {
  getAll: async () => {
    const res = await api.get('/settlements');
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/settlements', data);
    return res.data;
  },
};

// ─── Shopping List API ───
export const shoppingAPI = {
  getAll: async () => {
    const res = await api.get('/shopping-items');
    return res.data;
  },
  add: async (data) => {
    const res = await api.post('/shopping-items', data);
    return res.data;
  },
  toggle: async (id, checkedBy) => {
    const res = await api.patch(`/shopping-items/${id}/toggle`, { checkedBy });
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/shopping-items/${id}`);
    return res.data;
  },
};

// ─── Notifications API ───
export const notificationsAPI = {
  getAll: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },
  markRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
};

// ─── Houses API ───
export const housesAPI = {
  create: async (data) => {
    const res = await api.post('/houses', data);
    return res.data;
  },
  getMyHouse: async () => {
    const res = await api.get('/houses/my-house');
    return res.data;
  },
  join: async (inviteCode) => {
    const res = await api.post(`/houses/join/${inviteCode}`);
    return res.data;
  },
};

// ─── Upload API ───
export const uploadAPI = {
  uploadReceipt: async (file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    const res = await api.post('/upload/receipt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export default api;