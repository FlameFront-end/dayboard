import { format } from 'date-fns';
import { create } from 'zustand';

type AppState = {
  selectedDate: string;
  followToday: boolean;
  isSettingsOpen: boolean;
  activeReminderTaskId?: string;
  setSelectedDate: (date: string, followToday?: boolean) => void;
  setSettingsOpen: (isOpen: boolean) => void;
  setActiveReminderTaskId: (taskId?: string) => void;
  syncTodayDate: (now: Date) => void;
};

function getTodayDate(now: Date): string {
  return format(now, 'yyyy-MM-dd');
}

export const useAppStore = create<AppState>((set) => ({
  selectedDate: getTodayDate(new Date()),
  followToday: true,
  isSettingsOpen: false,
  activeReminderTaskId: undefined,
  setSelectedDate: (date, followToday = false) => {
    set({
      selectedDate: date,
      followToday
    });
  },
  setSettingsOpen: (isSettingsOpen) => {
    set({ isSettingsOpen });
  },
  setActiveReminderTaskId: (activeReminderTaskId) => {
    set({ activeReminderTaskId });
  },
  syncTodayDate: (now) => {
    set((state) =>
      state.followToday
        ? {
            selectedDate: getTodayDate(now)
          }
        : state
    );
  }
}));
