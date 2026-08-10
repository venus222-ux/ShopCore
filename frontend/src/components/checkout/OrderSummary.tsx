import { Tag, ShieldCheck } from "lucide-react";

interface OrderSummaryProps {
  items: any[];
  totalOriginalSubtotal: number;
  totalDiscountSaved: number;
  appliedDiscount: number | null;
  couponCode: string;
  vat: number;
  vatPercent: number;
  shippingCost: number;
  totalPrice: number;
  requiresShipping: boolean;
  codFee?: number;
}

export default function OrderSummary({
  items,
  totalOriginalSubtotal,
  totalDiscountSaved,
  appliedDiscount,
  couponCode,
  vat,
  vatPercent,
  shippingCost,
  totalPrice,
  requiresShipping,
  codFee = 0,
}: OrderSummaryProps) {
  return (
    <aside className="orderPreview">
      <h4 className="summaryTitle">Order Manifest</h4>

      {/* Mini item list */}
      <div className="miniItemList">
        {items.map((item: any) => {
          const isDiscounted = !!item.has_discount;
          const unitPrice =
            isDiscounted && item.final_price !== undefined
              ? Number(item.final_price)
              : Number(item.price || 0);
          const originalUnitPrice = Number(item.price || 0);

          return (
            <div key={item.id} className="miniItem">
              <div className="itemInfo">
                <div className="qtyBadge">{item.quantity}</div>
                <div className="itemTexts">
                  <p className="itemTitle">{item.title}</p>
                  <small className="itemCategory">
                    {item.category?.name || "Digital Asset"}
                  </small>
                </div>
              </div>
              <div className="text-end">
                <span className="itemPrice">
                  ${(item.quantity * unitPrice).toFixed(2)}
                </span>
                {isDiscounted && originalUnitPrice > unitPrice && (
                  <span className="itemOldPrice">
                    ${(item.quantity * originalUnitPrice).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="summaryTotals">
        <div className="totalLine">
          <span>Subtotal</span>
          <span>${totalOriginalSubtotal.toFixed(2)}</span>
        </div>

        {totalDiscountSaved > 0 && (
          <div className="totalLine discountLine">
            <span className="d-flex align-items-center gap-1">
              <Tag size={13} /> Asset Markdowns
            </span>
            <span>-${totalDiscountSaved.toFixed(2)}</span>
          </div>
        )}

        {appliedDiscount !== null && appliedDiscount > 0 && (
          <div className="totalLine discountLine">
            <span className="d-flex align-items-center gap-1">
              <Tag size={13} /> Coupon ({couponCode})
            </span>
            <span>-${appliedDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="totalLine">
          <span>VAT ({vatPercent}%)</span>
          <span>${vat.toFixed(2)}</span>
        </div>

        {requiresShipping && (
          <div className="totalLine">
            <span>Shipping</span>
            <span>${shippingCost.toFixed(2)}</span>
          </div>
        )}

        {codFee > 0 && (
          <div className="totalLine">
            <span>Cash on Delivery Fee</span>
            <span>${codFee.toFixed(2)}</span>
          </div>
        )}

        <div className="totalLine grandTotal">
          <span>Total Amount</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="secureNote">
        <ShieldCheck size={16} className="text-success" />
        <span>Secure Enterprise SSL Encrypted System</span>
      </div>
    </aside>
  );
}