import { useQuery } from "@tanstack/react-query";
import API from "../api";
import { ShippingMethod } from "../types";

export const useShippingMethods = (enabled: boolean) => {
  return useQuery<ShippingMethod[]>({
    queryKey: ["shipping-methods"],
    queryFn: async () => (await API.get("/shipping-methods")).data,
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};
