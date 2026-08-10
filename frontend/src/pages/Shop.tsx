import { useRef, useEffect } from "react";
import { useStore } from "../store/useStore";
import { useProducts } from "../hooks/useProducts";
import FiltersSidebar from "../components/FiltersSidebar";
import ProductCard from "../components/Product/ProductCard";
import styles from "../styles/Shop.module.css";

const Shop = () => {
  const { isAuth } = useStore();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useProducts();

  const observerRef = useRef<HTMLDivElement | null>(null);

  // Flatten all pages into a single array
  const products = data?.pages.flatMap((page) => page.data) || [];
  const totalResults = data?.pages[0]?.total ?? 0;

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  // ⭐ Scroll to top when results change (filters / search / sort)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [data?.pages?.[0]?.total]);

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1>Digital Marketplace</h1>
        <p className={styles.heroSubtext}>
          {isAuth
            ? "Welcome back! Discover your next masterpiece."
            : "Premium assets for modern creators. High-quality kits, source code, and assets."}
        </p>
      </section>

      <div className={styles.mainLayout}>
        <aside>
          <FiltersSidebar />
        </aside>

        <main>
          <h2 className={styles.sectionTitle}>
            {totalResults > 0
              ? `${totalResults} results found`
              : "No products found"}
          </h2>

          {/* Loading skeleton */}
          {isLoading && (
            <div className={styles.productGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`${styles.card} ${styles.skeleton}`}>
                  <div className={styles.imageContainer} />

                  <div
                    style={{
                      height: "14px",
                      width: "40%",
                      background: "#eee",
                      borderRadius: "4px",
                    }}
                  />

                  <div
                    className="mt-3"
                    style={{
                      height: "20px",
                      width: "80%",
                      background: "#eee",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Products grid */}
          {!isLoading && products.length > 0 && (
            <div className={styles.productGrid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && totalResults === 0 && (
            <div
              className="text-center py-5 text-muted"
              style={{ fontSize: "1.2rem" }}
            >
              <span>😕 No products match your search or filters.</span>
              <p className="mt-2">
                Try adjusting your search term or clearing some filters.
              </p>
            </div>
          )}

          {/* Infinite scroll trigger */}
          {products.length > 0 && (
            <div ref={observerRef} className="text-center py-5">
              {isFetchingNextPage && (
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
