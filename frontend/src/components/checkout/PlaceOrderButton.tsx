import { ArrowRight, LockKeyhole, Loader2 } from "lucide-react";
import styles from "../../styles/Checkout.module.css";

interface PlaceOrderButtonProps {
  onClick: () => void;
  loading: boolean;
  totalPrice: number;
}

export default function PlaceOrderButton({
  onClick,
  loading,
  totalPrice,
}: PlaceOrderButtonProps) {
  return (
    <button
      type="button"
      className={styles.payBtn}
      onClick={onClick}
      disabled={loading}
      aria-label="Complete purchase"
    >
      {loading ? (
        <>
          <Loader2
            size={19}
            strokeWidth={2}
            className={styles.spinner}
          />

          <span>Processing...</span>
        </>
      ) : (
        <>
          <LockKeyhole
            size={18}
            strokeWidth={2}
          />

          <span>Complete Purchase</span>

          <span className={styles.payBtnAmount}>
            ${totalPrice.toFixed(2)}
          </span>

          <ArrowRight
            size={18}
            strokeWidth={2}
          />
        </>
      )}
    </button>
  );
}