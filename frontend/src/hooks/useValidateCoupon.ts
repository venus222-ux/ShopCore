import { useMutation } from "@tanstack/react-query";
import API from "../api";

interface CouponValidateResponse {
  valid: boolean;
  discount?: number;
  message?: string;
}

export const useValidateCoupon = () => {
  return useMutation<CouponValidateResponse, unknown, { code: string; subtotal: number }>({
    mutationFn: async ({ code, subtotal }) =>
      (await API.post("/coupons/validate", { code, subtotal })).data,
  });
};