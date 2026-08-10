// CategoryPage.tsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../components/Product/ProductCard";
import { Product } from "../types";
import styles from "../styles/CategoryPage.module.css";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PackageSearch,
} from "lucide-react";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    fetch(`/api/categories/${slug}/products?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data || []);
        setCategoryName(data.category || "");
        setLastPage(data.meta?.last_page || 1);
      })
      .catch((err) => console.error("Failed to load products", err))
      .finally(() => setLoading(false));
  }, [slug, page]);

  const handleNext = () => {
    if (page < lastPage) setPage((p) => p + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loader}></div>
        <p>Loading premium assets...</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <PackageSearch size={44} />
        </div>

        <h2>No products found</h2>

        <p>This category is currently empty or products are being updated.</p>

        <Link to="/shop" className={styles.backBtn}>
          Return Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} />
            Curated Collection
          </div>

          <h1>{categoryName}</h1>

          <p>
            Explore premium digital products, templates, UI kits and curated
            creative resources crafted for modern creators.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <div className={styles.container}>
        {/* TOP BAR */}
        <div className={styles.topbar}>
          <div>
            <span className={styles.results}>
              {products.length} assets available
            </span>
          </div>

          <div className={styles.pageIndicator}>
            Page {page} / {lastPage}
          </div>
        </div>

        {/* GRID */}
        <div className={styles.grid}>
          {products.map((product) => (
            <div key={product.id} className={styles.cardWrapper}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className={styles.pagination}>
          <button
            className={styles.paginationBtn}
            onClick={handlePrev}
            disabled={page === 1}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className={styles.paginationCenter}>
            <span className={styles.currentPage}>{page}</span>
            <span className={styles.paginationDivider}>/</span>
            <span>{lastPage}</span>
          </div>

          <button
            className={styles.paginationBtn}
            onClick={handleNext}
            disabled={page === lastPage}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
