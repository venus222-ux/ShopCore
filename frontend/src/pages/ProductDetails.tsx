import { useState, useMemo, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API from "../api";
import { Product, ProductVariant } from "../types";
import styles from "../styles/ProductDetails.module.css";
import ProductCard from "../components/Product/ProductCard";
import VariantSelector from "../components/Product/VariantSelector";
import { useCartStore } from "../store/useCartStore";
import {
  ShoppingCart,
  Shield,
  Download,
  Star,
  Truck,
  Zap,
  Box,
} from "lucide-react";
import { toast } from "react-toastify";
import { getProxiedImageUrl } from "../utils/image";

const ProductDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);

  const addToCart = useCartStore((s) => s.addToCart);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery<Product & { related_products?: Product[] }>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await API.get(`/products/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });

  const previews = useMemo((): string[] => {
    if (!product) return [];

    if (
      Array.isArray(product.preview_urls) &&
      product.preview_urls.length > 0
    ) {
      return product.preview_urls;
    }

    if (product.preview_url) return [product.preview_url];
    if (product.preview_image) return [product.preview_image];

    return [];
  }, [product]);

  /*
   * Gallery priority:
   * 1. Selected variant images
   * 2. Product preview images
   */
  const galleryImages = useMemo(() => {
    if (selectedVariant?.images?.length) {
      return selectedVariant.images;
    }

    return previews;
  }, [selectedVariant, previews]);

  /*
   * Reset gallery to the first image whenever
   * the selected variant changes.
   */
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedVariant?.id]);

  const hasDiscount = !!product?.has_discount;
  const finalPrice = product?.final_price ?? product?.price ?? 0;
  const originalPrice = product?.price ?? 0;
  const savings = originalPrice - finalPrice;
  const isDigital = product?.asset_type === "digital";

  let discountBadgeLabel = "";

  if (hasDiscount && product) {
    if (
      product.discount_percentage &&
      product.discount_percentage > 0
    ) {
      discountBadgeLabel = `${product.discount_percentage}% OFF`;
    } else if (
      product.discount_fixed &&
      product.discount_fixed > 0
    ) {
      discountBadgeLabel = `$${Number(product.discount_fixed).toFixed(0)} OFF`;
    } else if (
      product.effective_discount_percentage &&
      product.effective_discount_percentage > 0
    ) {
      discountBadgeLabel = `${product.effective_discount_percentage}% OFF`;
    } else {
      discountBadgeLabel = "SALE";
    }
  }

  const nextSlide = () => {
    if (galleryImages.length === 0) return;

    setCurrentIndex(
      (prev) => (prev + 1) % galleryImages.length
    );
  };

  const prevSlide = () => {
    if (galleryImages.length === 0) return;

    setCurrentIndex(
      (prev) =>
        (prev - 1 + galleryImages.length) % galleryImages.length
    );
  };

  useEffect(() => {
    setSelectedVariant(null);
  }, [product?.id]);

  const hasMultipleVariants = (product?.variants?.length ?? 0) > 1;

  const canAddToCart =
    !hasMultipleVariants ||
    (selectedVariant !== null &&
      selectedVariant.in_stock !== false);

  const handleAddToCart = () => {
    if (!product) return;

    if (hasMultipleVariants && !selectedVariant) {
      return toast.warning("Please select your options first");
    }

    if (
      hasMultipleVariants &&
      selectedVariant?.in_stock === false
    ) {
      return toast.error("That combination is out of stock");
    }

    addToCart(product, selectedVariant?.id);

    toast.success("Added to cart 🛒");
  };

  if (isLoading) return <LoadingState />;
  if (isError || !product) return <ErrorState />;

  console.log("Original:", galleryImages[currentIndex]);
  console.log(
    "Proxy:",
    getProxiedImageUrl(galleryImages[currentIndex])
  );

  return (
    <div className={styles.pageWrapper}>
      <div className="container py-4">

        {/* Breadcrumb Navigation */}
        <nav className="mb-4 small d-flex align-items-center gap-1">
          <Link
            to="/"
            className="text-decoration-none text-muted transition-all"
          >
            Marketplace
          </Link>

          <span className="text-muted">/</span>

          <span
            className={`${styles.breadcrumbActive} fw-medium`}
          >
            {product.category?.name || "Asset Details"}
          </span>
        </nav>

        <div className="row g-lg-5">

          {/* LEFT COLUMN: VISUAL GALLERY */}
          <div className="col-lg-7">
            <div className={styles.mainImageWrapper}>

              {galleryImages.length > 0 ? (
                <>
                  <div className={styles.featuredImageContainer}>

                    {/* Main Image */}
                    <img
                      src={getProxiedImageUrl(
                        galleryImages[currentIndex]
                      )}
                      alt={product.title}
                      className={styles.mainDisplayImage}
                    />

                    {/* Previous / Next Buttons */}
                    {galleryImages.length > 1 && (
                      <>
                        <button
                          onClick={prevSlide}
                          className={styles.navBtnPrev}
                          aria-label="Previous image"
                        >
                          ‹
                        </button>

                        <button
                          onClick={nextSlide}
                          className={styles.navBtnNext}
                          aria-label="Next image"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  <div className="d-flex gap-2 mt-3 overflow-auto pb-2">
                    {galleryImages.map((url, idx) => (
                      <img
                        key={idx}
                        src={getProxiedImageUrl(url)}
                        onClick={() => setCurrentIndex(idx)}
                        className={`${styles.thumb} ${
                          idx === currentIndex
                            ? styles.thumbActive
                            : ""
                        }`}
                        alt={`Thumbnail ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className={styles.noImagePlaceholder}>
                  <span>📷 No Image Previews Provided</span>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT COLUMN: CHECKOUT CONSOLE */}
          <div className="col-lg-5">
            <div
              className="sticky-top"
              style={{ top: "6rem" }}
            >

              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                {product.is_new && (
                  <span
                    className={`${styles.newBadge} badge px-3 py-2`}
                  >
                    NEW
                  </span>
                )}

                <span className={`${styles.assetTypeBadge}`}>
                  {product.asset_type || "Digital Asset"}
                </span>

                {hasDiscount && (
                  <span className={`${styles.saleBadge}`}>
                    {discountBadgeLabel}
                  </span>
                )}
              </div>

              <h1 className="fw-bold mb-2 text-dark lh-sm">
                {product.title}
              </h1>

              {/* Fake Rating & Stock Status Row */}
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="d-flex align-items-center text-warning">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill="currentColor"
                    />
                  ))}

                  <span className="text-muted ms-2 small fw-medium">
                    (4.8/5 based on 24 reviews)
                  </span>
                </div>
              </div>

              <p className="text-muted fs-5 mb-4 fw-normal">
                {product.short_description}
              </p>

              {/* Purchase Box */}
              <div
                className={`${styles.purchaseCard} card border-0 mb-4 shadow-sm`}
              >
                <div className="card-body p-4">

                  <div className="mb-4">

                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <small className="text-uppercase text-muted fw-bold letter-spacing-glance">
                        Pricing Options
                      </small>

                      <span
                        className={`small fw-bold ${
                          isDigital
                            ? "text-success"
                            : "text-primary"
                        }`}
                      >
                        {isDigital
                          ? "🟢 In Stock (Infinite)"
                          : product.variants?.length
                            ? "🟢 Variants in stock"
                            : "🟢 In Stock"}
                      </span>
                    </div>

                    <div className="d-flex align-items-baseline gap-2 flex-wrap">

                      <h2
                        className={`mb-0 fw-bold ${
                          hasDiscount
                            ? styles.activeDiscountPrice
                            : styles.defaultPrice
                        }`}
                      >
                        ${Number(finalPrice).toFixed(2)}
                      </h2>

                      {hasDiscount &&
                        originalPrice > finalPrice && (
                          <span
                            className={
                              styles.strikeThroughPrice
                            }
                          >
                            $
                            {Number(originalPrice).toFixed(2)}
                          </span>
                        )}
                    </div>

                    {hasDiscount && savings > 0 && (
                      <span className="text-success fw-bold small">
                        You save ${savings.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Variant Selector */}
                  {hasMultipleVariants && (
                    <VariantSelector
                      variants={product.variants ?? []}
                      onChange={setSelectedVariant}
                    />
                  )}

                  <button
                    onClick={handleAddToCart}
                    disabled={!canAddToCart}
                    className={`${styles.addToCartBtn} btn w-100 py-3 fw-bold rounded-3 mb-3 d-flex align-items-center justify-content-center gap-2`}
                  >
                    <ShoppingCart size={18} />
                    Add to Cart Collection
                  </button>

                  <div className="d-flex justify-content-center gap-4 small text-muted pt-3 border-top-dashed">

                    <span className="d-flex align-items-center gap-1">
                      <Shield
                        size={14}
                        className="text-success"
                      />
                      Secure Checkout
                    </span>

                    <span className="d-flex align-items-center gap-1">
                      {isDigital ? (
                        <>
                          <Download
                            size={14}
                            className="text-primary"
                          />
                          Instant Delivery
                        </>
                      ) : (
                        <>
                          <Truck
                            size={14}
                            className="text-primary"
                          />
                          Ships in 24h
                        </>
                      )}
                    </span>

                  </div>
                </div>
              </div>

              {/* Metadata Boxes */}
              <div className="row g-2 mb-4">

                <div className="col-6">
                  <div
                    className={`${styles.metaBox} p-3 bg-white rounded-3 border`}
                  >
                    <small className="text-muted d-block mb-1">
                      Format Type
                    </small>

                    <span className="fw-bold text-dark text-capitalize d-flex align-items-center gap-1">
                      {isDigital ? (
                        <Zap
                          size={14}
                          className="text-warning"
                        />
                      ) : (
                        <Box
                          size={14}
                          className="text-secondary"
                        />
                      )}

                      {product.asset_type || "Standard"}
                    </span>
                  </div>
                </div>

                <div className="col-6">
                  <div
                    className={`${styles.metaBox} p-3 bg-white rounded-3 border`}
                  >
                    <small className="text-muted d-block mb-1">
                      Asset Category
                    </small>

                    <span className="fw-bold text-dark">
                      {product.category?.name || "General"}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="row mt-5">
          <div className="col-lg-7">
            <div
              className={`${styles.descriptionCard} p-4 rounded-4 bg-white shadow-sm`}
            >
              <h4 className="fw-bold mb-3 text-dark">
                Description
              </h4>

              <div
                className={`${styles.descriptionBody} text-secondary lh-lg`}
              >
                {product.description}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {product?.related_products?.length ? (
          <div className="mt-5 pt-5 border-top border-light-subtle">

            <div className="d-flex align-items-center justify-content-between mb-4">
              <h4 className="fw-bold text-dark m-0">
                Recommended Assets
              </h4>

              <Link
                to="/"
                className={`${styles.viewAllLink} small fw-bold text-decoration-none`}
              >
                View All Marketplace →
              </Link>
            </div>

            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
              {product.related_products.map((item) => (
                <div className="col" key={item.id}>
                  <ProductCard product={item} />
                </div>
              ))}
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
};

export default ProductDetails;

/* ================= LOADING & FAULT ISOLATION ================= */

const LoadingState = () => (
  <div className="container py-5 text-center d-flex flex-column align-items-center justify-content-center min-vh-50">
    <div
      className="spinner-border text-primary"
      role="status"
      style={{ width: "3rem", height: "3rem" }}
    >
      <span className="visually-hidden">
        Loading...
      </span>
    </div>

    <p className="mt-3 text-muted fw-medium">
      Loading asset specifications...
    </p>
  </div>
);

const ErrorState = () => (
  <div className="container py-5 text-center d-flex flex-column align-items-center justify-content-center min-vh-50">

    <div
      className="p-4 bg-danger-subtle rounded-circle text-danger mb-3"
      style={{ width: "fit-content" }}
    >
      ⚠️
    </div>

    <h3 className="fw-bold text-dark">
      Product Missing
    </h3>

    <p className="text-muted">
      This product profile is either inactive or has been reassigned.
    </p>

    <Link
      to="/"
      className="btn btn-primary px-4 py-2 rounded-3 shadow-sm mt-2 fw-semibold"
    >
      Return to Marketplace
    </Link>

  </div>
);