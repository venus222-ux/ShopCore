import React, { useEffect, useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import styles from "../styles/AdminDashboard.module.css";

import AdminSidebar from "../components/Admin/AdminSidebar";
import ProductsTab from "../components/Admin/ProductsTab";
import CategoriesTab from "../components/Admin/CategoriesTab";
import AttributesTab from "../components/Admin/AttributesTab";
import ShippingMethodsTab from "../components/Admin/ShippingMethodsTab";
import LogsTab from "../components/Admin/LogsTab";
import UsersTab from "../components/Admin/UsersTab";
import OrdersTab from "../components/Admin/OrdersTab";
import RefundRequestsTab from "../components/Admin/RefundRequestsTab";
import CouponsTab from "../components/Admin/CouponsTab";

import { Search, Download, Bell, MessageSquare } from "lucide-react";

type TabType =
  | "products"
  | "categories"
  | "attributes"
  | "shipping"
  | "logs"
  | "users"
  | "orders"
  | "refund-requests"
  | "coupons";

const TAB_COPY: Record<TabType, { title: string; subtitle: string }> = {
  products: {
    title: "Inventory Overview",
    subtitle: "Track catalog performance and manage every listing in one place.",
  },
  categories: {
    title: "Category Management",
    subtitle: "Organize how products are grouped and filtered across the storefront.",
  },
  attributes: {
    title: "Attributes Management",
    subtitle: "Define the option sets — color, size, format — used to build variants.",
  },
  shipping: {
    title: "Shipping Methods",
    subtitle: "Configure the delivery options shown to customers at checkout.",
  },
  logs: {
    title: "System Logs",
    subtitle: "Every file uploaded to the store, with its origin and footprint.",
  },
  users: {
    title: "User Management",
    subtitle: "View and manage everyone with an account on the store.",
  },
  orders: {
    title: "Orders Management",
    subtitle: "Track payments, fulfilment and refunds across every order.",
  },
  "refund-requests": {
    title: "Refund Requests",
    subtitle: "Review customer-submitted refund requests awaiting a decision.",
  },
  coupons: {
    title: "Coupon Management",
    subtitle: "Create and manage discount codes available at checkout.",
  },
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const AdminDashboard: React.FC = () => {
  const {
    fetchCategories,
    fetchProducts,
    fetchLogs,
    fetchUsers,
    searchTerm,
    setSearchTerm,
    exportLogs,
    users,
    deleteUser,
    refundRequests,
    fetchRefundRequests,
    //currentAdmin, // optional: { name, role } — falls back gracefully below
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<TabType>("products");

  useEffect(() => {
    fetchCategories();
    fetchProducts(1);
    // Fetched on mount (not just when the tab is active) so the sidebar
    // badge count is visible right away, without requiring the admin to
    // click into the tab first.
    fetchRefundRequests();
  }, []);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs(1, searchTerm);
    }
  }, [activeTab, searchTerm]);

const adminName = "Admin";
const adminRole = "Administrator";
  const copy = TAB_COPY[activeTab];

  return (
    <div className={styles.appWrapper}>
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingRefundCount={refundRequests.length}
      />

      <div className={styles.mainContainer}>
        <header className={styles.topBar}>
          <div className={styles.searchBox}>
            <Search size={17} />
            <input
              placeholder={
                activeTab === "logs"
                  ? "Search logs..."
                  : activeTab === "users"
                    ? "Search users..."
                    : "Search products, orders, customers..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.topBarActions}>
            {activeTab === "logs" && (
              <button onClick={exportLogs} className={styles.exportBtn}>
                <Download size={16} />
                <span>Export CSV</span>
              </button>
            )}

            <button className={styles.iconAction} title="Messages">
              <MessageSquare size={17} />
            </button>
            <button className={styles.iconAction} title="Notifications">
              <Bell size={17} />
              <span className={styles.iconDot} />
            </button>

            <div className={styles.profileChip}>
              <div className={styles.profileAvatar}>{initials(adminName)}</div>
              <div className={styles.profileMeta}>
                <span className={styles.profileName}>{adminName}</span>
                <span className={styles.profileRole}>{adminRole}</span>
              </div>
            </div>
          </div>
        </header>

        <main className={styles.content}>
          <div className={styles.welcome}>
            <div>
              <h1>{copy.title}</h1>
              <p>{copy.subtitle}</p>
            </div>
          </div>

          {activeTab === "products" && <ProductsTab />}
          {activeTab === "categories" && <CategoriesTab />}
          {activeTab === "attributes" && <AttributesTab />}
          {activeTab === "shipping" && <ShippingMethodsTab />}
          {activeTab === "logs" && <LogsTab />}
          {activeTab === "users" && <UsersTab users={users} onDelete={deleteUser} />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "refund-requests" && <RefundRequestsTab />}
          {activeTab === "coupons" && <CouponsTab />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
