import { useEffect, useState } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import { CheckCircle, XCircle, Clock, X } from "lucide-react";
import styles from "../../styles/OrdersTab.module.css";

const RefundRequestsTab = () => {
  const { refundRequests, fetchRefundRequests, approveRefundRequest, rejectRefundRequest } =
    useAdminStore();

  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectModalRequest, setRejectModalRequest] = useState<any | null>(null);
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  // ↓↓↓ AICI - handleApprove cu gardă sincronă ↓↓↓
  const handleApprove = async (request: any) => {
    // Guard sincron, verificat ÎNAINTE de orice await - blochează un al
    // doilea click care ar ajunge la server înainte ca React să apuce să
    // re-randeze butonul cu disabled=true, evitând eroarea confuză
    // "already processed" pe un refund care de fapt s-a aprobat corect
    // la primul click.
    if (processingId !== null) return;

    if (
      !window.confirm(
        `Approve refund of $${Number(request.amount).toFixed(2)} for order #${request.order_id}? This will call Stripe immediately.`,
      )
    ) {
      return;
    }

    setProcessingId(request.id);
    try {
      await approveRefundRequest(request.id);
    } catch {
      // toast already shown by store
    } finally {
      setProcessingId(null);
    }
  };
  // ↑↑↑ PÂNĂ AICI ↑↑↑

  const openReject = (request: any) => {
    setRejectModalRequest(request);
    setAdminNote("");
  };

  // ↓↓↓ AICI - handleReject cu aceeași gardă ↓↓↓
  const handleReject = async () => {
    if (!rejectModalRequest || processingId !== null) return;

    setProcessingId(rejectModalRequest.id);
    try {
      await rejectRefundRequest(rejectModalRequest.id, adminNote);
      setRejectModalRequest(null);
    } catch {
      // toast already shown by store
    } finally {
      setProcessingId(null);
    }
  };
  // ↑↑↑ PÂNĂ AICI ↑↑↑

  if (refundRequests.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Clock size={40} strokeWidth={1.5} />
        <h3>No pending refund requests</h3>
        <p>Customer-submitted refund requests will appear here for review.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Requested</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {refundRequests.map((r: any) => (
              <tr key={r.id}>
                <td className={styles.orderId}>#{r.order_id}</td>
                <td className={styles.customerName}>
                  {r.order?.user?.name || r.order?.user?.email || "Unknown"}
                </td>
                <td className={styles.totalAmount}>${Number(r.amount).toFixed(2)}</td>
                <td style={{ maxWidth: 280 }}>
                  <span style={{ fontSize: "0.85rem", color: "#475569" }}>{r.reason}</span>
                </td>
                <td className={styles.dateCol}>
                  {new Date(r.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td>
                  <div className={styles.actionGroup}>
                    <button
                      className={`${styles.iconBtn} ${styles.completeActionBtn}`}
                      onClick={() => handleApprove(r)}
                      disabled={processingId === r.id}
                      title="Approve Refund"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      className={`${styles.iconBtn} ${styles.releaseActionBtn}`}
                      onClick={() => openReject(r)}
                      disabled={processingId === r.id}
                      title="Reject Request"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rejectModalRequest && (
        <div className={styles.modalOverlay} onClick={() => setRejectModalRequest(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Reject Refund Request</h3>
              <button className={styles.closeActionBtn} onClick={() => setRejectModalRequest(null)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.75rem" }}>
                Order #{rejectModalRequest.order_id} - ${Number(rejectModalRequest.amount).toFixed(2)}
              </p>
              <div className={styles.detailRow} style={{ flexDirection: "column", alignItems: "stretch" }}>
                <label style={{ marginBottom: "0.4rem" }}>Note to customer (optional)</label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g., Outside our return policy window"
                  style={{
                    padding: "0.5rem",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.completeActionBtn}
                onClick={handleReject}
                disabled={processingId === rejectModalRequest.id}
                style={{ width: "100%" }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundRequestsTab;