import React, { useEffect } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import DashboardCharts from "./DashboardCharts";
import ProductForm from "./ProductForm";
import styles from "../../styles/AdminDashboard.module.css";
import {
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  ShoppingBag,
  Clock,
  RotateCcw,
  Users,
  Receipt,
  TrendingUp,
  Percent,
} from "lucide-react";

const ProductsTab: React.FC = () => {
  const {
    fetchDashboardStats,
    dashboardStats,
    products,
    pagination,
    isLoadingProducts,
    currentPage,
    setCurrentPage,
    fetchProducts,
    setEditingProduct,
    resetProductForm,
    deleteProduct,
  } = useAdminStore();

  useEffect(() => {
    fetchDashboardStats();
    fetchProducts(currentPage); // Fetch initial page
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.last_page)) return;

    setCurrentPage(newPage);
    fetchProducts(newPage);
  };

  return (
    <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
      {/* LEFT COLUMN: KPIs, Charts, and Product Table */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* KPI CARDS ROW */}
        {dashboardStats && (
          <div className={styles.statsRow}>
            <KpiCard
              label="Today's Revenue"
              value={`$${dashboardStats.kpis.today_revenue}`}
              icon={<DollarSign size={18} />}
            />
            <KpiCard
              label="This Month"
              value={`$${dashboardStats.kpis.month_revenue}`}
              icon={<TrendingUp size={18} />}
            />
            <KpiCard
              label="Orders"
              value={dashboardStats.kpis.total_orders}
              icon={<ShoppingBag size={18} />}
              tone="blue"
            />
            <KpiCard
              label="Pending Orders"
              value={dashboardStats.kpis.pending_orders}
              icon={<Clock size={18} />}
              tone="amber"
            />
            <KpiCard
              label="Refunds"
              value={dashboardStats.kpis.refunds}
              icon={<RotateCcw size={18} />}
              tone="red"
            />
            <KpiCard
              label="New Users"
              value={dashboardStats.kpis.new_users}
              icon={<Users size={18} />}
              tone="violet"
            />
            <KpiCard
              label="AOV"
              value={`$${dashboardStats.kpis.aov}`}
              icon={<Receipt size={18} />}
            />
            <KpiCard
              label="Conversion Rate"
              value={`${dashboardStats.kpis.conversion_rate}%`}
              icon={<Percent size={18} />}
              tone="blue"
            />
          </div>
        )}

        {/* CHARTS */}
        <DashboardCharts stats={dashboardStats} />

        {/* ADVANCED PRODUCTS TABLE */}
        <div className={styles.inventorySection}>
          <div className={styles.glassCard}>
            {/* Table Header & Add Button */}
            <div className={styles.cardHeader}>
              <div className={styles.headerInfo}>
                <h3>Product List</h3>
                {products.length > 0 && (
                  <span className={styles.countBadge}>
                    {products.length} Items
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  resetProductForm();
                }}
                className={styles.addSmallBtn}
              >
                <Plus size={16} /> New Product
              </button>
            </div>

            {/* Table Area */}
            <div className={styles.tableArea}>
              {isLoadingProducts ? (
                <div className={styles.skeletonLoader}>
                  <div className={styles.spinner}></div>
                  <span>Loading products...</span>
                </div>
              ) : products.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No products available. Create a new one to get started!</p>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Discount</th>
                      <th>Status</th>
                      <th className={styles.actionsCell}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        {/* 1. TITLE */}
                        <td>
                          <span className={styles.primaryText}>{p.title}</span>
                        </td>

                        {/* 2. CATEGORY */}
                        <td>
                          <span className={styles.catBadge}>
                            {p.category?.name || "None"}
                          </span>
                        </td>

                        {/* 3. PRICE COLUMN */}
                        <td>
                          <div className={styles.priceContainer}>
                            {p.has_discount ? (
                              <>
                                <span className={styles.finalPrice}>
                                  ${Number(p.final_price).toFixed(2)}
                                </span>
                                <span className={styles.originalPrice}>
                                  ${Number(p.price).toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className={styles.standardPrice}>
                                ${Number(p.price).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 4. DISCOUNT COLUMN */}
                        <td>
                          {p.has_discount ? (
                            <div
                              className={`${styles.discountBadge} ${styles.pctBadge}`}
                            >
                              <span className={styles.badgePulse}></span>
                              {p.discount_percentage
                                ? `${p.discount_percentage}% OFF`
                                : p.discount_fixed
                                  ? `$${Number(p.discount_fixed).toFixed(2)} DROP`
                                  : `${Math.round(
                                      p.effective_discount_percentage || 0,
                                    )}% OFF`}
                            </div>
                          ) : (
                            <span className={styles.noDiscount}>—</span>
                          )}
                        </td>

                        {/* 5. STATUS */}
                        <td>
                          {p.is_published ? (
                            <span className={styles.statusOn}>
                              <CheckCircle size={14} /> Active
                            </span>
                          ) : (
                            <span className={styles.statusOff}>
                              <Circle size={14} /> Draft
                            </span>
                          )}
                        </td>

                        {/* 6. ACTIONS */}
                        <td className={styles.actionsCell}>
                          <div className={styles.actions}>
                            <button
                              onClick={() => setEditingProduct(p)}
                              className={styles.editBtn}
                              title="Edit Product"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              onClick={() => deleteProduct(p.id)}
                              className={styles.deleteBtn}
                              title="Delete Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* PAGINATION */}
            {pagination && pagination.last_page > 1 && (
              <div className={styles.paginationWrapper}>
                <div className={styles.pagination}>
                  <span className={styles.paginationInfo}>
                    Page {currentPage} of {pagination.last_page}
                  </span>
                  <div className={styles.paginationControls}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={styles.pArrow}
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <span className={`${styles.pNum} ${styles.pActive}`}>
                      {currentPage}
                    </span>

                    <button
                      disabled={currentPage === pagination.last_page}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={styles.pArrow}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Product Form (Sticky) */}
      <div
        style={{
          width: "380px",
          flexShrink: 0,
          position: "sticky",
          top: "24px",
        }}
      >
        <div className={styles.glassCard}>
          <ProductForm />
        </div>
      </div>
    </div>
  );
};

// Reusable KPI card — accent tone comes from data-tone, styled in
// AdminDashboard.module.css (.statCard / .statIcon). Defaults to the
// emerald brand tone when no tone is given.
const KpiCard = ({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone?: "amber" | "red" | "blue" | "violet";
}) => (
  <div className={styles.statCard} data-tone={tone}>
    <div className={styles.statCardBody}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
    <div className={styles.statIcon}>{icon}</div>
  </div>
);

export default ProductsTab;
