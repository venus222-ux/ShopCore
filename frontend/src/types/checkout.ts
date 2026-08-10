// src/types/checkout.ts

export interface CheckoutAddressSelection {
  address_id?: number;

  company_name?: string;
  vat_number?: string;

  address_line_1?: string;
  address_line_2?: string;

  city?: string;
  state?: string;

  postal_code?: string;
  country?: string;
}

export interface CheckoutForm {
  billing: CheckoutAddressSelection;
  shipping: CheckoutAddressSelection;

  sameAsBilling: boolean;

  shipping_method_id?: number;

  save_to_profile: boolean;

  coupon_code?: string;
}


// types/checkout.ts
export interface BillingData {
  first_name: string;
  last_name: string;
  company_name?: string;
  vat_number?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
  delivery_instructions?: string;
}

export const emptyBillingData: BillingData = {
  first_name: "",
  last_name: "",
  company_name: "",
  vat_number: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  phone: "",
  delivery_instructions: "",
};