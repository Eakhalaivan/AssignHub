import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (n) => set(s => ({
    notifications: [{ ...n, id: Date.now(), read: false }, ...s.notifications],
    unreadCount: s.unreadCount + 1,
  })),
  markAllRead: () => set(s => ({
    notifications: s.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),
}));

export default useNotificationStore;