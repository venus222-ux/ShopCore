import { useMemo, useState } from "react";
import { useCartStore } from "../store/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Cart.module.css";
import { getProxiedImageUrl } from "../utils/image";
import type { CartItem } from "../types";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  Percent,
} from "lucide-react";

import { useSettingsStore } from "../store/useSettingsStore";

// Falls back to the placeholder exactly once per image - tracking the
// failure in React state (rather than mutating e.currentTarget.src
// directly) stops the browser from re-triggering onError in a loop if
// the placeholder itself is briefly unavailable or the image flaps.
const CartItemImage = ({ src, alt }: { src: string; alt: string }) => {
  const [errored, setErrored] = useState(false);

  return (
    <img
      src={errored ? "/placeholder.png" : src}
      alt={alt}
      className={styles.productImg}
      loading="lazy"
      onError={() => {
        if (!errored) setErrored(true);
      }}
    />
  );
};

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, increaseQty, decreaseQty } = useCartStore();

  const {
    totalItems,
    totalOriginalSubtotal,
    totalFinalSubtotal,
    totalDiscountSaved,
  } = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const qty = item.quantity || 1;
        const originalPrice = Number(item.price || 0);

        const unitPrice =
          item.has_discount && item.final_price !== undefined
            ? Number(item.final_price)
            : originalPrice;

        acc.totalItems += qty;
        acc.totalOriginalSubtotal += qty * originalPrice;
        acc.totalFinalSubtotal += qty * unitPrice;
        acc.totalDiscountSaved += qty * (originalPrice - unitPrice);
        return acc;
      },
      {
        totalItems: 0,
        totalOriginalSubtotal: 0,
        totalFinalSubtotal: 0,
        totalDiscountSaved: 0,
      },
    );
  }, [items]);

  const vatPercent = useSettingsStore((state) => state.vatPercent);

  const vatRate = vatPercent / 100;
  const vat = totalFinalSubtotal * vatRate;
  const totalPrice = totalFinalSubtotal + vat;

  const getSelectedVariant = (item: CartItem) => {
    if (!item.variants?.length || !item.variant_id) return null;
    return item.variants.find((v) => v.id === item.variant_id) ?? null;
  };

  const getVariantAttributes = (item: CartItem) => {
    const variant = getSelectedVariant(item);
    if (!variant?.attribute_values?.length) return [];
    return variant.attribute_values;
  };

  const getItemImage = (item: CartItem) => {
    const variant = getSelectedVariant(item);
    const variantImage = variant?.images?.[0];

    if (variantImage) return variantImage;

    return Array.isArray(item.preview_urls)
      ? item.preview_urls[0]
      : item.preview_url || item.preview_urls;
  };

  const renderAttribute = (attr: any) => {
    if (attr.attribute?.name) {
      return (
        <span key={attr.id} className={styles.attributeChip}>
          <strong>{attr.attribute.name}</strong> {attr.value}
        </span>
      );
    }

    return (
      <span key={attr.id || attr.value} className={styles.attributeChip}>
        <strong>{attr.name || "Attribute"}</strong> {attr.value}
      </span>
    );
  };

  if (!items || items.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyContent}>
          <div className={styles.emptyIconWrapper}>
            <ShoppingBag size={36} />
          </div>
          <h3 className="fw-bold mt-4">Your cart is empty</h3>
          <p className="text-secondary mb-4">
            Looks like you haven't assigned any digital assets to this checkout
            session yet.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className={styles.returnShopBtn}
          >
            Explore Digital Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.sectionTitle}>Shopping Cart Workspace</h1>

      <div className={styles.cartGrid}>
        <div className={styles.itemList}>
          {items.map((item) => {
            const image = getItemImage(item);
            const imageUrl = getProxiedImageUrl(image);

            const isDiscounted = !!item.has_discount;
            const originalPrice = Number(item.price || 0);
            const unitPrice =
              isDiscounted && item.final_price !== undefined
                ? Number(item.final_price)
                : originalPrice;

            const actualDiscountPercentage =
              originalPrice > 0 && unitPrice < originalPrice
                ? Math.round(((originalPrice - unitPrice) / originalPrice) * 100)
                : 0;

            return (
              <div key={item.id} className={styles.itemCard}>
                <CartItemImage src={imageUrl} alt={item.title} />

                <div className={styles.itemDetails}>
                  <div>
                    <h5 className={styles.itemTitle}>{item.title}</h5>
                    <p className={styles.itemCategory}>
                      {item.category?.name || "Digital Asset"}
                    </p>
                  </div>

                  {getVariantAttributes(item).length > 0 && (
                    <div className={styles.attributeList}>
                      {getVariantAttributes(item).map(renderAttribute)}
                    </div>
                  )}

                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id, item.variant_id)}
                  >
                    <Trash2 size={14} /> <span>Remove</span>
                  </button>
                </div>

                <div className={styles.qtyContainer}>
                  <div className={styles.qtyControls}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => decreaseQty(item.id, item.variant_id)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={12} />
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => increaseQty(item.id, item.variant_id)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div className={styles.priceTag}>
                  <span className={styles.calculatedPrice}>
                    ${(item.quantity * unitPrice).toFixed(2)}
                  </span>

                  {isDiscounted && originalPrice > unitPrice && (
                    <div className={styles.discountMetadata}>
                      <span className={styles.itemOldPrice}>
                        ${(item.quantity * originalPrice).toFixed(2)}
                      </span>
                      {actualDiscountPercentage > 0 && (
                        <span className={styles.discountBadge}>
                          <Percent size={10} /> {actualDiscountPercentage}% Off
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <aside className={styles.summaryCard}>
          <h4 className={styles.summaryTitle}>Operational Manifest</h4>

          <div className={styles.summaryTotals}>
            <div className={styles.totalLine}>
              <span>Allocated Line Items</span>
              <span className="fw-semibold text-dark">{totalItems}</span>
            </div>

            <div className={styles.totalLine}>
              <span>Gross Base Subtotal</span>
              <span>${totalOriginalSubtotal.toFixed(2)}</span>
            </div>

            {totalDiscountSaved > 0 && (
              <div className={`${styles.totalLine} ${styles.discountLine}`}>
                <span className="d-flex align-items-center gap-1">
                  <Tag size={13} /> Applied Markdowns
                </span>
                <span>-${totalDiscountSaved.toFixed(2)}</span>
              </div>
            )}

            <div className={styles.totalLine}>
              <span>VAT Jurisdiction ({vatPercent}%)</span>
              <span>${vat.toFixed(2)}</span>
            </div>

            <div className={`${styles.totalLine} ${styles.grandTotal}`}>
              <span>Total Price</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className={styles.checkoutBtn}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </button>

          <Link to="/shop" className={styles.continueShoppingLink}>
            ← Continue Exploration
          </Link>

          <div className={styles.secureNote}>
            <ShieldCheck size={14} className="text-success" />
            <span>Secure Enterprise SSL Transaction Ecosystem</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;