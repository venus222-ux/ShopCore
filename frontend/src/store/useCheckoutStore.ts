// src/store/useCheckoutStore.ts

import { create } from "zustand";
import { CheckoutForm } from "../types/checkout";

interface CheckoutState {
  checkout: CheckoutForm;

  setBilling: (billing: CheckoutForm["billing"]) => void;

  setShipping: (shipping: CheckoutForm["shipping"]) => void;

  setSameAsBilling: (value: boolean) => void;

  setShippingMethod: (id: number) => void;

  setCoupon: (code: string) => void;

  setSaveToProfile: (value: boolean) => void;

  resetCheckout: () => void;
}

const initialState: CheckoutForm = {
  billing: {},
  shipping: {},

  sameAsBilling: true,

  save_to_profile: true,

  coupon_code: "",
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  checkout: initialState,

  setBilling: (billing) =>
    set((state) => ({
      checkout: {
        ...state.checkout,
        billing,
      },
    })),

  setShipping: (shipping) =>
    set((state) => ({
      checkout: {
        ...state.checkout,
        shipping,
      },
    })),

  setSameAsBilling: (sameAsBilling) =>
    set((state) => ({
      checkout: {
        ...state.checkout,
        sameAsBilling,
      },
    })),

  setShippingMethod: (shipping_method_id) =>
    set((state) => ({
      checkout: {
        ...state.checkout,
        shipping_method_id,
      },
    })),

  setCoupon: (coupon_code) =>
    set((state) => ({
      checkout: {
        ...state.checkout,
        coupon_code,
      },
    })),

  setSaveToProfile: (save_to_profile) =>
    set((state) => ({
      checkout: {
        ...state.checkout,
        save_to_profile,
      },
    })),

  resetCheckout: () =>
    set({
      checkout: initialState,
    }),
}));