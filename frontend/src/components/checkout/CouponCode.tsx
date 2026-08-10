import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

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
    <div className="border rounded-3 p-3 mt-3 mb-4">
      <label className="fw-semibold small text-muted d-block mb-2">Coupon code</label>

      {appliedDiscount !== null ? (
        <div className="d-flex align-items-center justify-content-between">
          <span className="d-flex align-items-center gap-2 text-success">
            <CheckCircle2 size={16} />
            <strong>{couponCode}</strong> applied — -${appliedDiscount.toFixed(2)}
          </span>
          <button onClick={onRemove} className="btn btn-sm btn-outline-secondary">
            Remove
          </button>
        </div>
      ) : (
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Enter code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <button
            onClick={onApply}
            disabled={validateCoupon.isPending || !couponCode.trim()}
            className="btn btn-outline-primary text-nowrap"
          >
            {validateCoupon.isPending ? <Loader2 size={16} className="spinner" /> : "Apply"}
          </button>
        </div>
      )}

      {couponError && (
        <div className="d-flex align-items-center gap-1 text-danger small mt-2">
          <XCircle size={14} /> {couponError}
        </div>
      )}
    </div>
  );
}