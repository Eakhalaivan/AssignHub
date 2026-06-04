import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(persist(
  (set) => ({
    user: null,
    setAuth: (user, accessToken, refreshToken) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ user });
    },
    logout: () => {
      localStorage.clear();
      set({ user: null });
    },
  }),
  { name: 'academix-auth', partialize: s => ({ user: s.user }) }
));

export default useAuthStore;