import { ArrowRight, Loader2 } from "lucide-react";

interface PlaceOrderButtonProps {
  onClick: () => void;
  loading: boolean;
  totalPrice: number;
}

export default function PlaceOrderButton({ onClick, loading, totalPrice }: PlaceOrderButtonProps) {
  return (
    <button onClick={onClick} className="payBtn" disabled={loading}>
      {loading ? (
        <span className="d-flex align-items-center justify-content-center gap-2">
          <Loader2 size={18} className="spinner" /> Allocating Core Line Order...
        </span>
      ) : (
        <span className="d-flex align-items-center justify-content-center gap-2">
          Complete Purchase — ${totalPrice.toFixed(2)} <ArrowRight size={16} />
        </span>
      )}
    </button>
  );
}