import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medchain_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const loginUser = (data) => api.post('/auth/login', data).then(r => r.data);
export const registerUser = (data) => api.post('/auth/register', data).then(r => r.data);
export const getMe = () => api.get('/auth/me').then(r => r.data);
export const setup2FA = () => api.get('/auth/setup-2fa').then(r => r.data);
export const verify2FA = (data) => api.post('/auth/verify-2fa', data).then(r => r.data);
export const login2FA = (data) => api.post('/auth/login-2fa', data).then(r => r.data);

// Patients
export const fetchPatients = () => api.get('/patients').then(r => r.data);
export const createPatient = (data) => api.post('/patients', data).then(r => r.data);
export const getPatient = (id) => api.get(`/patients/${id}`).then(r => r.data);

// Vitals
export const submitVitals = (data) => api.post('/vitals', data).then(r => r.data);
export const getVitals = (patientId) => api.get(`/vitals/${patientId}`).then(r => r.data);

// Appointments
export const getAppointments = () => api.get('/appointments').then(r => r.data);
export const requestAppointment = (data) => api.post('/appointments/request', data).then(r => r.data);
export const approveAppointment = (id) => api.put(`/appointments/${id}/approve`).then(r => r.data);
export const cancelAppointment = (id) => api.put(`/appointments/${id}/cancel`).then(r => r.data);

// Risk
export const analyzeRisk = (data) => api.post('/risk/analyze', data).then(r => r.data);
export const getRiskLogs = (patientId) => api.get(`/risk/logs/${patientId}`).then(r => r.data);

// Blockchain
export const storeOnBlockchain = (data) => api.post('/blockchain/store', data).then(r => r.data);

// Alerts
export const sendEmailAlert = (data) => api.post('/alerts/send', data).then(r => r.data);

// Chatbot
export const sendChatMessage = (data) => api.post('/chatbot/message', data).then(r => r.data);
export const getChatHistory = (patientId) => api.get(`/chatbot/history/${patientId}`).then(r => r.data);

// Reports
export const downloadReport = (patientId) => {
  return api.get(`/reports/${patientId}`, { responseType: 'blob' }).then(res => {
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `MedChain_Report_${patientId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  });
};

// Analytics
export const getAnalytics = () => api.get('/analytics/dashboard').then(r => r.data);

export default api;
