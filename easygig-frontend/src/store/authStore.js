import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      // Dati temporanei durante la registrazione multi-step
      registrationData: null,
      
      setRegistrationData: (data) => set({ registrationData: data }),
      
      clearRegistrationData: () => set({ registrationData: null }),
      
      // Stato autenticazione reale
      user: null,
      token: null,
      _hasHydrated: false,
      
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      
      login: (user, token) => {
        set({ user, token });
      },
      
      logout: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: 'easygig-auth-storage',
      onRehydrateStorage: () => (state, error) => {
        if (!error && state) {
          state.setHasHydrated(true);
        }
      },
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['_hasHydrated'].includes(key))
        ),
    }
  )
);
