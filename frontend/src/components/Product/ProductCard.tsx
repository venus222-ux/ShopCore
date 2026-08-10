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

  const previewUrl = product?.preview_urls?.[0] || product?.preview_url || null;

  // Price & Discount Math - mirrors ProductDetails exactly: pricing is
  // always the product's own final_price/price, regardless of which
  // variant is selected. VariantSelector only gates add-to-cart and stock.
  const finalPrice = Number(product.final_price ?? product.price ?? 0);
  const originalPrice = Number(product.price ?? 0);
  const hasDiscount = !!product.has_discount && originalPrice > 0 && finalPrice < originalPrice;
  const savings = originalPrice - finalPrice;
  const discountPercent = hasDiscount ? Math.round((savings / originalPrice) * 100) : 0;

  const variantCount = product.variants?.length || 0;
  const hasMultipleVariants = variantCount > 1;
  const isDigital = product.asset_type === "digital";
  const isNew = product.is_new;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Reset selection whenever the underlying product changes - same guard
  // ProductDetails uses (there, keyed off product.id in a useEffect).
  useEffect(() => {
    setSelectedVariant(null);
  }, [product.id]);

  const canAddToCart =
    !hasMultipleVariants || (selectedVariant !== null && selectedVariant.in_stock !== false);

  const addToCartLabel = hasMultipleVariants && !selectedVariant ? "Select Options" : "Add to Cart";

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
      {/* MEDIA GALLERY */}
      <div className={styles.mediaContainer}>
        <div className={styles.badgesTopLeft}>
          {isNew && <span className={styles.badgeNew}>NEW</span>}
          {hasDiscount && discountPercent > 0 && (
            <span className={styles.badgeDiscountRibbon}>{discountPercent}% OFF</span>
          )}
        </div>

        <div className={styles.badgesTopRight}>
          <WishlistButton product={product} />
        </div>

        <div className={styles.badgesBottomLeft}>
          <span className={styles.badgeAssetType}>{product.asset_type || "Standard"}</span>
          {product.category?.name && (
            <span className={styles.badgeCategory}>{product.category.name}</span>
          )}
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
            <div className={styles.noPreview}>No Preview</div>
          )}
        </Link>
      </div>

      {/* CONTENT BODY */}
      <div className={styles.content}>
        <div className={styles.metaRow}>
          <div className={styles.ratingPlaceholder}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />
            ))}
            <span className={styles.reviewCount}>(24)</span>
          </div>
          <div className={styles.stockIndicator}>
            {isDigital ? (
              <span className="text-success fw-medium d-flex align-items-center gap-1">
                <Zap size={12} /> In Stock
              </span>
            ) : (
              <span className="text-primary fw-medium d-flex align-items-center gap-1">
                <Box size={12} /> Ships Fast
              </span>
            )}
          </div>
        </div>

        <Link to={`/products/${product.slug}`} className={styles.titleLink}>
          <h3 className={styles.title}>{product.title}</h3>
        </Link>
        <p className={styles.shortDescLineClamp}>
          {product.short_description || product.description || "Premium product crafted for modern creators."}
        </p>

        {/* Inline variant picker - same component/logic as ProductDetails,
            so options can be picked directly from the card instead of
            forcing a redirect to the details page. */}
        {hasMultipleVariants && (
          <div className={styles.variantSelectorWrapper} onClick={(e) => e.stopPropagation()}>
            <VariantSelector variants={product.variants ?? []} onChange={setSelectedVariant} />
          </div>
        )}

        {/* Pricing Area */}
        <div className={styles.priceSection}>
          <div className={styles.priceGroup}>
            <span className={styles.finalPrice}>${finalPrice.toFixed(2)}</span>
            {hasDiscount && <span className={styles.oldPrice}>${originalPrice.toFixed(2)}</span>}
          </div>
          {hasDiscount && savings > 0 && (
            <div className={styles.savingsLabel}>Save ${savings.toFixed(2)}</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={styles.footerActions}>
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className={styles.btnAddToCart}
          >
            <ShoppingCart size={16} />
            {addToCartLabel}
          </button>
          <Link to={`/products/${product.slug}`} className={styles.btnViewDetails}>
            View Details
          </Link>
        </div>

        {/* Fulfillment Tag */}
        <div className={styles.fulfillmentTag}>
          {isDigital ? "📥 Instant Download Available" : "🚚 Ships within 24 Hours"}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;