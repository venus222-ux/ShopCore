import { Truck, Loader2, Edit3 } from "lucide-react";
import BillingAddressForm from "../BillingAddressForm";
import { BillingData } from "../../types/checkout";
import AddressSummaryBox from "./AddressSummaryBox";

interface ShippingAddressFormProps {
  requiresShipping: boolean;
  sameAsBilling: boolean;
  setSameAsBilling: (value: boolean) => void;
  savedShippingAddresses: any[];
  shippingAddressesLoading: boolean;
  selectedShippingAddressId: number | "new";
  setSelectedShippingAddressId: (id: number | "new") => void;
  shippingAddress: BillingData;
  setShippingAddress: (data: BillingData | ((prev: BillingData) => BillingData)) => void;
  emptyBilling: BillingData;
  isAddingNewShippingAddress: boolean;
  showShippingSelector: boolean;
  setShowShippingSelector: (v: boolean) => void;
}

export default function ShippingAddressForm({
  requiresShipping,
  sameAsBilling,
  setSameAsBilling,
  savedShippingAddresses,
  shippingAddressesLoading,
  selectedShippingAddressId,
  setSelectedShippingAddressId,
  shippingAddress,
  setShippingAddress,
  emptyBilling,
  isAddingNewShippingAddress,
  showShippingSelector,
  setShowShippingSelector,
}: ShippingAddressFormProps) {
  if (!requiresShipping) return null;

  const selectedSaved = savedShippingAddresses?.find((a) => a.id === selectedShippingAddressId);
  // Box mode: has a saved default/selected address, not currently editing/choosing
  const showBox = selectedSaved && !showShippingSelector;

  return (
    <div className="mt-4">
      <h5 className="d-flex align-items-center gap-2 mb-3">
        <Truck size={18} /> Shipping
      </h5>

      <label className="form-check mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          checked={sameAsBilling}
          onChange={(e) => setSameAsBilling(e.target.checked)}
        />
        <span className="form-check-label">Shipping address is the same as billing</span>
      </label>

      {!sameAsBilling && (
        <>
          {shippingAddressesLoading ? (
            <div className="d-flex align-items-center gap-2 text-muted py-2">
              <Loader2 size={16} className="spinner" />
              <span>Loading shipping addresses...</span>
            </div>
          ) : showBox ? (
            <AddressSummaryBox
              address={selectedSaved}
              title="Delivering to"
              onChangeClick={() => setShowShippingSelector(true)}
            />
          ) : (
            <>
              {savedShippingAddresses && savedShippingAddresses.length > 0 && (
                <div className="mb-3 d-flex flex-column gap-2">
                  {savedShippingAddresses.map((a: any) => (
                    <label
                      key={a.id}
                      className={`border rounded-3 p-3 d-flex align-items-start gap-2 ${
                        selectedShippingAddressId === a.id ? "border-primary" : ""
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        name="shipping-address"
                        className="form-check-input mt-1"
                        checked={selectedShippingAddressId === a.id}
                        onChange={() => {
                          setSelectedShippingAddressId(a.id);
                          setShowShippingSelector(false);
                        }}
                      />
                      <div>
                        <p className="mb-0">{a.first_name} {a.last_name}</p>
                        <p className="mb-0">{a.address_line_1}</p>
                        {a.address_line_2 && <p className="mb-0">{a.address_line_2}</p>}
                        <p className="mb-0">{a.city}, {a.state} {a.postal_code}</p>
                        <p className="mb-0 text-muted">{a.country}</p>
                      </div>
                    </label>
                  ))}

                  <label
                    className={`border rounded-3 p-3 d-flex align-items-center gap-2 ${
                      isAddingNewShippingAddress ? "border-primary" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="radio"
                      name="shipping-address"
                      className="form-check-input"
                      checked={isAddingNewShippingAddress}
                      onChange={() => {
                        setSelectedShippingAddressId("new");
                        setShippingAddress(emptyBilling);
                      }}
                    />
                    <span className="d-flex align-items-center gap-1">
                      <Edit3 size={14} /> Use a new address
                    </span>
                  </label>
                </div>
              )}

              {isAddingNewShippingAddress && (
                <div className="formWrapper">
                  <BillingAddressForm
                    data={shippingAddress}
                    setData={setShippingAddress}
                    title="Shipping Address"
                    requirePhone
                    showDeliveryInstructions
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}