import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import API from "../api";
import { useCartStore } from "../store/useCartStore";
import { CheckCircle, Banknote } from "lucide-react";

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const isCash = searchParams.get("method") === "cash";
  const clearCart = useCartStore((s) => s.clearCart);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cart is cleared here, after Checkout has already unmounted - avoids
    // the race where Checkout briefly sees an empty cart (requiresShipping
    // flips false) and its COD-availability watcher fires a misleading
    // "no longer available" toast right after a successful order.
    clearCart();
  }, []);

  useEffect(() => {
    if (!orderId) return;
    API.get(`/orders/${orderId}`)
      .then((res) => setOrder(res.data))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return <div className="container py-5 text-center">Loading...</div>;
  }

  return (
    <div className="container py-5 text-center" style={{ maxWidth: 560 }}>
      <div className="mb-3 text-success">
        {isCash ? <Banknote size={48} /> : <CheckCircle size={48} />}
      </div>

      <h2 className="fw-bold mb-2">
        {isCash ? "Order Placed - Pay on Delivery" : "Order Confirmed"}
      </h2>

      <p className="text-muted mb-4">
        {isCash
          ? "Your order has been placed. Please have the exact amount ready in cash when your order arrives."
          : "Thank you for your purchase!"}
      </p>

      {order && (
        <div className="border rounded-3 p-4 text-start mb-4">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Order</span>
            <strong>#{order.invoice_number || order.id}</strong>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">Amount Due</span>
            <strong>${Number(order.total).toFixed(2)}</strong>
          </div>
        </div>
      )}

      <Link to="/dashboard" className="btn btn-primary px-4">
        Go to My Orders
      </Link>
    </div>
  );
}