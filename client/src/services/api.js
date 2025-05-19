// client/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Criar instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratar erros de autenticação (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Serviços de pacientes
export const patientService = {
  getPatients: async (params) => {
    const response = await api.get('/patients', { params });
    return response.data;
  },
  
  getPatient: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },
  
  createPatient: async (patientData) => {
    const response = await api.post('/patients', patientData);
    return response.data;
  },
  
  updatePatient: async (id, patientData) => {
    const response = await api.put(`/patients/${id}`, patientData);
    return response.data;
  },
  
  deletePatient: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },
  
  getMedicalHistory: async (id) => {
    const response = await api.get(`/patients/${id}/medical-history`);
    return response.data;
  },
};

// Serviços de prontuários médicos
export const medicalRecordService = {
  getPatientRecords: async (patientId) => {
    const response = await api.get(`/medical-records/patient/${patientId}`);
    return response.data;
  },
  
  getRecord: async (id) => {
    const response = await api.get(`/medical-records/${id}`);
    return response.data;
  },
  
  createRecord: async (recordData) => {
    const response = await api.post('/medical-records', recordData);
    return response.data;
  },
  
  updateRecord: async (id, recordData) => {
    const response = await api.put(`/medical-records/${id}`, recordData);
    return response.data;
  },
  
  deleteRecord: async (id) => {
    const response = await api.delete(`/medical-records/${id}`);
    return response.data;
  },
  
  addEvolution: async (id, content) => {
    const response = await api.post(`/medical-records/${id}/evolution`, { content });
    return response.data;
  },
  
  addAttachment: async (id, attachmentData) => {
    const response = await api.post(`/medical-records/${id}/attachments`, attachmentData);
    return response.data;
  },
};

// Serviços de agendamentos
export const appointmentService = {
  getAppointments: async (params) => {
    const response = await api.get('/appointments', { params });
    return response.data;
  },
  
  getAppointment: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },
  
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },
  
  updateAppointment: async (id, appointmentData) => {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response.data;
  },
  
  cancelAppointment: async (id, reason) => {
    const response = await api.put(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },
  
  confirmAppointment: async (id) => {
    const response = await api.put(`/appointments/${id}/confirm`);
    return response.data;
  },
  
  getAvailability: async (professionalId, date) => {
    const response = await api.get(`/appointments/availability/${professionalId}`, {
      params: { date }
    });
    return response.data;
  },
};

// Serviços de usuários
export const userService = {
  getUsers: async (params) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  
  changePassword: async (id, passwordData) => {
    const response = await api.put(`/users/${id}/change-password`, passwordData);
    return response.data;
  },
  
  getUserStats: async (id) => {
    const response = await api.get(`/users/${id}/stats`);
    return response.data;
  },
};

// Serviços de organização
export const organizationService = {
  getCurrentOrganization: async () => {
    const response = await api.get('/organizations/current');
    return response.data;
  },
  
  updateOrganization: async (organizationData) => {
    const response = await api.put('/organizations/current', organizationData);
    return response.data;
  },
  
  getOrganizationStats: async () => {
    const response = await api.get('/organizations/current/stats');
    return response.data;
  },
  
  getOrganizationUsers: async () => {
    const response = await api.get('/organizations/current/users');
    return response.data;
  },
  
  updateOrganizationSettings: async (settings) => {
    const response = await api.put('/organizations/current/settings', { settings });
    return response.data;
  },
};

export default api;