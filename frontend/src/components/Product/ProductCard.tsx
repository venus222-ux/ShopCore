import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star, Box, Zap } from "lucide-react";
import styles from "../../styles/ProductCard.module.css";
import { Product, ProductVariant } from "../../types";
import WishlistButton from "./WishlistButton";
import VariantSelector from "./VariantSelector";
import { useCartStore } from "../../store/useCartStore";
import { toast } from "react-toastify";
import { getProxiedImageUrl } from "../../utils/image";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const addToCart = useCartStore((s) => s.addToCart);

  const previewUrl =
    product?.preview_urls?.[0] ||
    product?.preview_url ||
    product?.preview_image ||
    null;

  const finalPrice = Number(product.final_price ?? product.price ?? 0);
  const originalPrice = Number(product.price ?? 0);
  const hasDiscount =
    !!product.has_discount && originalPrice > 0 && finalPrice < originalPrice;
  const savings = originalPrice - finalPrice;
  const discountPercent = hasDiscount
    ? Math.round((savings / originalPrice) * 100)
    : 0;

  const variantCount = product.variants?.length || 0;
  const hasMultipleVariants = variantCount > 1;
  const isDigital = product.asset_type === "digital";
  const isNew = product.is_new;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    setSelectedVariant(null);
  }, [product.id]);

  const canAddToCart =
    !hasMultipleVariants ||
    (selectedVariant !== null && selectedVariant.in_stock !== false);

  const addToCartLabel =
    hasMultipleVariants && !selectedVariant ? "Select" : "Add to Cart";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasMultipleVariants && !selectedVariant) {
      toast.warning("Please select your options first");
      return;
    }

    if (hasMultipleVariants && selectedVariant?.in_stock === false) {
      toast.error("That combination is out of stock");
      return;
    }

    addToCart(product, selectedVariant?.id ?? product.variants?.[0]?.id);
    toast.success("Added to cart 🛒");
  };

  return (
    <div className={styles.card}>
      {/* MEDIA CONTAINER */}
      <div className={styles.mediaContainer}>
        <div className={styles.badgesTopLeft}>
          {isNew && <span className={styles.badgeNew}>NEW</span>}
          {hasDiscount && discountPercent > 0 && (
            <span className={styles.badgeDiscountRibbon}>
              -{discountPercent}%
            </span>
          )}
        </div>

        <div className={styles.badgesTopRight}>
          <WishlistButton product={product} />
        </div>

        <Link to={`/products/${product.slug}`} className={styles.imageLink}>
          {previewUrl ? (
            <img
              src={getProxiedImageUrl(previewUrl)}
              alt={product.title}
              loading="lazy"
              className={styles.imageHover}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.png";
              }}
            />
          ) : (
            <div className={styles.noPreview}>No Preview Available</div>
          )}
        </Link>
      </div>

      {/* CONTENT BODY */}
      <div className={styles.content}>
        <div className={styles.metaRow}>
          <div className={styles.ratingBadge}>
            <Star size={12} fill="#eab308" color="#eab308" />
            <span>4.8</span>
            <span className={styles.ratingCount}>(24)</span>
          </div>

          <div className={styles.stockIndicator}>
            {isDigital ? (
              <span style={{ color: "#16a34a" }} className="d-flex align-items-center gap-1">
                <Zap size={12} /> Instant
              </span>
            ) : (
              <span style={{ color: "#2563eb" }} className="d-flex align-items-center gap-1">
                <Box size={12} /> In Stock
              </span>
            )}
          </div>
        </div>

        <Link to={`/products/${product.slug}`} className={styles.titleLink}>
          <h3 className={styles.title}>{product.title}</h3>
        </Link>

        <p className={styles.shortDescLineClamp}>
          {product.short_description ||
            product.description ||
            "Premium quality fashion item crafted for modern lifestyles."}
        </p>

        {hasMultipleVariants && (
          <div
            className={styles.variantSelectorWrapper}
            onClick={(e) => e.stopPropagation()}
          >
            <VariantSelector
              variants={product.variants ?? []}
              onChange={setSelectedVariant}
            />
          </div>
        )}

        {/* PRICE SECTION */}
        <div className={styles.priceSection}>
          <span className={styles.finalPrice}>${finalPrice.toFixed(2)}</span>
          {hasDiscount && (
            <>
              <span className={styles.oldPrice}>
                ${originalPrice.toFixed(2)}
              </span>
              {savings > 0 && (
                <span className={styles.savingsLabel}>
                  Save ${savings.toFixed(2)}
                </span>
              )}
            </>
          )}
        </div>

        {/* ACTIONS */}
        <div className={styles.footerActions}>
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className={styles.btnAddToCart}
          >
            <ShoppingCart size={15} />
            {addToCartLabel}
          </button>
          <Link
            to={`/products/${product.slug}`}
            className={styles.btnViewDetails}
          >
            Details
          </Link>
        </div>

        <div className={styles.fulfillmentTag}>
          {isDigital ? "Instant Download" : "Ships within 24 Hours"}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;