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

import { Search, Download } from "lucide-react";

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
            <Search size={18} />
            <input
              placeholder={
                activeTab === "logs"
                  ? "Search logs..."
                  : activeTab === "users"
                    ? "Search users..."
                    : "Search database..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {activeTab === "logs" && (
            <button onClick={exportLogs} className={styles.exportBtn}>
              <Download size={18} />
              <span>Export CSV</span>
            </button>
          )}
        </header>

        <main className={styles.content}>
          <div className={styles.welcome}>
            <h1>
              {activeTab === "products" && "Inventory Overview"}
              {activeTab === "categories" && "Category Management"}
              {activeTab === "attributes" && "Attributes Management"}
              {activeTab === "shipping" && "Shipping Methods"}
              {activeTab === "logs" && "System Logs"}
              {activeTab === "users" && "User Management"}
              {activeTab === "orders" && "Orders Management"}
              {activeTab === "refund-requests" && "Refund Requests"}
              {activeTab === "coupons" && "Coupon Management"}
            </h1>
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