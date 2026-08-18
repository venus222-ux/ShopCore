import { Link } from "react-router-dom";
import { useWishlistStore } from "../store/useWishlistStore";
import { HeartOff } from "lucide-react";
import ProductCard from "../components/Product/ProductCard";
import styles from "../styles/Wishlist.module.css";

export default function Wishlist() {
  const items = useWishlistStore((s) => s.items);

  if (!items.length) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <HeartOff size={58} className={styles.emptyIcon} />

          <h2 className={styles.emptyTitle}>Your Wishlist is Empty</h2>

          <p className={styles.emptyText}>
            Save your favorite digital assets and collections here for quick
            access later.
          </p>

          <Link to="/products" className={styles.browseBtn}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Wishlist
          <span className={styles.count}>({items.length})</span>
        </h2>

        <p className={styles.subtitle}>Saved products you love</p>
      </div>

      <div className={styles.grid}>
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}