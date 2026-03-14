import { create } from "zustand";

interface UpgradeStore {
  isOpen: boolean;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
}

export const useUpgradeStore = create<UpgradeStore>((set) => ({
  isOpen: false,
  openUpgradeModal: () => set({ isOpen: true }),
  closeUpgradeModal: () => set({ isOpen: false }),
}));
