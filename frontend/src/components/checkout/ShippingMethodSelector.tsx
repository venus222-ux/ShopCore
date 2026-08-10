import { Loader2 } from "lucide-react";

interface ShippingMethodSelectorProps {
  requiresShipping: boolean;
  shippingMethods: any[];
  shippingMethodsLoading: boolean;
  selectedShippingMethodId: number | null;
  setSelectedShippingMethodId: (id: number) => void;
}

export default function ShippingMethodSelector({
  requiresShipping,
  shippingMethods,
  shippingMethodsLoading,
  selectedShippingMethodId,
  setSelectedShippingMethodId,
}: ShippingMethodSelectorProps) {
  if (!requiresShipping) return null;

  return (
    <div className="mt-3">
      {shippingMethodsLoading ? (
        <div className="d-flex align-items-center gap-2 text-muted py-2">
          <Loader2 size={16} className="spinner" />
          <span>Loading shipping options...</span>
        </div>
      ) : shippingMethods && shippingMethods.length > 0 ? (
        <div className="d-flex flex-column gap-2">
          {shippingMethods.map((m: any) => (
            <label
              key={m.id}
              className={`border rounded-3 p-3 d-flex align-items-center justify-content-between ${
                selectedShippingMethodId === m.id ? "border-primary" : ""
              }`}
              style={{ cursor: "pointer" }}
            >
              <span className="d-flex align-items-center gap-2">
                <input
                  type="radio"
                  name="shipping-method"
                  className="form-check-input"
                  checked={selectedShippingMethodId === m.id}
                  onChange={() => setSelectedShippingMethodId(m.id)}
                />
                <span>
                  {m.name}
                  {m.description && <small className="d-block text-muted">{m.description}</small>}
                </span>
              </span>
              <strong>${Number(m.price).toFixed(2)}</strong>
            </label>
          ))}
        </div>
      ) : (
        <p className="text-danger small">
          No shipping methods are currently available.
        </p>
      )}
    </div>
  );
}