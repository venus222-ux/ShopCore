import { useEffect, useState } from "react";
import { Download, FileText, Package, CalendarDays, Tag, RotateCcw, X } from "lucide-react";
import API from "../api";
import styles from "../styles/Dashboard.module.css";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const [refundModalOrder, setRefundModalOrder] = useState<any | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const handleDownload = async (id: number, type: "invoice" | "product" | "credit-note") => {
    const loaderKey = `${type}-${id}`;
    setDownloading(loaderKey);

    try {
      const urlPath =
        type === "invoice"
          ? `/orders/${id}/invoice`
          : type === "credit-note"
            ? `/refunds/${id}/credit-note`
            : `/products/${id}/download`;

      const res = await API.get(urlPath, { responseType: "blob" });

      const disposition = res.headers["content-disposition"];
      let filename =
        type === "invoice" ? `invoice-${id}.pdf` : type === "credit-note" ? `credit-note-${id}.pdf` : `product-${id}.zip`;

      const match = disposition?.match(/filename="(.+)"/);
      if (match) filename = match[1];

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`${type} download failed`, err);
      toast.error("Download failed");
    } finally {
      setDownloading(null);
    }
  };

  const loadData = () => {
    setLoading(true);

    Promise.allSettled([API.get("/orders"), API.get("/my-refunds")])
      .then(([ordersResult, refundsResult]) => {
        if (ordersResult.status === "fulfilled") {
          setOrders(ordersResult.value.data);
        } else {
          console.error("Failed to load orders", ordersResult.reason);
          toast.error("Failed to load your orders");
        }

        if (refundsResult.status === "fulfilled") {
          setRefunds(refundsResult.value.data);
        } else {
          // Refunds are optional context - orders should still render even
          // if this endpoint isn't available yet or the request fails.
          console.warn("Failed to load refunds", refundsResult.reason);
          setRefunds([]);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const refundedTotalForOrder = (orderId: number) =>
    refunds
      .filter((r) => r.order_id === orderId && (r.status === "succeeded" || r.status === "requested"))
      .reduce((sum, r) => sum + Number(r.amount), 0);

  const openRefundModal = (order: any) => {
    const already = refundedTotalForOrder(order.id);
    const remaining = Number(order.total) - already;
    setRefundAmount(remaining > 0 ? remaining : 0);
    setRefundReason("");
    setRefundModalOrder(order);
  };

  const submitRefundRequest = async () => {
    if (!refundModalOrder) return;

    if (refundAmount <= 0) {
      toast.warning("Amount must be greater than 0");
      return;
    }
    if (refundReason.trim().length < 3) {
      toast.warning("Please provide a reason (at least 3 characters)");
      return;
    }

    setSubmittingRefund(true);
    try {
      const res = await API.post(`/orders/${refundModalOrder.id}/refund-request`, {
        amount: refundAmount,
        reason: refundReason,
      });
      toast.success(res.data?.message || "Refund request submitted");
      setRefundModalOrder(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit refund request");
    } finally {
      setSubmittingRefund(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner}></div>
        <p>Loading your account...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Account Dashboard</h1>
          <p>Manage your orders, invoices, and digital downloads</p>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={48} strokeWidth={1.5} />
          <h3>No orders found</h3>
          <p>You haven't placed any orders yet. Once you do, they will appear here.</p>
        </div>
      ) : (
        <div className={styles.orderGrid}>
          {orders.map((order) => {
            const totalAmount = Number(order.total || 0);
            const discountAmount = Number(order.discount_total || 0);
            const subtotalAmount = totalAmount + discountAmount;
            const hasOrderDiscount = discountAmount > 0;

            const orderRefunds = refunds.filter((r) => r.order_id === order.id);
            const alreadyRefunded = refundedTotalForOrder(order.id);
            const canRequestRefund = order.status === "paid" && alreadyRefunded < totalAmount;

            return (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderId}>INVOICE #{order.invoice_number || order.id}</span>
                    <span className={styles.orderDate}>
                      <CalendarDays size={14} />
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <span className={`${styles.statusPill} ${styles[order.status?.toLowerCase() || ""]}`}>
                    {order.status}
                  </span>
                </div>

                <div className={styles.orderBody}>
                  <div className={styles.itemsSection}>
                    <span className={styles.sectionLabel}>Your Products</span>
                    <div className={styles.itemList}>
                      {order.items?.map((item: any) => {
                        const prod = item.product;
                        const hasProductDiscount = prod?.has_discount || prod?.discount_percentage;

                        return (
                          <div key={item.id} className={styles.itemRow}>
                            <div className={styles.itemInfo}>
                              <span className={styles.itemTitle}>{prod?.title || "Digital Product"}</span>
                              {hasProductDiscount && (
                                <div className={styles.itemDiscountBadge}>
                                  <Tag size={10} />
                                  <span>{prod.effective_discount_percentage || prod.discount_percentage}% Off</span>
                                </div>
                              )}
                            </div>

                            {prod?.asset_type === "digital" && (
                              <button
                                className={styles.downloadBtn}
                                disabled={downloading === `product-${item.product_id}`}
                                onClick={() => handleDownload(item.product_id, "product")}
                              >
                                <Download size={14} />
                                <span>{downloading === `product-${item.product_id}` ? "..." : "Download"}</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={styles.billingBox}>
                    <span className={styles.sectionLabel}>Billing Details</span>
                    <div className={styles.billingInfo}>
                      {order.billing_company && <strong className={styles.companyName}>{order.billing_company}</strong>}
                      <span className={styles.billingName}>{order.billing_name}</span>
                      <span>{order.billing_address_1}</span>
                      <span>
                        {order.billing_city}, {order.billing_postal_code}
                      </span>
                      {order.billing_vat_number && <span className={styles.vatTag}>VAT: {order.billing_vat_number}</span>}
                    </div>
                  </div>

                  <div className={styles.priceSection}>
                    <span className={styles.sectionLabel}>Payment Summary</span>
                    <div className={styles.priceBreakdown}>
                      {hasOrderDiscount && (
                        <>
                          <div className={styles.breakdownRow}>
                            <span>Subtotal</span>
                            <span>${subtotalAmount.toFixed(2)}</span>
                          </div>
                          <div className={`${styles.breakdownRow} ${styles.discountRow}`}>
                            <span className={styles.discountLabel}>
                              <Tag size={12} /> Discount
                            </span>
                            <span>-${discountAmount.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                      {alreadyRefunded > 0 && (
                        <div className={`${styles.breakdownRow} ${styles.discountRow}`}>
                          <span className={styles.discountLabel}>
                            <RotateCcw size={12} /> Refunded
                          </span>
                          <span>-${alreadyRefunded.toFixed(2)}</span>
                        </div>
                      )}
                      <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>Total Paid</span>
                        <p className={styles.totalPrice}>${totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {orderRefunds.length > 0 && (
                  <div className={styles.refundHistory}>
                    <span className={styles.sectionLabel}>Refund History</span>
                    {orderRefunds.map((r) => (
                      <div key={r.id} className={styles.refundRow}>
                        <span>${Number(r.amount).toFixed(2)}</span>
                        <span className={`${styles.refundStatusPill} ${styles[r.status]}`}>{r.status}</span>
                        {r.status === "succeeded" && (
                          <button
                            className={styles.miniDownloadBtn}
                            disabled={downloading === `credit-note-${r.id}`}
                            onClick={() => handleDownload(r.id, "credit-note")}
                          >
                            <FileText size={12} />
                            {downloading === `credit-note-${r.id}` ? "..." : "Credit Note"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.orderFooter}>
                  <button
                    className={styles.secondaryBtn}
                    disabled={downloading === `invoice-${order.id}`}
                    onClick={() => handleDownload(order.id, "invoice")}
                  >
                    <FileText size={15} />
                    {downloading === `invoice-${order.id}` ? "Generating..." : "Get PDF Invoice"}
                  </button>

                  {canRequestRefund && (
                    <button className={styles.refundRequestBtn} onClick={() => openRefundModal(order)}>
                      <RotateCcw size={15} />
                      Request Refund
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {refundModalOrder && (
        <div className={styles.modalOverlay} onClick={() => setRefundModalOrder(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Request a Refund</h3>
              <button className={styles.closeActionBtn} onClick={() => setRefundModalOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalHint}>
                Order #{refundModalOrder.invoice_number || refundModalOrder.id} - Max refundable: $
                {(Number(refundModalOrder.total) - refundedTotalForOrder(refundModalOrder.id)).toFixed(2)}
              </p>

              <div className={styles.formGroup}>
                <label>Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Reason</label>
                <textarea
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Tell us why you'd like a refund..."
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setRefundModalOrder(null)} disabled={submittingRefund}>
                Cancel
              </button>
              <button className={styles.confirmBtn} onClick={submitRefundRequest} disabled={submittingRefund}>
                {submittingRefund ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;