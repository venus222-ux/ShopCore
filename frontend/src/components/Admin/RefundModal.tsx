import React, { useState, useEffect } from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";
import styles from "../../styles/RefundModal.module.css";
import { useAdminStore } from "../../store/useAdminStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  maxAmount: number;
  onSuccess?: () => void;
}

const RefundModal: React.FC<Props> = ({
  isOpen,
  onClose,
  orderId,
  maxAmount,
  onSuccess,
}) => {
  const refundOrder = useAdminStore((s) => s.refundOrder);
  const [amount, setAmount] = useState<number>(maxAmount);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset local state when modal opens with a new order
  useEffect(() => {
    if (isOpen) {
      setAmount(maxAmount);
      setReason("");
      setError(null);
    }
  }, [isOpen, maxAmount]);

  if (!isOpen) return null;

  const validate = () => {
    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return false;
    }
    if (amount > maxAmount) {
      setError(`Max refundable is $${maxAmount}`);
      return false;
    }
    if (reason.trim().length < 3) {
      setError("Please provide a valid reason");
      return false;
    }
    return true;
  };

  const handleRefund = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await refundOrder(orderId, amount, reason);
      onSuccess?.();
      onClose();
    } catch (e) {
      setError("Failed to process refund. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Process Refund</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.inputGroup}>
            <label>Refund Amount</label>
            <div className={styles.inputWrapper}>
              <span className={styles.currencyPrefix}>$</span>
              <input
                className={styles.inputField}
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                step="0.01"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Reason for Refund</label>
            <textarea
              className={styles.textareaField}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Customer requested cancellation"
            />
          </div>

          <div className={styles.infoBox}>
            Order ID: <strong>#{orderId}</strong> • Available:{" "}
            <strong>${maxAmount}</strong>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={styles.refundBtn}
            onClick={handleRefund}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Processing...
              </>
            ) : (
              "Confirm Refund"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;
