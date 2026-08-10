import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import API from "../api";
import { toast } from "react-toastify";

import AddressSelector from "../components/checkout/AddressSelector";
import ShippingAddressForm from "../components/checkout/ShippingAddressForm";
import ShippingMethodSelector from "../components/checkout/ShippingMethodSelector";
import CouponCode from "../components/checkout/CouponCode";
import OrderSummary from "../components/checkout/OrderSummary";
import PlaceOrderButton from "../components/checkout/PlaceOrderButton";

import BillingAddressForm from "../components/BillingAddressForm";
import { BillingData, emptyBillingData } from "../types/checkout";

import { useAddresses } from "../hooks/useAddresses";
import { useShippingMethods } from "../hooks/useShippingMethods";
import { useValidateCoupon } from "../hooks/useValidateCoupon";
import { useSettingsStore } from "../store/useSettingsStore";
import { useStore } from "../store/useStore";
import styles from "../styles/Checkout.module.css";

export default function Checkout() {
  const navigate = useNavigate();
  const { items } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [checkoutSucceeded, setCheckoutSucceeded] = useState(false);

  const requiresShipping = items.some((i) => i.asset_type === "physical");

  // Billing
  const { data: savedAddresses } = useAddresses("billing");
  const [selectedAddressId, setSelectedAddressId] = useState<number | "new">("new");
  const [billing, setBilling] = useState<BillingData>(emptyBillingData);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [showBillingSelector, setShowBillingSelector] = useState(false);

  // Shipping
  const { data: savedShippingAddresses, isLoading: shippingAddressesLoading } =
    useAddresses("shipping");
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<number | "new">("new");
  const [shippingAddress, setShippingAddress] = useState<BillingData>(emptyBillingData);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [showShippingSelector, setShowShippingSelector] = useState(false);

  // Shipping Method
  const { data: shippingMethods, isLoading: shippingMethodsLoading } = useShippingMethods(requiresShipping);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<number | null>(null);

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const validateCoupon = useValidateCoupon();

  // Settings (VAT + coupons + COD)
  const vatPercent = useSettingsStore((state) => state.vatPercent);
  const couponsEnabled = useSettingsStore((state) => state.couponsEnabled);
  const codEnabled = useSettingsStore((state) => state.codEnabled);
  const codMaxOrderValue = useSettingsStore((state) => state.codMaxOrderValue);
  const codFee = useSettingsStore((state) => state.codFee);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Stop the settings poll and the COD/coupon availability watchers the
  // moment checkout succeeds - clearing the cart right after changes
  // requiresShipping to false, which would otherwise make codAvailable
  // flip to false and fire the "COD no longer available" toast on a page
  // the shopper has already left, misleadingly right after a successful
  // cash order.
  useEffect(() => {
    if (checkoutSucceeded) return;

    const interval = setInterval(() => {
      fetchSettings();
    }, 30000);

    return () => clearInterval(interval);
  }, [checkoutSucceeded]);

  // Pricing
  const { totalOriginalSubtotal, totalFinalSubtotal, totalDiscountSaved } = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const qty = item.quantity || 1;
        const originalPrice = Number(item.price || 0);
        const finalPrice =
          item.has_discount && item.final_price !== undefined
            ? Number(item.final_price)
            : originalPrice;

        acc.totalOriginalSubtotal += qty * originalPrice;
        acc.totalFinalSubtotal += qty * finalPrice;
        acc.totalDiscountSaved += qty * (originalPrice - finalPrice);
        return acc;
      },
      { totalOriginalSubtotal: 0, totalFinalSubtotal: 0, totalDiscountSaved: 0 }
    );
  }, [items]);

  // Explicit user-facing notice when coupons disappear mid-session,
  // instead of silently clearing the discount with no explanation.
  const prevCouponsEnabled = useRef(couponsEnabled);

  useEffect(() => {
    if (checkoutSucceeded) return;
    if (prevCouponsEnabled.current && !couponsEnabled && appliedDiscount !== null) {
      toast.info("Coupons are no longer available. Your discount has been removed.");
      setAppliedDiscount(null);
      setCouponCode("");
      setCouponError(null);
    }
    prevCouponsEnabled.current = couponsEnabled;
  }, [couponsEnabled, checkoutSucceeded]);

  const couponDiscount = couponsEnabled ? appliedDiscount ?? 0 : 0;
  const taxableSubtotal = Math.max(0, totalFinalSubtotal - couponDiscount);
  const vat = taxableSubtotal * (vatPercent / 100);
  const shippingCost = requiresShipping
    ? Number(shippingMethods?.find((m) => m.id === selectedShippingMethodId)?.price ?? 0)
    : 0;
  const codFeeApplied = paymentMethod === "cash" ? codFee : 0;
  const totalPrice = taxableSubtotal + vat + shippingCost + codFeeApplied;

  // COD availability mirrors the backend's CashPaymentHandler rules
  // exactly (enabled, requires shipping, under max value) - purely for
  // UI gating, since the server re-validates independently at submit time.
  const codAvailable =
    codEnabled && requiresShipping && totalPrice <= codMaxOrderValue;

  // Explicit user-facing notice when the previously selected method
  // disappears mid-session, instead of silently snapping back to card
  // with no explanation (which reads as a bug, not a policy change).
  const prevCodAvailable = useRef(codAvailable);

  useEffect(() => {
    if (checkoutSucceeded) return;
    if (prevCodAvailable.current && !codAvailable && paymentMethod === "cash") {
      toast.info("Cash on Delivery is no longer available for this order. Switched to card payment.");
      setPaymentMethod("card");
    }
    prevCodAvailable.current = codAvailable;
  }, [codAvailable, checkoutSucceeded]);

  // Default address logic - auto-save when the address book is empty
  useEffect(() => {
    if (!savedAddresses) return;
    if (savedAddresses.length === 0) {
      setSelectedAddressId("new");
      setSaveToProfile(true);
    } else {
      const defaultAddress = savedAddresses.find((a) => a.is_default) ?? savedAddresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [savedAddresses]);

  useEffect(() => {
    if (!requiresShipping || !savedShippingAddresses) return;
    if (savedShippingAddresses.length === 0) {
      setSelectedShippingAddressId("new");
    } else {
      const defaultAddress = savedShippingAddresses.find((a) => a.is_default) ?? savedShippingAddresses[0];
      setSelectedShippingAddressId(defaultAddress.id);
    }
  }, [savedShippingAddresses, requiresShipping]);

  useEffect(() => {
    if (shippingMethods?.length && !selectedShippingMethodId) {
      setSelectedShippingMethodId(shippingMethods[0].id);
    }
  }, [shippingMethods]);

  const isAddingNewAddress = selectedAddressId === "new";
  const isAddingNewShippingAddress = selectedShippingAddressId === "new";

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;

    setCouponError(null);

    validateCoupon.mutate(
      { code: couponCode.trim(), subtotal: totalFinalSubtotal },
      {
        onSuccess: (res: any) => {
          if (res.valid) {
            setAppliedDiscount(res.discount ?? 0);
            setCouponError(null);
            toast.success("Coupon applied");
          } else {
            setAppliedDiscount(null);
            setCouponError(res.message || "This coupon can't be applied.");
          }
        },
        onError: () => {
          setAppliedDiscount(null);
          setCouponError("Couldn't validate this coupon right now.");
        },
      }
    );
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedDiscount(null);
    setCouponError(null);
  };

  const handleCheckout = async () => {
    const token = useStore.getState().token;
    if (!token) {
      toast.error("🔐 You must login to checkout");
      navigate("/login");
      return;
    }
    if (items.length === 0) return;

    if (isAddingNewAddress && (!billing.first_name || !billing.last_name)) {
      toast.warning("Please complete your billing name");
      return;
    }

    let billingPayload: any = isAddingNewAddress
      ? billing
      : { address_id: selectedAddressId };

    let shippingPayload: any = undefined;
    if (requiresShipping && !sameAsBilling) {
      if (!selectedShippingMethodId) {
        toast.warning("Please select a shipping method");
        return;
      }

      if (isAddingNewShippingAddress) {
        if (
          !shippingAddress.first_name ||
          !shippingAddress.last_name ||
          !shippingAddress.address_line_1 ||
          !shippingAddress.city ||
          !shippingAddress.postal_code ||
          !shippingAddress.country ||
          !shippingAddress.phone
        ) {
          toast.warning("Please complete all required shipping address fields");
          return;
        }
        shippingPayload = shippingAddress;
      } else {
        shippingPayload = { address_id: selectedShippingAddressId };
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        items,
        billing: billingPayload,
        same_as_billing: sameAsBilling,
        save_to_profile: isAddingNewAddress ? saveToProfile : false,
        coupon_code: couponsEnabled && appliedDiscount !== null ? couponCode.trim() : undefined,
        payment_method: paymentMethod,
      };

      if (requiresShipping && !sameAsBilling) {
        payload.shipping = shippingPayload;
      }
      if (requiresShipping && selectedShippingMethodId) {
        payload.shipping_method_id = selectedShippingMethodId;
      }

      const res = await API.post("/checkout", payload);

      if (saveToProfile && isAddingNewAddress) {
        toast.success("✅ Address saved to profile");
      }

      // clearCart() NU se mai apelează aici – mută pe OrderConfirmation.tsx
      // după ce Checkout s-a demontat deja.
      setCheckoutSucceeded(true);

      if (res.data.payment_method === "cash") {
        navigate(`/order-confirmation/${res.data.order_id}?method=cash`);
      } else {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      if (err?.response?.data?.code === "invalid_coupon") {
        setCouponError(err.response.data.message);
        toast.error(err.response.data.message);
      } else if (err?.response?.data?.code === "out_of_stock") {
        toast.error(err.response.data.message);
      } else if (err?.response?.data?.code === "payment_method_unavailable") {
        toast.error(err.response.data.message);
        setPaymentMethod("card");
      } else {
        toast.error(err?.response?.data?.message || "Checkout failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyContent}>
          <div className={styles.emptyIconWrapper}>
            {/* Add your ShoppingBag icon if needed */}
          </div>
          <h3 className="fw-bold mt-4">Your cart is empty</h3>
          <p className="text-secondary mb-4">
            Looks like you haven't added any digital assets yet.
          </p>
          <button onClick={() => navigate("/shop")} className={styles.returnShopBtn}>
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.layout}>
        <section className={styles.mainContent}>
          <h1 className={styles.sectionTitle}>Secure Checkout</h1>

          <AddressSelector
            savedAddresses={savedAddresses || []}
            selectedAddressId={selectedAddressId}
            setSelectedAddressId={setSelectedAddressId}
            setBilling={setBilling}
            emptyBilling={emptyBillingData}
            showSelector={showBillingSelector}
            setShowSelector={setShowBillingSelector}
          />

          {isAddingNewAddress && (
            <BillingAddressForm
              data={billing}
              setData={setBilling}
              showSaveToProfile={(savedAddresses?.length ?? 0) > 0}
              saveToProfile={saveToProfile}
              onSaveToProfileChange={setSaveToProfile}
              title="Billing Specifications"
            />
          )}

          <ShippingAddressForm
            requiresShipping={requiresShipping}
            sameAsBilling={sameAsBilling}
            setSameAsBilling={setSameAsBilling}
            savedShippingAddresses={savedShippingAddresses || []}
            shippingAddressesLoading={shippingAddressesLoading}
            selectedShippingAddressId={selectedShippingAddressId}
            setSelectedShippingAddressId={setSelectedShippingAddressId}
            shippingAddress={shippingAddress}
            setShippingAddress={setShippingAddress}
            emptyBilling={emptyBillingData}
            isAddingNewShippingAddress={isAddingNewShippingAddress}
            showShippingSelector={showShippingSelector}
            setShowShippingSelector={setShowShippingSelector}
          />

          <ShippingMethodSelector
            requiresShipping={requiresShipping}
            shippingMethods={shippingMethods || []}
            shippingMethodsLoading={shippingMethodsLoading}
            selectedShippingMethodId={selectedShippingMethodId}
            setSelectedShippingMethodId={setSelectedShippingMethodId}
          />

          {/* Payment method selector */}
          <div className="border rounded-3 p-3 mb-4">
            <label className="fw-semibold small text-muted d-block mb-2">Payment Method</label>
            <div className="d-flex gap-2 flex-wrap">
              <label
                className={`flex-fill border rounded-3 p-3 ${paymentMethod === "card" ? "border-primary bg-light" : ""}`}
                style={{ cursor: "pointer", minWidth: 160 }}
              >
                <input
                  type="radio"
                  name="payment_method"
                  className="d-none"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <div className="fw-semibold">💳 Card</div>
                <small className="text-muted">Secure payment via Stripe</small>
              </label>

              {codAvailable && (
                <label
                  className={`flex-fill border rounded-3 p-3 ${paymentMethod === "cash" ? "border-primary bg-light" : ""}`}
                  style={{ cursor: "pointer", minWidth: 160 }}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    className="d-none"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                  />
                  <div className="fw-semibold">💵 Cash on Delivery</div>
                  <small className="text-muted">
                    {codFee > 0 ? `+$${codFee.toFixed(2)} fee` : "Pay when it arrives"}
                  </small>
                </label>
              )}
            </div>

            {requiresShipping && codEnabled && !codAvailable && totalPrice > codMaxOrderValue && (
              <small className="text-muted d-block mt-2">
                Cash on Delivery isn't available for orders over ${codMaxOrderValue.toFixed(2)}.
              </small>
            )}
          </div>

          {couponsEnabled && (
            <CouponCode
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              appliedDiscount={appliedDiscount}
              couponError={couponError}
              validateCoupon={validateCoupon}
              totalFinalSubtotal={totalFinalSubtotal}
              onApply={handleApplyCoupon}
              onRemove={handleRemoveCoupon}
            />
          )}

          <PlaceOrderButton
            onClick={handleCheckout}
            loading={loading}
            totalPrice={totalPrice}
          />
        </section>

        <OrderSummary
          items={items}
          totalOriginalSubtotal={totalOriginalSubtotal}
          totalDiscountSaved={totalDiscountSaved}
          appliedDiscount={couponsEnabled ? appliedDiscount : null}
          couponCode={couponCode}
          vat={vat}
          vatPercent={vatPercent}
          shippingCost={shippingCost}
          totalPrice={totalPrice}
          requiresShipping={requiresShipping}
          codFee={codFeeApplied}
        />
      </div>
    </div>
  );
}