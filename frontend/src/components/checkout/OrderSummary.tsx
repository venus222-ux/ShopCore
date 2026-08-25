import { Tag, ShieldCheck } from "lucide-react";
import styles from "../../styles/Checkout.module.css";

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
    <aside className={styles.orderPreview}>
      <h4 className={styles.summaryTitle}>
        Order Summary
      </h4>

      <div className={styles.miniItemList}>
        {items.map((item: any) => {
          const isDiscounted = !!item.has_discount;

          const unitPrice =
            isDiscounted && item.final_price !== undefined
              ? Number(item.final_price)
              : Number(item.price || 0);

          const originalUnitPrice = Number(item.price || 0);

          return (
            <div
              key={item.id}
              className={styles.miniItem}
            >
              <div className={styles.itemInfo}>
                <div className={styles.qtyBadge}>
                  {item.quantity}
                </div>

                <div className={styles.itemTexts}>
                  <p className={styles.itemTitle}>
                    {item.title}
                  </p>

                  <small className={styles.itemCategory}>
                    {item.category?.name || "Digital Asset"}
                  </small>
                </div>
              </div>

              <div className={styles.itemPriceWrapper}>
                <span className={styles.itemPrice}>
                  $
                  {(item.quantity * unitPrice).toFixed(2)}
                </span>

                {isDiscounted &&
                  originalUnitPrice > unitPrice && (
                    <span className={styles.itemOldPrice}>
                      $
                      {(
                        item.quantity * originalUnitPrice
                      ).toFixed(2)}
                    </span>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.summaryTotals}>
        <div className={styles.totalLine}>
          <span>Subtotal</span>

          <span>
            ${totalOriginalSubtotal.toFixed(2)}
          </span>
        </div>

        {totalDiscountSaved > 0 && (
          <div
            className={`${styles.totalLine} ${styles.discountLine}`}
          >
            <span className={styles.discountLabel}>
              <Tag size={13} />
              Asset Markdowns
            </span>

            <span>
              -${totalDiscountSaved.toFixed(2)}
            </span>
          </div>
        )}

        {appliedDiscount !== null &&
          appliedDiscount > 0 && (
            <div
              className={`${styles.totalLine} ${styles.discountLine}`}
            >
              <span className={styles.discountLabel}>
                <Tag size={13} />
                Coupon ({couponCode})
              </span>

              <span>
                -${appliedDiscount.toFixed(2)}
              </span>
            </div>
          )}

        <div className={styles.totalLine}>
          <span>
            VAT ({vatPercent}%)
          </span>

          <span>
            ${vat.toFixed(2)}
          </span>
        </div>

        {requiresShipping && (
          <div className={styles.totalLine}>
            <span>Shipping</span>

            <span>
              ${shippingCost.toFixed(2)}
            </span>
          </div>
        )}

        {codFee > 0 && (
          <div className={styles.totalLine}>
            <span>Cash on Delivery Fee</span>

            <span>
              ${codFee.toFixed(2)}
            </span>
          </div>
        )}

        <div
          className={`${styles.totalLine} ${styles.grandTotal}`}
        >
          <span>Total Amount</span>

          <span>
            ${totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      <div className={styles.secureNote}>
        <ShieldCheck size={17} />

        <span>
          Secure & encrypted checkout
        </span>
      </div>
    </aside>
  );
}