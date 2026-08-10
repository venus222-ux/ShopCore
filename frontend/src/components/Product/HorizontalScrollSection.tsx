import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import SkeletonProductCard from "./SkeletonProductCard";
import { Product } from "../../types";
import styles from "../../styles/HorizontalScrollSection.module.css";

interface HorizontalScrollSectionProps {
  title: string;
  fetchUrl: string;
}

const HorizontalScrollSection = ({
  title,
  fetchUrl,
}: HorizontalScrollSectionProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    fetch(fetchUrl)
      .then((res) => res.json())
      .then((data) => setProducts(data.data || data))
      .finally(() => setLoading(false));
  }, [fetchUrl]);

  const checkScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const canScrollRightNow = scrollLeft + clientWidth < scrollWidth - 5;
    const canScrollLeftNow = scrollLeft > 0;
    setCanScrollLeft(canScrollLeftNow);
    setCanScrollRight(canScrollRightNow);
    setIsScrollable(scrollWidth > clientWidth);
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.arrows}>
          <button
            className={`${styles.arrow} ${!canScrollLeft ? styles.disabled : ""}`}
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button
            className={`${styles.arrow} ${!canScrollRight ? styles.disabled : ""}`}
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.scrollWrapper}>
        <div
          className={`${styles.scrollContainer} ${isScrollable ? styles.scrollable : ""}`}
          ref={scrollRef}
          onScroll={checkScrollButtons}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeletonWrapper}>
                  <SkeletonProductCard />
                </div>
              ))
            : products.map((product) => (
                <div key={product.id} className={styles.cardWrapper}>
                  <ProductCard product={product} />
                </div>
              ))}
        </div>
        {/* Fade edges – only visible when scrollable */}
        {isScrollable && (
          <>
            <div className={`${styles.fadeEdge} ${styles.fadeLeft}`} />
            <div className={`${styles.fadeEdge} ${styles.fadeRight}`} />
          </>
        )}
      </div>
    </section>
  );
};

export default HorizontalScrollSection;
