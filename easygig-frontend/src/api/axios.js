import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // API Gateway
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor per aggiungere il token JWT se presente
api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('easygig-auth-storage');
  if (authData) {
    try {
      const { state } = JSON.parse(authData);
      if (state && state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (e) {
      console.error("Errore parsing auth storage:", e);
    }
  }
  return config;
});

export default api;
