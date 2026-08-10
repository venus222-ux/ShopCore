import { create } from "zustand";
import API from "../api";
import { toast } from "react-toastify";
import type { OrderFilters, CouponFormData } from "../types";
import { toDateTimeLocal, toBackendDateTime } from "../utils/date";

import type {
  Category,
  Product,
  PaginationMeta,
  ProductFormData,
  MongoLog,
  Attribute,
  CategoryAttributeOption,
  AdminProductVariant,
  CreateVariantPayload,
  ShippingMethod,
} from "../types";

interface AdminState {
  categories: Category[];
  products: Product[];
  logs: MongoLog[];
  users: any[];
  orders: any[];
  refunds: any[];

  refundRequests: any[];
  fetchRefundRequests: () => Promise<void>;
  approveRefundRequest: (id: number) => Promise<void>;
  rejectRefundRequest: (id: number, adminNote?: string) => Promise<void>;

  // === COUPONS ===
  coupons: any[];
  isLoadingCoupons: boolean;
  fetchCoupons: (search?: string) => Promise<void>;
  createCoupon: (data: CouponFormData) => Promise<void>;
  updateCoupon: (id: number, data: CouponFormData) => Promise<void>;
  deleteCoupon: (id: number) => Promise<void>;
  toggleCouponActive: (id: number) => Promise<void>;

  // === GLOBAL SETTINGS ===
  couponsEnabledGlobally: boolean;
  fetchGlobalSettings: () => Promise<void>;
  updateGlobalSettings: (couponsEnabled: boolean) => Promise<void>;

  // === COD SETTINGS ===
  codEnabled: boolean;
  codMaxOrderValue: number;
  codFee: number;
  fetchCodSettings: () => Promise<void>;
  updateCodSettings: (data: {
    cod_enabled: boolean;
    cod_max_order_value: number;
    cod_fee: number;
  }) => Promise<void>;

  confirmCashOrder: (orderId: number) => Promise<void>;

  dashboardStats: any | null;

  pagination: PaginationMeta | null;
  paginationLogs: PaginationMeta | null;

  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  isLoadingLogs: boolean;

  searchTerm: string;

  currentPage: number;
  currentPageLogs: number;

  perPage: number;

  activeTab: "products" | "logs";

  productForm: ProductFormData;
  editingProduct: Product | null;

  attributes: Attribute[];
  isLoadingAttributes: boolean;

  categoryAttributeOptions: CategoryAttributeOption[];
  isLoadingCategoryAttributes: boolean;

  variants: AdminProductVariant[];
  isLoadingVariants: boolean;

  shippingMethods: ShippingMethod[];
  isLoadingShippingMethods: boolean;

  fetchDashboardStats: () => Promise<void>;

  setUsers: (users: any[]) => void;
  fetchUsers: () => Promise<void>;
  deleteUser: (id: number) => Promise<void>;

  fetchCategories: () => Promise<void>;
  addCategory: (name: string, parentId?: number | null) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  updateCategoryParent: (
    categoryId: number,
    parentId: number | null,
  ) => Promise<void>;

  fetchAttributes: () => Promise<void>;
  createAttribute: (
    name: string,
    type: Attribute["type"],
    isFilterable?: boolean,
  ) => Promise<void>;
  updateAttribute: (
    id: number,
    name: string,
    type: Attribute["type"],
    isFilterable?: boolean,
  ) => Promise<void>;
  deleteAttribute: (id: number) => Promise<void>;
  createAttributeValue: (
    attributeId: number,
    value: string,
    sortOrder?: number,
  ) => Promise<void>;
  updateAttributeValue: (
    valueId: number,
    value: string,
    sortOrder?: number,
  ) => Promise<void>;
  deleteAttributeValue: (valueId: number) => Promise<void>;

  fetchCategoryAttributes: (categoryId: number) => Promise<void>;
  syncCategoryAttributes: (
    categoryId: number,
    attributeIds: number[],
  ) => Promise<void>;

  fetchVariants: (productId: number) => Promise<void>;
  createVariant: (
    productId: number,
    payload: CreateVariantPayload,
  ) => Promise<void>;
  updateVariant: (
    variantId: number,
    payload: Partial<CreateVariantPayload>,
  ) => Promise<void>;
  deleteVariant: (variantId: number) => Promise<void>;
  updateVariantInventory: (
    variantId: number,
    trackStock: boolean,
    quantity: number,
  ) => Promise<void>;
  clearVariants: () => void;

  fetchShippingMethods: () => Promise<void>;
  createShippingMethod: (data: {
    name: string;
    description?: string;
    price: number;
    is_active?: boolean;
    sort_order?: number;
  }) => Promise<void>;
  updateShippingMethod: (
    id: number,
    data: {
      name: string;
      description?: string;
      price: number;
      is_active?: boolean;
      sort_order?: number;
    },
  ) => Promise<void>;
  deleteShippingMethod: (id: number) => Promise<void>;

  fetchProducts: (page?: number, search?: string) => Promise<void>;
  createOrUpdateProduct: () => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  deletePreviewImage: (productId: number, mediaId: number) => Promise<void>;

  fetchLogs: (page?: number, search?: string) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  exportLogs: () => Promise<void>;

  /* ================= ORDERS ================= */
  fetchOrders: (page?: number, filters?: OrderFilters) => Promise<void>;
  fetchOrderById: (id: number) => Promise<void>;
  selectedOrder: any | null;
  setSelectedOrder: (o: any | null) => void;
  downloadInvoice: (orderId: number) => Promise<void>;
  completeOrder: (orderId: number) => Promise<void>;
  releaseOrder: (orderId: number) => Promise<void>;
  restockOrder: (orderId: number) => Promise<void>;

  fetchRefunds: () => Promise<void>;
  refundOrder: (
    orderId: number,
    amount: number,
    reason: string,
  ) => Promise<any>;

  setSearchTerm: (term: string) => void;

  setCurrentPage: (page: number) => void;
  setCurrentPageLogs: (page: number) => void;

  setActiveTab: (tab: "products" | "logs") => void;

  setEditingProduct: (product: Product | null) => void;
  updateProductForm: (updates: Partial<ProductFormData>) => void;
  resetProductForm: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  categories: [],
  products: [],
  logs: [],
  users: [],
  orders: [],
  refunds: [],

  refundRequests: [],

  coupons: [],
  isLoadingCoupons: false,

  couponsEnabledGlobally: true,

  // === COD SETTINGS ===
  codEnabled: true,
  codMaxOrderValue: 500,
  codFee: 0,

  dashboardStats: null,

  pagination: null,
  paginationLogs: null,

  isLoadingProducts: false,
  isLoadingCategories: false,
  isLoadingLogs: false,

  searchTerm: "",

  currentPage: 1,
  currentPageLogs: 1,

  perPage: 10,

  activeTab: "products",

  productForm: {
    title: "",
    short_description: "",
    description: "",
    price: 0,
    category_id: undefined,
    asset_type: "",
    is_published: false,
    preview_images: null,
    asset_file: null,
    discount_percentage: 0,
    discount_fixed: null,
    discount_starts_at: "",
    discount_ends_at: "",
  },
  editingProduct: null,

  attributes: [],
  isLoadingAttributes: false,

  categoryAttributeOptions: [],
  isLoadingCategoryAttributes: false,

  variants: [],
  isLoadingVariants: false,

  shippingMethods: [],
  isLoadingShippingMethods: false,

  selectedOrder: null,

  setSelectedOrder: (o) => set({ selectedOrder: o }),

  fetchDashboardStats: async () => {
    try {
      const res = await API.get("/admin/dashboard-stats");
      set({ dashboardStats: res.data });
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
      toast.error("Failed to fetch dashboard stats");
    }
  },

  fetchOrders: async (page = 1, filters = {}) => {
    try {
      const res = await API.get("/admin/orders", {
        params: { page, ...filters },
      });

      set({
        orders: res.data.data ?? res.data.orders ?? res.data ?? [],
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch orders");
    }
  },

  fetchOrderById: async (id: number) => {
    try {
      const res = await API.get(`/admin/orders/${id}`);
      set({ selectedOrder: res.data });
      return res.data;
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to fetch order details",
      );
      throw err;
    }
  },

  downloadInvoice: async (orderId: number) => {
    try {
      const res = await API.get(`/admin/orders/${orderId}/invoice`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Invoice download failed");
    }
  },

  completeOrder: async (orderId: number) => {
    try {
      const res = await API.post(`/admin/orders/${orderId}/complete`);

      toast.success(res.data?.message || "Order marked as completed");

      await get().fetchOrders(get().currentPage);

      if (get().selectedOrder?.id === orderId) {
        await get().fetchOrderById(orderId);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to complete order");
      throw err;
    }
  },

  releaseOrder: async (orderId: number) => {
    try {
      const res = await API.post(`/admin/orders/${orderId}/release`);

      toast.success(res.data?.message || "Order cancelled and stock released");

      await get().fetchOrders(get().currentPage);

      if (get().selectedOrder?.id === orderId) {
        await get().fetchOrderById(orderId);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to release order");
      throw err;
    }
  },

  restockOrder: async (orderId: number) => {
    try {
      const res = await API.post(`/admin/orders/${orderId}/restock`);

      toast.success(res.data?.message || "Stock manually restored");

      await get().fetchOrders(get().currentPage);

      if (get().selectedOrder?.id === orderId) {
        await get().fetchOrderById(orderId);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to restock order");
      throw err;
    }
  },

  confirmCashOrder: async (orderId: number) => {
    try {
      const res = await API.post(`/admin/orders/${orderId}/confirm-cash`);

      toast.success(res.data?.message || "Cash payment confirmed");

      await get().fetchOrders(get().currentPage);

      if (get().selectedOrder?.id === orderId) {
        await get().fetchOrderById(orderId);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to confirm cash payment",
      );
      throw err;
    }
  },

  setUsers: (users) => set({ users }),

  fetchUsers: async () => {
    try {
      const res = await API.get("/admin/users");
      set({ users: res.data || [] });
    } catch {
      toast.error("Failed to fetch users");
    }
  },

  deleteUser: async (id: number) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await API.delete(`/admin/users/${id}`);
      set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
      toast.success("User deleted");
    } catch {
      toast.error("Delete failed");
    }
  },

  fetchCategories: async () => {
    set({ isLoadingCategories: true });
    try {
      const res = await API.get("/admin/categories");
      set({ categories: res.data || [] });
    } catch {
      toast.error("Failed to fetch categories");
    } finally {
      set({ isLoadingCategories: false });
    }
  },

  addCategory: async (name: string, parentId: number | null = null) => {
    try {
      const res = await API.post("/admin/categories", {
        name,
        parent_id: parentId,
      });
      let created = res.data;

      if (parentId) {
        try {
          const updated = await API.put(
            `/admin/categories/${created.id}/parent`,
            {
              parent_id: parentId,
            },
          );
          created = updated.data;
        } catch {
          toast.warning("Category created, but setting its parent failed");
        }
      }

      set((state) => ({ categories: [...state.categories, created] }));
      toast.success("Category created");
    } catch {
      toast.error("Error creating category");
    }
  },

  updateCategoryParent: async (categoryId, parentId) => {
    try {
      await API.put(`/admin/categories/${categoryId}/parent`, {
        parent_id: parentId,
      });
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === categoryId ? { ...c, parent_id: parentId } : c,
        ),
      }));
      toast.success("Category updated");
    } catch {
      toast.error("Failed to update category parent");
    }
  },

  deleteCategory: async (id: number) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await API.delete(`/admin/categories/${id}`);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }));
      toast.success("Category deleted");
    } catch {
      toast.error("Error deleting category");
    }
  },

  fetchAttributes: async () => {
    set({ isLoadingAttributes: true });
    try {
      const res = await API.get("/admin/attributes");
      set({ attributes: res.data || [] });
    } catch {
      toast.error("Failed to fetch attributes");
    } finally {
      set({ isLoadingAttributes: false });
    }
  },

  createAttribute: async (name, type, isFilterable = true) => {
    try {
      const res = await API.post("/admin/attributes", {
        name,
        type,
        is_filterable: isFilterable,
      });
      set((state) => ({ attributes: [...state.attributes, res.data] }));
      toast.success("Attribute created");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error creating attribute");
    }
  },

  updateAttribute: async (id, name, type, isFilterable = true) => {
    try {
      const res = await API.put(`/admin/attributes/${id}`, {
        name,
        type,
        is_filterable: isFilterable,
      });
      set((state) => ({
        attributes: state.attributes.map((a) => (a.id === id ? res.data : a)),
      }));
      toast.success("Attribute updated");
    } catch {
      toast.error("Error updating attribute");
    }
  },

  deleteAttribute: async (id) => {
    if (
      !window.confirm(
        "Delete this attribute? This removes it from every category and variant using it.",
      )
    )
      return;
    try {
      await API.delete(`/admin/attributes/${id}`);
      set((state) => ({
        attributes: state.attributes.filter((a) => a.id !== id),
      }));
      toast.success("Attribute deleted");
    } catch {
      toast.error("Error deleting attribute");
    }
  },

  createAttributeValue: async (attributeId, value, sortOrder = 0) => {
    try {
      const res = await API.post(`/admin/attributes/${attributeId}/values`, {
        value,
        sort_order: sortOrder,
      });
      set((state) => ({
        attributes: state.attributes.map((a) =>
          a.id === attributeId
            ? { ...a, values: [...a.values, res.data] }
            : a,
        ),
      }));
      toast.success("Value added");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error adding value");
    }
  },

  updateAttributeValue: async (valueId, value, sortOrder) => {
    try {
      const res = await API.put(`/admin/attribute-values/${valueId}`, {
        value,
        sort_order: sortOrder,
      });
      set((state) => ({
        attributes: state.attributes.map((a) => ({
          ...a,
          values: a.values.map((v) => (v.id === valueId ? res.data : v)),
        })),
      }));
      toast.success("Value updated");
    } catch {
      toast.error("Error updating value");
    }
  },

  deleteAttributeValue: async (valueId) => {
    if (!window.confirm("Delete this value?")) return;
    try {
      await API.delete(`/admin/attribute-values/${valueId}`);
      set((state) => ({
        attributes: state.attributes.map((a) => ({
          ...a,
          values: a.values.filter((v) => v.id !== valueId),
        })),
      }));
      toast.success("Value deleted");
    } catch {
      toast.error("Error deleting value");
    }
  },

  fetchCategoryAttributes: async (categoryId) => {
    set({ isLoadingCategoryAttributes: true });
    try {
      const res = await API.get(`/admin/categories/${categoryId}/attributes`);
      set({ categoryAttributeOptions: res.data || [] });
    } catch {
      toast.error("Failed to fetch category attributes");
    } finally {
      set({ isLoadingCategoryAttributes: false });
    }
  },

  syncCategoryAttributes: async (categoryId, attributeIds) => {
    try {
      await API.put(`/admin/categories/${categoryId}/attributes`, {
        attribute_ids: attributeIds,
      });
      set((state) => ({
        categoryAttributeOptions: state.categoryAttributeOptions.map((a) => ({
          ...a,
          assigned: attributeIds.includes(a.id),
        })),
      }));
      toast.success("Category attributes updated");
    } catch {
      toast.error("Failed to update category attributes");
    }
  },

  fetchVariants: async (productId) => {
    set({ isLoadingVariants: true });
    try {
      const res = await API.get(`/admin/products/${productId}/variants`);
      set({ variants: res.data || [] });
    } catch {
      toast.error("Failed to fetch variants");
    } finally {
      set({ isLoadingVariants: false });
    }
  },

  createVariant: async (productId, payload) => {
    try {
      const res = await API.post(
        `/admin/products/${productId}/variants`,
        payload,
      );
      set((state) => ({ variants: [...state.variants, res.data] }));
      toast.success("Variant created");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error creating variant");
    }
  },

  updateVariant: async (variantId, payload) => {
    try {
      const res = await API.put(`/admin/variants/${variantId}`, payload);
      set((state) => ({
        variants: state.variants.map((v) =>
          v.id === variantId ? res.data : v,
        ),
      }));
      toast.success("Variant updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error updating variant");
    }
  },

  deleteVariant: async (variantId) => {
    if (!window.confirm("Delete this variant?")) return;
    try {
      await API.delete(`/admin/variants/${variantId}`);
      set((state) => ({
        variants: state.variants.filter((v) => v.id !== variantId),
      }));
      toast.success("Variant deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error deleting variant");
    }
  },

  updateVariantInventory: async (variantId, trackStock, quantity) => {
    try {
      const res = await API.put(`/admin/variants/${variantId}/inventory`, {
        track_stock: trackStock,
        quantity,
      });
      set((state) => ({
        variants: state.variants.map((v) =>
          v.id === variantId ? res.data : v,
        ),
      }));
      toast.success("Stock updated");
    } catch {
      toast.error("Error updating stock");
    }
  },

  clearVariants: () => set({ variants: [] }),

  fetchShippingMethods: async () => {
    set({ isLoadingShippingMethods: true });
    try {
      const res = await API.get("/admin/shipping-methods");
      set({ shippingMethods: res.data || [] });
    } catch {
      toast.error("Failed to fetch shipping methods");
    } finally {
      set({ isLoadingShippingMethods: false });
    }
  },

  createShippingMethod: async (data) => {
    try {
      const res = await API.post("/admin/shipping-methods", data);
      set((state) => ({
        shippingMethods: [...state.shippingMethods, res.data],
      }));
      toast.success("Shipping method created");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Error creating shipping method",
      );
    }
  },

  updateShippingMethod: async (id, data) => {
    try {
      const res = await API.put(`/admin/shipping-methods/${id}`, data);
      set((state) => ({
        shippingMethods: state.shippingMethods.map((m) =>
          m.id === id ? res.data : m,
        ),
      }));
      toast.success("Shipping method updated");
    } catch {
      toast.error("Error updating shipping method");
    }
  },

  deleteShippingMethod: async (id) => {
    if (!window.confirm("Delete this shipping method?")) return;
    try {
      await API.delete(`/admin/shipping-methods/${id}`);
      set((state) => ({
        shippingMethods: state.shippingMethods.filter((m) => m.id !== id),
      }));
      toast.success("Shipping method deleted");
    } catch {
      toast.error("Error deleting shipping method");
    }
  },

  fetchProducts: async (page = 1, search = "") => {
    set({ isLoadingProducts: true });
    try {
      const res = await API.get("/admin/products", {
        params: {
          page,
          per_page: get().perPage,
          search: search || undefined,
        },
      });

      set({
        products: res.data.data || [],
        pagination: res.data.current_page
          ? {
              current_page: res.data.current_page,
              last_page: res.data.last_page,
              per_page: res.data.per_page,
              total: res.data.total,
              from: res.data.from,
              to: res.data.to,
            }
          : null,
        currentPage: res.data.current_page || 1,
      });
    } catch {
      toast.error("Failed to fetch products");
      set({ products: [], pagination: null });
    } finally {
      set({ isLoadingProducts: false });
    }
  },

  createOrUpdateProduct: async () => {
    const { productForm, editingProduct, currentPage, searchTerm } = get();

    try {
      const formData = new FormData();
      formData.append("title", productForm.title ?? "");
      formData.append("short_description", productForm.short_description ?? "");
      formData.append("description", productForm.description ?? "");
      formData.append("price", String(productForm.price ?? 0));
      formData.append(
        "discount_percentage",
        String(productForm.discount_percentage ?? 0),
      );

      if (productForm.discount_fixed != null) {
        formData.append("discount_fixed", String(productForm.discount_fixed));
      }

      const starts = toBackendDateTime(productForm.discount_starts_at);
      if (starts) formData.append("discount_starts_at", starts);

      const ends = toBackendDateTime(productForm.discount_ends_at);
      if (ends) formData.append("discount_ends_at", ends);

      formData.append("asset_type", productForm.asset_type ?? "");
      formData.append("category_id", String(productForm.category_id ?? ""));
      formData.append("is_published", productForm.is_published ? "1" : "0");

      if (Array.isArray(productForm.preview_images)) {
        productForm.preview_images.forEach((file) =>
          formData.append("preview_images[]", file),
        );
      }

      if (productForm.asset_file instanceof File) {
        formData.append("asset_file", productForm.asset_file);
      }

      const url = editingProduct
        ? `/admin/products/${editingProduct.id}`
        : "/admin/products";

      if (editingProduct) {
        formData.append("_method", "PUT");
      }

      await API.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(editingProduct ? "Product updated" : "Product created");

      await get().fetchProducts(currentPage, searchTerm);

      if (editingProduct) {
        const refreshed = await API.get(`/admin/products/${editingProduct.id}`);
        set({ editingProduct: refreshed.data.data ?? refreshed.data });
      }

      get().resetProductForm();
    } catch (error: any) {
      console.error(error.response?.data);
      toast.error(error.response?.data?.message || "Error saving product");
    }
  },

  deletePreviewImage: async (productId: number, mediaId: number) => {
    try {
      await API.delete(`/admin/products/${productId}/media/${mediaId}`);
      toast.success("Image deleted");

      const res = await API.get(`/admin/products/${productId}`);
      set({ editingProduct: res.data.data ?? res.data });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete image");
    }
  },

  deleteProduct: async (id: number) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await API.delete(`/admin/products/${id}`);
      toast.success("Product deleted");
      await get().fetchProducts(get().currentPage, get().searchTerm);
    } catch {
      toast.error("Delete failed");
    }
  },

  fetchLogs: async (page = 1, search = "") => {
    set({ isLoadingLogs: true });
    try {
      const res = await API.get("/admin/logs", {
        params: {
          page,
          per_page: get().perPage,
          search: search || undefined,
        },
      });

      set({
        logs: res.data.data || [],
        paginationLogs: res.data.current_page
          ? {
              current_page: res.data.current_page,
              last_page: res.data.last_page,
              per_page: res.data.per_page,
              total: res.data.total,
              from: res.data.from,
              to: res.data.to,
            }
          : null,
        currentPageLogs: res.data.current_page || 1,
      });
    } catch {
      toast.error("Failed to fetch logs");
    } finally {
      set({ isLoadingLogs: false });
    }
  },

  deleteLog: async (id: string) => {
    if (!window.confirm("Delete log?")) return;
    try {
      await API.delete(`/admin/logs/${id}`);
      toast.success("Log deleted");
      get().fetchLogs(get().currentPageLogs, get().searchTerm);
    } catch {
      toast.error("Delete failed");
    }
  },

  exportLogs: async () => {
    try {
      const res = await API.get("/admin/logs/export", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `logs_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Exported");
    } catch {
      toast.error("Export failed");
    }
  },

  fetchRefunds: async () => {
    try {
      const res = await API.get("/admin/refunds");
      set({ refunds: res.data?.data || res.data || [] });
    } catch {
      console.warn("Refunds not ready yet");
    }
  },

  fetchRefundRequests: async () => {
    try {
      const res = await API.get("/admin/refund-requests");
      set({ refundRequests: res.data?.data || res.data || [] });
    } catch {
      console.warn("Refund requests not ready yet");
    }
  },

  approveRefundRequest: async (id: number) => {
    try {
      const res = await API.post(`/admin/refund-requests/${id}/approve`);
      toast.success(res.data?.message || "Refund approved");
      await get().fetchRefundRequests();
      await get().fetchRefunds();
      await get().fetchOrders(get().currentPage);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve refund");
      throw err;
    }
  },

  rejectRefundRequest: async (id: number, adminNote?: string) => {
    try {
      const res = await API.post(`/admin/refund-requests/${id}/reject`, {
        admin_note: adminNote,
      });
      toast.success(res.data?.message || "Refund request rejected");
      await get().fetchRefundRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject refund");
      throw err;
    }
  },

  refundOrder: async (orderId, amount, reason) => {
    try {
      const res = await API.post(`/admin/orders/${orderId}/refund`, {
        amount,
        reason,
      });
      toast.success("Refund processed");
      await get().fetchOrders();
      await get().fetchRefunds();
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Refund failed");
      throw err;
    }
  },

  // === COUPONS ===
  fetchCoupons: async (search = "") => {
    set({ isLoadingCoupons: true });
    try {
      const res = await API.get("/admin/coupons", {
        params: { search: search || undefined },
      });
      set({ coupons: res.data?.data || res.data || [] });
    } catch {
      toast.error("Failed to fetch coupons");
    } finally {
      set({ isLoadingCoupons: false });
    }
  },

  createCoupon: async (data: CouponFormData) => {
    try {
      const res = await API.post("/admin/coupons", data);
      set((state) => ({ coupons: [res.data, ...state.coupons] }));
      toast.success("Coupon created");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error creating coupon");
      throw err;
    }
  },

  updateCoupon: async (id: number, data: CouponFormData) => {
    try {
      const res = await API.put(`/admin/coupons/${id}`, data);
      set((state) => ({
        coupons: state.coupons.map((c) => (c.id === id ? res.data : c)),
      }));
      toast.success("Coupon updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error updating coupon");
      throw err;
    }
  },

  deleteCoupon: async (id: number) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await API.delete(`/admin/coupons/${id}`);
      set((state) => ({ coupons: state.coupons.filter((c) => c.id !== id) }));
      toast.success("Coupon deleted");
    } catch {
      toast.error("Error deleting coupon");
    }
  },

  toggleCouponActive: async (id: number) => {
    try {
      const res = await API.patch(`/admin/coupons/${id}/toggle-active`);
      set((state) => ({
        coupons: state.coupons.map((c) => (c.id === id ? res.data : c)),
      }));
      toast.success(
        res.data.is_active ? "Coupon activated" : "Coupon deactivated",
      );
    } catch {
      toast.error("Error toggling coupon status");
    }
  },

  // === GLOBAL SETTINGS ===
  fetchGlobalSettings: async () => {
    try {
      const res = await API.get("/settings");
      set({ couponsEnabledGlobally: !!res.data.coupons_enabled });
    } catch {
      console.warn("Failed to fetch global settings");
    }
  },

  updateGlobalSettings: async (couponsEnabled: boolean) => {
    try {
      await API.put("/admin/settings", { coupons_enabled: couponsEnabled });
      set({ couponsEnabledGlobally: couponsEnabled });
      toast.success(
        `Coupons ${couponsEnabled ? "enabled" : "disabled"} at checkout`,
      );
    } catch {
      toast.error("Failed to update settings");
    }
  },

  // === COD SETTINGS ===
  fetchCodSettings: async () => {
    try {
      const res = await API.get("/settings");
      set({
        codEnabled: !!res.data.cod_enabled,
        codMaxOrderValue: Number(res.data.cod_max_order_value ?? 500),
        codFee: Number(res.data.cod_fee ?? 0),
      });
    } catch {
      console.warn("Failed to fetch COD settings");
    }
  },

  updateCodSettings: async (data) => {
    try {
      await API.put("/admin/settings", data);
      set({
        codEnabled: data.cod_enabled,
        codMaxOrderValue: data.cod_max_order_value,
        codFee: data.cod_fee,
      });
      toast.success("Cash on Delivery settings updated");
    } catch {
      toast.error("Failed to update COD settings");
    }
  },

  setSearchTerm: (term) => {
    set({ searchTerm: term });
    if (get().activeTab === "logs") {
      get().fetchLogs(1, term);
    } else {
      get().fetchProducts(1, term);
    }
  },

  setCurrentPage: (page) => {
    set({ currentPage: page });
    get().fetchProducts(page, get().searchTerm);
  },

  setCurrentPageLogs: (page) => {
    set({ currentPageLogs: page });
    get().fetchLogs(page, get().searchTerm);
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab, searchTerm: "" });
    if (tab === "logs") {
      get().fetchLogs(1);
    } else {
      get().fetchProducts(1);
    }
  },

  setEditingProduct: (product) => {
    if (product) {
      set({
        editingProduct: product,
        productForm: {
          title: product.title,
          short_description: product.short_description,
          description: product.description,
          price: Number(product.price),
          category_id: product.category_id,
          asset_type: product.asset_type,
          is_published: !!product.is_published,
          preview_images: null,
          asset_file: null,
          discount_percentage: Number(product.discount_percentage ?? 0),
          discount_fixed:
            product.discount_fixed != null
              ? Number(product.discount_fixed)
              : null,
          discount_starts_at: product.discount_starts_at
            ? toDateTimeLocal(product.discount_starts_at)
            : "",
          discount_ends_at: product.discount_ends_at
            ? toDateTimeLocal(product.discount_ends_at)
            : "",
        },
      });
    } else {
      set({
        editingProduct: null,
        productForm: {
          title: "",
          short_description: "",
          description: "",
          price: 0,
          category_id: undefined,
          asset_type: "",
          is_published: false,
          preview_images: null,
          asset_file: null,
          discount_percentage: 0,
          discount_fixed: null,
          discount_starts_at: "",
          discount_ends_at: "",
        },
      });
    }
  },

  updateProductForm: (updates) =>
    set((state) => ({
      productForm: { ...state.productForm, ...updates },
    })),

  resetProductForm: () =>
    set({
      productForm: {
        title: "",
        short_description: "",
        description: "",
        price: 0,
        category_id: undefined,
        asset_type: "",
        is_published: false,
        preview_images: null,
        asset_file: null,
        discount_percentage: 0,
        discount_fixed: null,
        discount_starts_at: "",
        discount_ends_at: "",
      },
      editingProduct: null,
      variants: [],
    }),
}));