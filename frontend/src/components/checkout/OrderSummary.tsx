import { Tag, ShieldCheck } from "lucide-react";
import styles from "../../styles/Checkout.module.css";
import { getProxiedImageUrl } from "../../utils/image";

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

// Same resolution as Cart.tsx: the selected variant's image (resolved on
// the backend from its attribute values, e.g. "Black") takes priority,
// falling back to the product's own preview image.
const getSelectedVariant = (item: any) => {
  if (!item.variants?.length || !item.variant_id) return null;
  return item.variants.find((v: any) => v.id === item.variant_id) ?? null;
};

const getItemImage = (item: any) => {
  const variant = getSelectedVariant(item);
  const variantImage = variant?.images?.[0];

  if (variantImage) return variantImage;

  return Array.isArray(item.preview_urls)
    ? item.preview_urls[0]
    : item.preview_url || item.preview_urls;
};

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

          const image = getItemImage(item);
          const imageUrl = image ? getProxiedImageUrl(image) : "/placeholder.png";

          return (
            <div
              key={item.id}
              className={styles.miniItem}
            >
              <div className={styles.itemInfo}>
                <img
                  src={imageUrl}
                  alt={item.title}
                  className={styles.miniItemImg}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                  }}
                />

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