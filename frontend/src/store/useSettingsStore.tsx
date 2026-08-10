// src/store/useSettingsStore.ts

import { create } from "zustand";
import API from "../api";

interface SettingsState {
  vatPercent: number;
  couponsEnabled: boolean;

  codEnabled: boolean;
  codMaxOrderValue: number;
  codFee: number;

  setVatPercent: (vatPercent: number) => void;
  setCouponsEnabled: (enabled: boolean) => void;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  vatPercent: 21,
  couponsEnabled: true,

  codEnabled: true,
  codMaxOrderValue: 500,
  codFee: 0,

  setVatPercent: (vatPercent) => set({ vatPercent }),
  setCouponsEnabled: (couponsEnabled) => set({ couponsEnabled }),

  fetchSettings: async () => {
    try {
      const res = await API.get("/settings");
      set({
        vatPercent: res.data.vat_percent ?? 21,
        couponsEnabled: !!res.data.coupons_enabled,
        codEnabled: !!res.data.cod_enabled,
        codMaxOrderValue: Number(res.data.cod_max_order_value ?? 500),
        codFee: Number(res.data.cod_fee ?? 0),
      });
    } catch {
      // Fail-open: card stays available even if settings fetch hiccups.
    }
  },
}));