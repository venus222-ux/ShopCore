import { useQuery } from "@tanstack/react-query";
import API from "../api";
import { useStore } from "../store/useStore";

export interface Address {
  id: number;
  type: "billing" | "shipping";
  label?: string | null;
  company_name?: string | null;
  vat_number?: string | null;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state?: string | null;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export const useAddresses = (type?: "billing" | "shipping") => {
  const token = useStore((state) => state.token);

  return useQuery<Address[]>({
    queryKey: ["addresses", type],
    queryFn: async () =>
      (await API.get("/addresses", { params: { type } })).data,
    enabled: !!token, // ⭐ nu trage deloc fără token — evită 401 → refresh → hard redirect
    staleTime: 1000 * 60,
  });
};