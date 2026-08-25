// Home.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Shirt,
  Footprints,
  Smartphone,
  Sparkles,
  PawPrint,
  Sofa,
  ShoppingBasket,
  Dumbbell,
  Briefcase,
  Plane,
  Baby,
  Car,
  BookOpen,
  Flower2,
  Gem,
  Tag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import styles from "../styles/Home.module.css";
import HorizontalScrollSection from "../components/Product/HorizontalScrollSection";
import ProductCard from "../components/Product/ProductCard";

interface Category {
  id?: number;
  name: string;
  slug: string;
  icon?: string;
}

const ICONS: Record<
  string,
  React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>
> = {
  shirt: Shirt,
  footprints: Footprints,
  smartphone: Smartphone,
  sparkles: Sparkles,
  "paw-print": PawPrint,
  sofa: Sofa,
  "shopping-basket": ShoppingBasket,
  dumbbell: Dumbbell,
  briefcase: Briefcase,
  plane: Plane,
  baby: Baby,
  car: Car,
  "book-open": BookOpen,
  "flower-2": Flower2,
  gem: Gem,
};

/* ------------------------------------------------------------------ */
/*  HERO                                                              */
/* ------------------------------------------------------------------ */

const Hero = () => (
  <section className={styles.hero}>
    <div className={styles.heroInner}>
      <div className={styles.heroContent}>
        <span className={styles.heroBadge}>✦ NEW ARRIVALS</span>

        <h1>
          Discover Your
          <br />
          <span>Style. Live Luxe.</span>
        </h1>

        <p>
          Premium quality fashion for modern lifestyles.
          Curated from the best independent vendors.
        </p>

        <div className={styles.heroActions}>
          <Link to="/shop" className={styles.primaryBtn}>
            Shop Now
          </Link>

          <Link to="/shop" className={styles.secondaryBtn}>
            Explore Collection
          </Link>
        </div>

        <div className={styles.heroTrust}>
          <div className={styles.avatars}>
            <span />
            <span />
            <span />
            <span />
          </div>

          <span>Trusted by 100k+ happy customers</span>
        </div>
      </div>

      <div className={styles.heroImageWrap}>
        <div className={styles.heroImage}>
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80"
            alt="Fashion model"
          />
        </div>

        <div className={styles.discountBadge}>
          <strong>UP TO</strong>
          <span>50%</span>
          <strong>OFF</strong>
        </div>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/*  CATEGORY RAIL                                                     */
/* ------------------------------------------------------------------ */

const CategoryRail = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }

        return res.json();
      })
      .then((data) => {
        setCategories(data.data || data || []);
      })
      .catch((err) => {
        console.error("Failed to load categories", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className={styles.railSkeleton} />;
  }

  return (
    <section className={styles.categoryRail} id="collections">
      <div className={styles.railTrack}>
        {categories.map((category) => {
          const Icon = ICONS[category.icon ?? ""] ?? Tag;

          return (
            <Link
              to={`/category/${category.slug}`}
              className={styles.railItem}
              key={category.slug}
            >
              <span className={styles.railIcon}>
                <Icon size={22} strokeWidth={1.6} />
              </span>

              <span>{category.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  PROMO TILES                                                       */
/* ------------------------------------------------------------------ */

const PromoTiles = () => (
  <section className={styles.promoGrid}>
    <div className={`${styles.promoTile} ${styles.promoWomen}`}>
      <span className={styles.sectionLabel}>Summer Collection 2026</span>

      <h3>Fresh styles for every moment.</h3>

      <Link to="/category/women">
        Shop Women <ChevronRight size={15} />
      </Link>
    </div>

    <div className={`${styles.promoTile} ${styles.promoMen}`}>
      <span className={styles.sectionLabel}>Men’s Essentials</span>

      <h3>Timeless looks for every man.</h3>

      <Link to="/category/men">
        Shop Men <ChevronRight size={15} />
      </Link>
    </div>

    <div className={`${styles.promoTile} ${styles.promoSale}`}>
      <span className={styles.sectionLabel}>Big Sale</span>

      <h3>Up to 50% Off</h3>

      <p>Don’t miss out on exclusive deals!</p>

      <Link to="/shop?sale=1">
        Shop Now <ChevronRight size={15} />
      </Link>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/*  BEST SELLERS GRID                                                 */
/* ------------------------------------------------------------------ */

const BestSellersGrid = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?sort=popular&limit=8")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }

        return res.json();
      })
      .then((data) => {
        // Handle both:
        // { data: [...] }
        // { products: [...] }
        // [...]
        const list = data.data || data.products || data || [];

        setProducts(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error("Failed to load products", err);
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={styles.productsGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.productSkeleton} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.emptyProducts}>
        No products found. Make sure the ProductSeeder ran successfully.
      </div>
    );
  }

  return (
    <div className={styles.productsGrid}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  TRUST BAR                                                         */
/* ------------------------------------------------------------------ */

const TrustBar = () => (
  <section className={styles.trustBar}>
    <div className={styles.trustItem}>
      <Truck size={22} strokeWidth={1.6} />

      <div>
        <strong>Free Shipping</strong>
        <span>On orders over $50</span>
      </div>
    </div>

    <div className={styles.trustItem}>
      <RotateCcw size={22} strokeWidth={1.6} />

      <div>
        <strong>30-Day Returns</strong>
        <span>Hassle-free process</span>
      </div>
    </div>

    <div className={styles.trustItem}>
      <ShieldCheck size={22} strokeWidth={1.6} />

      <div>
        <strong>Secure Payment</strong>
        <span>100% protected checkout</span>
      </div>
    </div>

    <div className={styles.trustItem}>
      <Headphones size={22} strokeWidth={1.6} />

      <div>
        <strong>24/7 Support</strong>
        <span>We’re here to help</span>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/*  TESTIMONIALS                                                      */
/* ------------------------------------------------------------------ */

const testimonials = [
  {
    name: "Jessica M.",
    role: "Verified Buyer",
    quote:
      "Amazing quality and fast delivery! Luxe Fashion is my go-to store now.",
    rating: 5,
  },
  {
    name: "David K.",
    role: "Verified Buyer",
    quote:
      "Stylish collection and great customer service. Highly recommend!",
    rating: 5,
  },
  {
    name: "Sophia R.",
    role: "Verified Buyer",
    quote:
      "Love the designs! The fabric quality is top-notch and super comfortable.",
    rating: 5,
  },
];

const Testimonials = () => {
  const [index, setIndex] = useState(0);

  const go = (dir: number) =>
    setIndex(
      (i) => (i + dir + testimonials.length) % testimonials.length
    );

  const current = testimonials[index];

  return (
    <section className={styles.testimonials}>
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.sectionLabel}>Reviews</span>

          <h2>What Our Customers Say</h2>
        </div>

        <div className={styles.testimonialNav}>
          <button
            onClick={() => go(-1)}
            aria-label="Previous review"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => go(1)}
            aria-label="Next review"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className={styles.testimonialCard}>
        <div className={styles.testimonialStars}>
          {Array.from({ length: current.rating }).map((_, i) => (
            <Star
              key={i}
              size={16}
              fill="currentColor"
            />
          ))}
        </div>

        <p>“{current.quote}”</p>

        <strong>{current.name}</strong>

        <span>{current.role}</span>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  NEWSLETTER                                                        */
/* ------------------------------------------------------------------ */

const Newsletter = () => (
  <section className={styles.newsletter}>
    <div className={styles.newsletterInner}>
      <div>
        <span className={styles.sectionLabel}>Newsletter</span>

        <h2>Get 10% Off Your First Order!</h2>

        <p>
          Join our newsletter for exclusive offers and new arrivals.
        </p>
      </div>

      <form
        className={styles.newsletterForm}
        onSubmit={(e) => {
          e.preventDefault();

          // handle subscribe
        }}
      >
        <div className={styles.newsletterBox}>
          <input
            type="email"
            placeholder="Enter your email"
            required
          />

          <button type="submit">
            Subscribe
          </button>
        </div>

        <small>No spam. Unsubscribe anytime.</small>
      </form>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/*  FOOTER                                                            */
/* ------------------------------------------------------------------ */

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.footerGrid}>
      <div className={styles.footerBrand}>
        <Link to="/" className={styles.logo}>
          Luxe<span>.</span>
        </Link>

        <p>
          Premium quality fashion for modern lifestyles.
          Discover independent vendors and exclusive collections.
        </p>
      </div>

      <div>
        <h5>Shop</h5>

        <ul>
          <li>
            <Link to="/shop">All Products</Link>
          </li>

          <li>
            <Link to="/category/women">Women</Link>
          </li>

          <li>
            <Link to="/category/men">Men</Link>
          </li>

          <li>
            <Link to="/category/kids">Kids</Link>
          </li>

          <li>
            <Link to="/shop?sale=1">Sale</Link>
          </li>
        </ul>
      </div>

      <div>
        <h5>Customer Service</h5>

        <ul>
          <li>
            <Link to="/contact">Contact Us</Link>
          </li>

          <li>
            <Link to="/shipping">
              Shipping & Delivery
            </Link>
          </li>

          <li>
            <Link to="/returns">
              Returns & Refunds
            </Link>
          </li>

          <li>
            <Link to="/faq">FAQ</Link>
          </li>

          <li>
            <Link to="/size-guide">
              Size Guide
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h5>Company</h5>

        <ul>
          <li>
            <Link to="/about">About Us</Link>
          </li>

          <li>
            <Link to="/careers">Careers</Link>
          </li>

          <li>
            <Link to="/blog">Blog</Link>
          </li>

          <li>
            <Link to="/sustainability">
              Sustainability
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h5>Contact Us</h5>

        <ul>
          <li>+1 (800) 123-4567</li>

          <li>support@luxefashion.com</li>

          <li>
            123 Fashion Street,
            <br />
            New York, NY 10001, USA
          </li>
        </ul>
      </div>
    </div>

    <div className={styles.footerBottom}>
      <span>
        © 2026 Luxe Fashion. All rights reserved.
      </span>

      <div className={styles.paymentIcons}>
        <span>VISA</span>
        <span>Mastercard</span>
        <span>PayPal</span>
        <span>Apple Pay</span>
      </div>
    </div>
  </footer>
);

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                         */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div className={styles.page}>
      <Hero />

      <CategoryRail />

      <PromoTiles />

      {/* ==================== BEST SELLERS ==================== */}
      <section className={styles.productsSection}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionLabel}>
              Popular
            </span>

            <h2>Best Sellers</h2>
          </div>

          <Link to="/shop">
            View All Products →
          </Link>
        </div>

        <BestSellersGrid />
      </section>

      <TrustBar />

      <Testimonials />

      <Newsletter />

      <Footer />
    </div>
  );
}