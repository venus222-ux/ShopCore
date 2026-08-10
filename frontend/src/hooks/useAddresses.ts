import { useQuery } from "@tanstack/react-query";
import API from "../api";

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
  return useQuery<Address[]>({
    queryKey: ["addresses", type],
    queryFn: async () =>
      (await API.get("/addresses", { params: { type } })).data,
    staleTime: 1000 * 60, // 1 min - address book changes rarely mid-session
  });
};