import React from "react";
import {
  Store,
  Package,
  Layers,
  Tags,
  Truck,
  Database,
  Users,
  ShoppingCart,
  RotateCcw,
  Ticket,
} from "lucide-react";
import styles from "../../styles/AdminDashboard.module.css";

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

interface AdminSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pendingRefundCount?: number;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingRefundCount = 0,
}) => {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>
        <Store size={20} />
        <span>ShopCore</span>
      </div>

      <ul className={styles.navLinks}>
        <li
          className={activeTab === "products" ? styles.active : ""}
          onClick={() => setActiveTab("products")}
        >
          <Package size={18} /> <span>Products</span>
        </li>

        <li
          className={activeTab === "orders" ? styles.active : ""}
          onClick={() => setActiveTab("orders")}
        >
          <ShoppingCart size={18} /> <span>Orders</span>
        </li>

        <li
          className={activeTab === "refund-requests" ? styles.active : ""}
          onClick={() => setActiveTab("refund-requests")}
        >
          <RotateCcw size={18} /> <span>Refund Requests</span>
          {pendingRefundCount > 0 && (
            <span className={styles.navBadge}>{pendingRefundCount}</span>
          )}
        </li>

        <li
          className={activeTab === "coupons" ? styles.active : ""}
          onClick={() => setActiveTab("coupons")}
        >
          <Ticket size={18} /> <span>Coupons</span>
        </li>

        <li
          className={activeTab === "categories" ? styles.active : ""}
          onClick={() => setActiveTab("categories")}
        >
          <Layers size={18} /> <span>Categories</span>
        </li>

        <li
          className={activeTab === "attributes" ? styles.active : ""}
          onClick={() => setActiveTab("attributes")}
        >
          <Tags size={18} /> <span>Attributes</span>
        </li>

        <li
          className={activeTab === "shipping" ? styles.active : ""}
          onClick={() => setActiveTab("shipping")}
        >
          <Truck size={18} /> <span>Shipping</span>
        </li>

        <li
          className={activeTab === "logs" ? styles.active : ""}
          onClick={() => setActiveTab("logs")}
        >
          <Database size={18} /> <span>Upload Logs</span>
        </li>

        <li
          className={activeTab === "users" ? styles.active : ""}
          onClick={() => setActiveTab("users")}
        >
          <Users size={18} /> <span>Users</span>
        </li>
      </ul>
    </nav>
  );
};

export default AdminSidebar;
