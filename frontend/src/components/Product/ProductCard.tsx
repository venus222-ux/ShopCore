import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star, Box, Zap, ChevronDown } from "lucide-react";
import styles from "../../styles/ProductCard.module.css";
import { Product, ProductVariant } from "../../types";
import WishlistButton from "./WishlistButton";
import { useCartStore } from "../../store/useCartStore";
import { toast } from "react-toastify";
import { getProxiedImageUrl } from "../../utils/image";

interface ProductCardProps {
  product: Product;
}

// Falls back to the placeholder exactly once per image, tracked in React
// state rather than mutating e.target.src directly - avoids the
// fail→reassign→fail loop if the placeholder itself briefly 404s.
const CardImage = ({ src, alt }: { src: string; alt: string }) => {
  const [errored, setErrored] = useState(false);

  return (
    <img
      src={errored ? "/placeholder.png" : src}
      alt={alt}
      loading="lazy"
      className={styles.imageHover}
      onError={() => {
        if (!errored) setErrored(true);
      }}
    />
  );
};

const variantLabel = (variant: ProductVariant) => {
  const values = (variant.attribute_values as any[]) || [];
  return values.map((av) => av.value).join(" / ") || variant.sku;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const addToCart = useCartStore((s) => s.addToCart);

  const productPreviewUrl =
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

  const variantList = product.variants ?? [];
  const hasMultipleVariants = variantList.length > 1;
  const isDigital = product.asset_type === "digital";
  const isNew = product.is_new;

  const [hoveredVariant, setHoveredVariant] = useState<ProductVariant | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // Close the panel on outside click.
  useEffect(() => {
    if (!panelOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [panelOpen]);

  useEffect(() => {
    setPanelOpen(false);
    setHoveredVariant(null);
  }, [product.id]);

  // Whichever variant the shopper is currently hovering in the panel takes
  // the image slot - lets them preview Black vs Brown before committing.
  // Falls back to the product's own preview image when nothing's hovered.
  const previewUrl = hoveredVariant?.images?.[0] || productPreviewUrl;

  const handleTogglePanel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPanelOpen((v) => !v);
  };

  const handlePickVariant = (e: React.MouseEvent, variant: ProductVariant) => {
    e.preventDefault();
    e.stopPropagation();

    if (variant.in_stock === false) {
      toast.error("That option is out of stock");
      return;
    }

    addToCart(product, variant.id);
    toast.success("Added to cart 🛒");
    setPanelOpen(false);
    setHoveredVariant(null);
  };

  const handleSingleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const only = variantList[0];
    if (only && only.in_stock === false) {
      toast.error("Out of stock");
      return;
    }

    addToCart(product, only?.id);
    toast.success("Added to cart 🛒");
  };

  return (
    <div
      className={styles.card}
      ref={cardRef}
      onMouseLeave={() => {
        if (!panelOpen) setHoveredVariant(null);
      }}
    >
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
            <CardImage src={getProxiedImageUrl(previewUrl)} alt={product.title} />
          ) : (
            <div className={styles.noPreview}>No Preview Available</div>
          )}
        </Link>

        {/* Hover overlay quick-select prompt - only for multi-variant
            products, only relevant on pointer devices (CSS hides it on
            touch via the mediaContainer:hover rule using @media hover). */}
        {hasMultipleVariants && (
          <button
            type="button"
            className={styles.quickSelectOverlay}
            onClick={handleTogglePanel}
            onMouseEnter={() => setHoveredVariant(null)}
          >
            Select Options
          </button>
        )}
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
        <div className={styles.footerActions} style={{ position: "relative" }}>
          {hasMultipleVariants ? (
            <>
              <button
                onClick={handleTogglePanel}
                className={styles.btnAddToCart}
                aria-expanded={panelOpen}
              >
                <ShoppingCart size={15} />
                Select Options
                <ChevronDown
                  size={14}
                  style={{
                    transition: "transform 0.2s",
                    transform: panelOpen ? "rotate(180deg)" : "none",
                  }}
                />
              </button>

              {panelOpen && (
                <div className={styles.variantPanel}>
                  {variantList.map((variant) => {
                    const thumb = variant.images?.[0];
                    const outOfStock = variant.in_stock === false;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        className={styles.variantRow}
                        disabled={outOfStock}
                        onMouseEnter={() => setHoveredVariant(variant)}
                        onClick={(e) => handlePickVariant(e, variant)}
                      >
                        {thumb ? (
                          <img
                            src={getProxiedImageUrl(thumb)}
                            alt={variantLabel(variant)}
                            className={styles.variantRowThumb}
                          />
                        ) : (
                          <span className={styles.variantRowThumbPlaceholder} />
                        )}

                        <span className={styles.variantRowLabel}>
                          {variantLabel(variant)}
                        </span>

                        <span className={styles.variantRowPrice}>
                          ${Number(variant.price ?? finalPrice).toFixed(2)}
                        </span>

                        {outOfStock && (
                          <span className={styles.variantRowOos}>Out of stock</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <button onClick={handleSingleAddToCart} className={styles.btnAddToCart}>
              <ShoppingCart size={15} />
              Add to Cart
            </button>
          )}

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