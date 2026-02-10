import { create } from 'zustand';

interface NetworkState {
  isOnline: boolean;
  pendingSyncCount: number;
  setOnline: (val: boolean) => void;
  setPendingSyncCount: (count: number) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingSyncCount: 0,
  setOnline: (val) => set({ isOnline: val }),
  setPendingSyncCount: (count) => set({ pendingSyncCount: count }),
}));
