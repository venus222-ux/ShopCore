// Home.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Home.module.css";
import HorizontalScrollSection from "../components/Product/HorizontalScrollSection";

interface Category {
  id?: number;
  name: string;
  slug: string;
  image?: string;
}

const Hero = () => (
  <section className={styles.hero}>
    <div className={styles.heroNoise}></div>

    <div className={styles.heroContent}>
      <span className={styles.heroBadge}>
        Trusted by 50k+ creators worldwide
      </span>

      <h1>
        Premium Digital Assets
        <span> for modern creators</span>
      </h1>

      <p>
        Discover world-class UI kits, templates, illustrations, and digital
        products crafted by elite creators.
      </p>

      <div className={styles.heroActions}>
        <Link to="/shop" className={styles.primaryBtn}>
          Explore Marketplace
        </Link>

        <a href="#collections" className={styles.secondaryBtn}>
          View Collections
        </a>
      </div>
    </div>

    <div className={styles.heroGlow}></div>
    <div className={styles.heroGlow2}></div>
  </section>
);

const FeaturedCollections = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        const categoriesData = data.data || data || [];

        // Optional fallback images
        const fallbackImages = [
          "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
        ];

        const mapped = categoriesData.map(
          (category: Category, index: number) => ({
            ...category,
            image:
              category.image || fallbackImages[index % fallbackImages.length],
          }),
        );

        setCategories(mapped);
      })
      .catch((err) => console.error("Failed to load categories", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={styles.collections} id="collections">
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.sectionLabel}>Collections</span>
          <h2>Featured Categories</h2>
        </div>

        <Link to="/shop">View all</Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <span className="text-muted">Loading categories...</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {categories.map((category) => (
            <Link
              to={`/category/${category.slug}`}
              className={styles.categoryCard}
              key={category.slug}
            >
              <div>
                <h3>{category.name}</h3>
                <p>Explore collection</p>
              </div>

              <span className={styles.arrow}>→</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

const Mission = () => (
  <section className={styles.mission}>
    <div className={styles.missionCard}>
      <span className={styles.sectionLabel}>Our Mission</span>

      <h2>Empowering creators with beautifully crafted digital experiences.</h2>

      <p>
        We curate only high-quality digital assets from world-class creators so
        designers, developers, and startups can build faster.
      </p>
    </div>
  </section>
);

const Newsletter = () => (
  <section className={styles.newsletter}>
    <div className={styles.newsletterGlow}></div>

    <div className="row align-items-center">
      <div className="col-lg-7 mb-4 mb-lg-0">
        <span className={styles.sectionLabel}>Newsletter</span>

        <h2>
          Join the mailing list &
          <br />
          receive exclusive offers
        </h2>

        <p>
          Get notified about new digital assets, premium templates, and special
          discounts.
        </p>
      </div>

      <div className="col-lg-5">
        <div className={styles.newsletterBox}>
          <input type="email" placeholder="Enter your email" />

          <button>Subscribe</button>
        </div>

        <small>No spam. Unsubscribe anytime.</small>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className={styles.footer}>
    <div className="row g-5">
      <div className="col-lg-4">
        <div className={styles.logo}>AssetHub</div>

        <p>
          Premium marketplace for curated digital assets and creative resources.
        </p>
      </div>

      <div className="col-lg-2 col-md-4">
        <h5>Marketplace</h5>

        <ul>
          <li>
            <Link to="/shop">Discover</Link>
          </li>

          <li>
            <Link to="/shop?sort=trending">Trending</Link>
          </li>

          <li>
            <Link to="/shop?sort=newest">New Releases</Link>
          </li>
        </ul>
      </div>

      <div className="col-lg-2 col-md-4">
        <h5>Company</h5>

        <ul>
          <li>
            <a href="#">About</a>
          </li>

          <li>
            <a href="#">Careers</a>
          </li>

          <li>
            <a href="#">Contact</a>
          </li>
        </ul>
      </div>

      <div className="col-lg-4">
        <h5>Stay Updated</h5>

        <div className={styles.footerSubscribe}>
          <input type="email" placeholder="Email address" />
          <button>Join</button>
        </div>
      </div>
    </div>

    <div className={styles.footerBottom}>
      © 2026 AssetHub. All rights reserved.
    </div>
  </footer>
);

const Home = () => {
  return (
    <main className={styles.page}>
      <div className="container-fluid px-lg-5 px-3">
        <Hero />

        <FeaturedCollections />

        <section className={styles.productsSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionLabel}>Trending</span>
              <h2>New Releases</h2>
            </div>

            <Link to="/shop?sort=newest">View all</Link>
          </div>

          <HorizontalScrollSection
            title=""
            fetchUrl="/api/products?sort=newest"
          />
        </section>

        <Mission />

        <Newsletter />

        <Footer />
      </div>
    </main>
  );
};

export default Home;
