import { useEffect, useState, useMemo } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import RefundModal from "./RefundModal";
import {
  RotateCcw,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  FileText,
  RefreshCw,
  Download,
  Search,
  ShoppingCart,
  TrendingUp,
  Tag,
  X,
  XCircle,
  PackagePlus,
  Banknote,
} from "lucide-react";

import styles from "../../styles/OrdersTab.module.css";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const isFullyRefunded = (o: any) => Number(o.refunded_total || 0) >= Number(o.total);
const isPartiallyRefunded = (o: any) =>
  Number(o.refunded_total || 0) > 0 && Number(o.refunded_total || 0) < Number(o.total);

const canRefund = (o: any) => o.status === "paid" && !isFullyRefunded(o);
const canComplete = (o: any) => o.status === "pending";
const canConfirmCash = (o: any) => o.payment_method === "cash" && o.status === "pending";
const canRelease = (o: any) => o.status?.toLowerCase() === "pending";
const canRestock = (o: any) => Number(o.refunded_total || 0) > 0;

const OrdersTab = () => {
  const {
    orders,
    fetchOrders,
    fetchRefunds,
    downloadInvoice,
    selectedOrder,
    setSelectedOrder,
    fetchOrderById,
    completeOrder,
    releaseOrder,
    restockOrder,
    confirmCashOrder,
  } = useAdminStore();

  const [refundOpen, setRefundOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [confirmingCashId, setConfirmingCashId] = useState<number | null>(null);
  const [releasingId, setReleasingId] = useState<number | null>(null);
  const [restockingId, setRestockingId] = useState<number | null>(null);

  const applyFilters = (page = 1) => {
    fetchOrders(page, {
      search,
      status: status === "all" ? "" : status,
      per_page: 20,
    });
  };

  useEffect(() => {
    applyFilters(1);
    fetchRefunds();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => applyFilters(1), 500);
    return () => clearTimeout(t);
  }, [search, status]);

  const openDetails = async (order: any) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
    await fetchOrderById(order.id);
  };

  const openRefund = (order: any) => {
    setSelectedOrder(order);
    setRefundOpen(true);
  };

  const handleComplete = async (order: any) => {
    if (completingId !== null) return; // ← gardă nouă
    if (
      !window.confirm(
        `Mark order #${order.id} as completed? This will finalize stock deduction and send the confirmation email.`,
      )
    ) {
      return;
    }
    setCompletingId(order.id);
    try {
      await completeOrder(order.id);
      applyFilters(1);
    } finally {
      setCompletingId(null);
    }
  };

  const handleConfirmCash = async (order: any) => {
    if (confirmingCashId !== null) return; // ← gardă nouă
    if (
      !window.confirm(
        `Confirm cash payment of $${Number(order.total).toFixed(2)} received for order #${order.id}?`,
      )
    ) {
      return;
    }
    setConfirmingCashId(order.id);
    try {
      await confirmCashOrder(order.id);
      applyFilters(1);
    } finally {
      setConfirmingCashId(null);
    }
  };

  const handleRelease = async (order: any) => {
    if (releasingId !== null) return; // ← gardă nouă
    if (
      !window.confirm(
        `Cancel order #${order.id} and release its reserved stock? This should only be used for abandoned/unpaid orders.`,
      )
    ) {
      return;
    }
    setReleasingId(order.id);
    try {
      await releaseOrder(order.id);
      applyFilters(1);
    } finally {
      setReleasingId(null);
    }
  };

  const handleRestock = async (order: any) => {
    if (restockingId !== null) return; // ← gardă nouă
    if (
      !window.confirm(
        `Manually restock items for order #${order.id}? Only do this if the returned items have been physically received back into inventory.`,
      )
    ) {
      return;
    }
    setRestockingId(order.id);
    try {
      await restockOrder(order.id);
      applyFilters(1);
    } finally {
      setRestockingId(null);
    }
  };

  const kpis = useMemo(() => {
    return orders.reduce(
      (acc, o) => {
        const total = Number(o.total || 0);
        const discount = Number(o.discount_total || 0);

        acc.totalOrders += 1;
        acc.revenue += total;
        acc.discounted += discount;
        acc.refunded += Number(o.refunded_total || 0);
        if (o.status === "pending") acc.pending += 1;

        return acc;
      },
      { totalOrders: 0, revenue: 0, discounted: 0, refunded: 0, pending: 0 },
    );
  }, [orders]);

  const statusChart = {
    labels: ["Paid", "Pending", "Refunded"],
    datasets: [
      {
        data: [
          orders.filter((o) => o.status === "paid").length,
          orders.filter((o) => o.status === "pending").length,
          orders.filter((o) => o.status === "refunded").length,
        ],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        hoverBackgroundColor: ["#059669", "#d97706", "#dc2626"],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { boxWidth: 12, font: { family: "Inter", size: 12 }, color: "#475569" },
      },
    },
    maintainAspectRatio: false,
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const map: any = {
      paid: { icon: CheckCircle, class: styles.statusPaid },
      refunded: { icon: RotateCcw, class: styles.statusRefunded },
      pending: { icon: Clock, class: styles.statusPending },
    };
    const c = map[status?.toLowerCase()] || { icon: AlertCircle, class: styles.statusDefault };
    const Icon = c.icon;
    return (
      <span className={`${styles.badge} ${c.class}`}>
        <Icon size={12} /> {status}
      </span>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Orders Overview</h1>
          <p className={styles.subtitle}>
            Manage your store's transactions, tracking analytics, and customer refunds.
          </p>
        </div>
        <button onClick={() => applyFilters(1)} className={styles.refreshBtn}>
          <RefreshCw size={15} /> Sync Data
        </button>
      </header>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiContent}>
            <label>Total Orders</label>
            <h3>{kpis.totalOrders}</h3>
          </div>
          <div className={`${styles.kpiIcon} ${styles.blueIcon}`}>
            <ShoppingCart size={20} />
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiContent}>
            <label>Net Revenue</label>
            <h3>
              ${kpis.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className={`${styles.kpiIcon} ${styles.greenIcon}`}>
            <TrendingUp size={20} />
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiContent}>
            <label>Discounts Given</label>
            <h3>
              ${kpis.discounted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className={`${styles.kpiIcon} ${styles.purpleIcon}`}>
            <Tag size={20} />
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiContent}>
            <label>Total Refunded</label>
            <h3>
              ${kpis.refunded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className={`${styles.kpiIcon} ${styles.redIcon}`}>
            <RotateCcw size={20} />
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <section className={styles.tableSection}>
          <div className={styles.filterBar}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={16} />
              <input
                type="text"
                placeholder="Search order ID, customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Pricing Breakdown</th>
                  <th>Status</th>
                  <th>Date Placed</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => {
                  const itemTotal = Number(o.total || 0);
                  const itemDiscount = Number(o.discount_total || 0);
                  const originalSubtotal = itemTotal + itemDiscount;

                  return (
                    <tr key={o.id}>
                      <td className={styles.orderId}>#{o.id}</td>
                      <td className={styles.customerName}>{o.user?.name || "Guest User"}</td>
                      <td>
                        <div className={styles.amountWrap}>
                          <div className={styles.priceRow}>
                            <span className={styles.totalAmount}>${itemTotal.toFixed(2)}</span>
                            {itemDiscount > 0 && (
                              <span className={styles.slashedPrice}>${originalSubtotal.toFixed(2)}</span>
                            )}
                          </div>
                          {itemDiscount > 0 && (
                            <span className={styles.discountBadge}>
                              <Tag size={10} /> Saved ${itemDiscount.toFixed(2)}
                            </span>
                          )}
                          {isPartiallyRefunded(o) && (
                            <span className={styles.refundInfo}>
                              Partial Refund (-${Number(o.refunded_total).toFixed(2)})
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={o.status} />
                        {o.payment_method === "cash" && (
                          <span
                            className="badge bg-warning text-dark ms-2"
                            style={{ fontSize: "0.65rem" }}
                          >
                            CASH
                          </span>
                        )}
                      </td>
                      <td className={styles.dateCol}>
                        {new Date(o.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <div className={styles.actionGroup}>
                          <button className={styles.iconBtn} onClick={() => openDetails(o)} title="View Details">
                            <Eye size={16} />
                          </button>
                          <button
                            className={styles.iconBtn}
                            onClick={() => downloadInvoice(o.id)}
                            title="Download Invoice"
                          >
                            <FileText size={16} />
                          </button>

                          {canConfirmCash(o) ? (
                            <button
                              className={`${styles.iconBtn} ${styles.completeActionBtn}`}
                              onClick={() => handleConfirmCash(o)}
                              disabled={confirmingCashId === o.id}
                              title="Confirm Cash Received"
                            >
                              <Banknote size={16} />
                            </button>
                          ) : (
                            canComplete(o) && (
                              <button
                                className={`${styles.iconBtn} ${styles.completeActionBtn}`}
                                onClick={() => handleComplete(o)}
                                disabled={completingId === o.id}
                                title="Mark as Completed"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )
                          )}

                          {canRelease(o) && (
                            <button
                              className={`${styles.iconBtn} ${styles.releaseActionBtn}`}
                              onClick={() => handleRelease(o)}
                              disabled={releasingId === o.id}
                              title="Cancel & Release Stock"
                            >
                              <XCircle size={16} />
                            </button>
                          )}

                          {canRestock(o) && (
                            <button
                              className={`${styles.iconBtn} ${styles.restockActionBtn}`}
                              onClick={() => handleRestock(o)}
                              disabled={restockingId === o.id}
                              title="Manually Restock Items"
                            >
                              <PackagePlus size={16} />
                            </button>
                          )}

                          <button
                            className={`${styles.iconBtn} ${styles.refundActionBtn} ${!canRefund(o) ? styles.disabledBtn : ""}`}
                            onClick={() => openRefund(o)}
                            disabled={!canRefund(o)}
                            title="Issue Refund"
                          >
                            <RotateCcw size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <aside className={styles.sidebarSection}>
          <div className={styles.chartCard}>
            <h3>Order Distribution</h3>
            <div className={styles.pieWrapper}>
              <Pie data={statusChart} options={chartOptions} />
            </div>
          </div>
        </aside>
      </div>

      {/* Modal detalii */}
      {detailsOpen && selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setDetailsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Order Details Reference</h3>
              <button className={styles.closeActionBtn} onClick={() => setDetailsOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <label>Order Link ID</label>
                <span>#{selectedOrder.id}</span>
              </div>
              <div className={styles.detailRow}>
                <label>Fulfillment Status</label>
                <StatusBadge status={selectedOrder.status} />
                {selectedOrder.payment_method === "cash" && (
                  <span
                    className="badge bg-warning text-dark ms-2"
                    style={{ fontSize: "0.65rem" }}
                  >
                    CASH
                  </span>
                )}
              </div>

              <div className={styles.modalDivider} />

              <div className={styles.detailRow}>
                <label>Subtotal (Original Price)</label>
                <span>
                  $
                  {(Number(selectedOrder.total || 0) + Number(selectedOrder.discount_total || 0)).toFixed(2)}
                </span>
              </div>
              {Number(selectedOrder.discount_total || 0) > 0 && (
                <div className={`${styles.detailRow} ${styles.modalDiscountText}`}>
                  <label>Campaign Deductions</label>
                  <span>-${Number(selectedOrder.discount_total).toFixed(2)}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <label>Final Paid Revenue</label>
                <strong className={styles.modalFinalPrice}>
                  ${Number(selectedOrder.total || 0).toFixed(2)}
                </strong>
              </div>

              {canConfirmCash(selectedOrder) ? (
                <>
                  <div className={styles.modalDivider} />
                  <button
                    className={styles.completeActionBtn}
                    onClick={() => handleConfirmCash(selectedOrder)}
                    disabled={confirmingCashId === selectedOrder.id}
                    style={{ width: "100%", marginTop: "0.5rem" }}
                  >
                    <Banknote size={14} /> Confirm Cash Received
                  </button>
                </>
              ) : (
                canComplete(selectedOrder) && (
                  <>
                    <div className={styles.modalDivider} />
                    <button
                      className={styles.completeActionBtn}
                      onClick={() => handleComplete(selectedOrder)}
                      disabled={completingId === selectedOrder.id}
                      style={{ width: "100%", marginTop: "0.5rem" }}
                    >
                      <CheckCircle size={14} /> Mark as Completed
                    </button>
                  </>
                )
              )}

              {canRelease(selectedOrder) && (
                <button
                  className={styles.releaseActionBtn}
                  onClick={() => handleRelease(selectedOrder)}
                  disabled={releasingId === selectedOrder.id}
                  style={{ width: "100%", marginTop: "0.5rem" }}
                >
                  <XCircle size={14} /> Cancel & Release Stock
                </button>
              )}

              {canRestock(selectedOrder) && (
                <button
                  className={styles.restockActionBtn}
                  onClick={() => handleRestock(selectedOrder)}
                  disabled={restockingId === selectedOrder.id}
                  style={{ width: "100%", marginTop: "0.5rem" }}
                >
                  <PackagePlus size={14} /> Manually Restock Items
                </button>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.downloadBtn} onClick={() => downloadInvoice(selectedOrder.id)}>
                <Download size={14} /> Export Document Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {refundOpen && selectedOrder && (
        <RefundModal
          isOpen={refundOpen}
          onClose={() => setRefundOpen(false)}
          orderId={selectedOrder.id}
          maxAmount={Number(selectedOrder.total) - Number(selectedOrder.refunded_total || 0)}
          onSuccess={() => {
            applyFilters(1);
            fetchRefunds();
          }}
        />
      )}
    </div>
  );
};

export default OrdersTab;