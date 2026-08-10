import { Heart } from "lucide-react";
import { useWishlistStore } from "../../store/useWishlistStore";
import styles from "../../styles/WishlistButton.module.css";
import type { Product } from "../../types";

type Props = {
  product: Product;
  isFloating?: boolean;
};

export default function WishlistButton({ product, isFloating = false }: Props) {
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isWishlisted = useWishlistStore((s) =>
    s.isWishlisted(Number(product.id)),
  );

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggleWishlist({ ...product, id: Number(product.id) });
      }}
      className={`${styles.wishlistBtn} ${isFloating ? styles.floating : ""}`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={20}
        className={`${styles.icon} ${isWishlisted ? styles.activeIcon : ""}`}
        fill={isWishlisted ? "currentColor" : "none"}
        strokeWidth={isWishlisted ? 2.5 : 2}
      />
    </button>
  );
}
