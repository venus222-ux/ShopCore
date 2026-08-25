import {
  CheckCircle2,
  XCircle,
  Loader2,
  Tag,
} from "lucide-react";

import styles from "../../styles/Checkout.module.css";

interface CouponCodeProps {
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedDiscount: number | null;
  couponError: string | null;
  validateCoupon: any;
  totalFinalSubtotal: number;
  onApply: () => void;
  onRemove: () => void;
}

export default function CouponCode({
  couponCode,
  setCouponCode,
  appliedDiscount,
  couponError,
  validateCoupon,
  onApply,
  onRemove,
}: CouponCodeProps) {
  return (
    <div className={styles.couponBox}>
      <div className={styles.couponHeader}>
        <div className={styles.couponTitle}>
          <Tag size={16} />

          <span>Have a coupon?</span>
        </div>

        <span className={styles.couponOptional}>
          Optional
        </span>
      </div>

      {appliedDiscount !== null ? (
        <div className={styles.couponApplied}>
          <div className={styles.couponSuccess}>
            <CheckCircle2 size={18} />

            <div>
              <strong>{couponCode}</strong>

              <span>
                Coupon applied · -$
                {appliedDiscount.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className={styles.couponRemove}
          >
            Remove
          </button>
        </div>
      ) : (
        <div className={styles.couponForm}>
          <input
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) =>
              setCouponCode(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();

                if (
                  couponCode.trim() &&
                  !validateCoupon.isPending
                ) {
                  onApply();
                }
              }
            }}
            className={styles.couponInput}
            autoComplete="off"
          />

          <button
            type="button"
            onClick={onApply}
            disabled={
              validateCoupon.isPending ||
              !couponCode.trim()
            }
            className={styles.couponApply}
          >
            {validateCoupon.isPending ? (
              <>
                <Loader2
                  size={16}
                  className={styles.spinner}
                />

                Checking
              </>
            ) : (
              "Apply"
            )}
          </button>
        </div>
      )}

      {couponError && (
        <div className={styles.couponError}>
          <XCircle size={15} />

          <span>{couponError}</span>
        </div>
      )}
    </div>
  );
}