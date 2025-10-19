import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

// Expenses API
export const expensesAPI = {
  getAllExpenses: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },

  addExpense: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  deleteExpense: async (expenseId) => {
    const response = await api.delete(`/expenses/${expenseId}`);
    return response.data;
  },
};

// Chores API
export const choresAPI = {
  getAllChores: async () => {
    const response = await api.get('/chores');
    return response.data;
  },

  addChore: async (choreData) => {
    const response = await api.post('/chores', choreData);
    return response.data;
  },

  toggleChore: async (choreId) => {
    const response = await api.patch(`/chores/${choreId}/toggle`);
    return response.data;
  },

  deleteChore: async (choreId) => {
    const response = await api.delete(`/chores/${choreId}`);
    return response.data;
  },
};

// Users API (for testing)
export const usersAPI = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
};

export default api;