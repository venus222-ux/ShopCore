// src/types/index.ts

export type Role = "user" | "moderator" | "admin";
export type AssetType = "digital" | "physical" | "service";

/* ================= USER ================= */
export const isValidRole = (role: string): role is Role => {
  return ["user", "moderator", "admin"].includes(role);
};
export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  roles?: { name: string }[];
}

export type Props = {
  users: User[];
  onDelete: (id: number) => void;
};

/* ================= AUTH ================= */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginResponse {
  token: string;
  role: Role;
}

export interface ProfileData {
  id?: number;
  name?: string;
  email: string;
  created_at?: string;

  company_name?: string;
  vat_number?: string;

  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface BillingAddress {
  company_name?: string;
  vat_number?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface CheckoutRequest {
  items: any[];
  billing?: BillingAddress;
}

export interface FormData {
  email: string;
  password: string;
  password_confirmation: string;
  name?: string;

  company_name?: string;
  vat_number?: string;

  address_line_1?: string;
  address_line_2?: string;

  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface ProfileUpdateRequest {
  email: string;
  password?: string;
  password_confirmation?: string;
}

/* ================= GENERIC ================= */

export interface APIMessageResponse {
  message: string;
}

/* ================= CATEGORY ================= */

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
}

/* ================= SHIPPING ================= */
 

/* ================= ADMIN: ATTRIBUTES & VARIANTS ================= */

export interface AttributeValue {
  id: number;
  attribute_id: number;
  value: string;
  slug: string;
  sort_order: number;
  attribute?: Attribute;
  images?: VariantImage[]; // NEW — shared images for this value (e.g. all "Black" variants)
}

export interface Attribute {
    id: number;
    name: string;
    slug: string;

    type: "text" | "number" | "select" | "boolean";

    is_filterable: boolean;

    values: AttributeValue[];
}

// Shape returned by GET /admin/categories/{category}/attributes
export interface CategoryAttributeOption {
  id: number;
  name: string;
  slug: string;
  assigned: boolean;
}
export interface CartItem extends Product {
  quantity: number;
  variant_id?: number;
}
export interface AdminVariantAttributeValue {
  value_id: number;
  attribute_id: number;
  attribute_name: string;
  value: string;
  images?: VariantImage[]; // NEW — mirrors what the backend now sends
}

export interface AdminVariantInventory {
  track_stock: boolean;
  quantity: number;
  reserved: number;
}

export interface VariantImage {
  id: number;
  url: string;
}

export interface AttributeValue {
  id: number;
  attribute_id: number;
  value: string;
  slug: string;
  sort_order: number;
  attribute?: Attribute;
  // NOTE: no bare `images` field here anymore - images are scoped per
  // product now, so they're never attached to the global AttributeValue
  // record itself. Product-scoped images arrive only through
  // AdminProductVariant.attribute_values[].images (see below) and through
  // ProductVariant.images on the storefront.
}

export interface AdminVariantAttributeValue {
  value_id: number;
  attribute_id: number;
  attribute_name: string;
  value: string;
  images?: VariantImage[]; // product-scoped, resolved server-side per variant
}

export interface AdminProductVariant {
  id: number;
  sku: string;
  price: number | null;
  discount_percentage: number | null;
  is_default: boolean;
  attribute_values: AdminVariantAttributeValue[];
  inventory: AdminVariantInventory | null;
  images?: VariantImage[]; // resolved chain result, for admin preview
}

export interface ProductVariant {
  id: number;
  product_id?: number;
  sku: string;
  price: number;
  old_price?: number | null;
  has_discount?: boolean;
  is_default?: boolean;
  in_stock?: boolean;
  inventory?: Inventory | null;
  attribute_values: VariantAttributeValue[] | AttributeValue[];
  images?: string[]; // resolved, product-scoped image URLs
}

export interface CreateVariantPayload {
  sku?: string;
  price?: number | null;
  discount_percentage?: number | null;
  is_default?: boolean;
  attribute_value_ids: number[];
  track_stock?: boolean;
  quantity?: number;
}

/* ================= PRODUCT VARIANTS (storefront) ================= */



export interface Inventory {
  id: number;
  product_variant_id: number;
  quantity: number;
  reserved: number;
  track_stock: boolean;
}

export interface VariantAttributeValue {
  attribute_slug: string;
  attribute_name: string;
  value: string;
  value_id: number;
}

export interface ProductVariant {
  id: number;
  product_id?: number;
  sku: string;
  price: number;
  old_price?: number | null;

  has_discount?: boolean;
  is_default?: boolean;
  in_stock?: boolean;

  inventory?: Inventory | null;
  images?: string[];

  attribute_values: VariantAttributeValue[] | AttributeValue[];
}

/* ================= PRODUCT ================= */
export interface Product {
  id: number;
  title: string;
  slug: string;

  short_description: string;
  description: string;

  price: number;
  final_price: number;

  old_price?: number | null;

  discount_percentage?: number | null;
  discount_fixed?: number | null;
  effective_discount_percentage?: number;
  discount_type?: "percent" | "fixed" | null;
  discount_value?: number | null;

  discount_starts_at?: string | null;
  discount_ends_at?: string | null;

  has_discount?: boolean;
  is_new?: boolean;

  category_id: number;

  category?: {
    id: number;
    name: string;
  } | null;

  asset_type: AssetType;

  is_published: boolean;
  is_wishlisted?: boolean;

  preview_image?: string;
  preview_url?: string;
  preview_urls?: string[];

  previews?: Array<{
    id: number;
    url: string;
    name: string;
    size: number;
  }>;

  asset_url?: string;

  asset?: {
    id: number;
    url: string;
    file_name: string;
    size: number;
    mime_type: string;
  } | null;

  variants?: ProductVariant[];
}


/* ================= PRODUCT FORM ================= */
export interface ProductFormData {
  title: string;
  short_description: string;
  description: string;
  price: number;
  category_id?: number;
  asset_type: string;
  is_published: boolean;

  preview_images: File[] | null;
  asset_file: File | null;

  discount_percentage: number;
  discount_fixed: number | null;

  discount_starts_at?: string;
  discount_ends_at?: string;
}


/* ================= PAGINATION ================= */

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

/* ================= MONGODB UPLOAD LOGS ================= */

export interface MongoLog {
  _id?: string;
  product_id: number | string;
  file_name: string;
  size: number;
  mime: string;
  uploaded_by: number | string;
  ip: string;
  user_agent: string;
  created_at: string;
}

export interface LogsResponse {
  data: MongoLog[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface Order {
  id: number;
  total: number;
  status: string;
  payment_method?: "card" | "cash";
  refunded_total?: number;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface OrdersResponse {
  data: Order[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface OrderFilters {
  search?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  per_page?: number;
}

export interface ShippingMethod {
  id: number;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  sort_order: number;
}

export interface CouponFormData {
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_subtotal?: number | null;
  usage_limit?: number | null;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
}

export interface Coupon extends CouponFormData {
  id: number;
  used_count: number;
  created_at: string;
}