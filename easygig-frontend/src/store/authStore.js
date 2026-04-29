import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  // Dati temporanei durante la registrazione multi-step
  registrationData: null,
  
  setRegistrationData: (data) => set({ registrationData: data }),
  
  clearRegistrationData: () => set({ registrationData: null }),
  
  // Stato autenticazione reale
  user: null,
  token: null,
  
  login: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
