import { create } from "zustand";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  product_id: number;
  updated_at: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;

  addNotification: (n: NotificationItem) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (n) =>
    set((state) => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  clear: () => set({ notifications: [], unreadCount: 0 }),
}));
