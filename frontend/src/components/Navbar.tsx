import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Search,
  Heart,
  Bell,
  User,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import styles from "../styles/Navbar.module.css";

import { useStore } from "../store/useStore";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { useMarketplaceStore } from "../store/useMarketplaceStore";
import { logoutRequest } from "../api";

export default function Navbar() {
  const navigate = useNavigate();

  const {
    isAuth,
    initialized,
    logout,
    theme,
    toggleTheme,
    role,
  } = useStore();

  const { search, setSearch } = useMarketplaceStore();

  const cartCount = useCartStore((s) =>
    s.items.reduce((a, b) => a + b.quantity, 0)
  );

  const wishlistCount = useWishlistStore((s) => s.items.length);

  const unreadCount = useNotificationStore(
    (s) => s.unreadCount
  );

  const notifications = useNotificationStore(
    (s) => s.notifications
  );

  const clearNotifications = useNotificationStore(
    (s) => s.clear
  );

  const [categories, setCategories] = useState<
    { name: string; slug: string }[]
  >([]);

  const [shopOpen, setShopOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const shopRef = useRef<HTMLDivElement>(null);

  /*
   * =====================================================
   * LOAD CATEGORIES
   * =====================================================
   */

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.data || data || []);
      })
      .catch((error) => {
        console.error("Failed to load categories:", error);
      });
  }, []);

  /*
   * =====================================================
   * CLOSE SHOP DROPDOWN WHEN CLICKING OUTSIDE
   * =====================================================
   */

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        shopRef.current &&
        !shopRef.current.contains(e.target as Node)
      ) {
        setShopOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * =====================================================
   * SEARCH
   * =====================================================
   */

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (search.trim()) {
      navigate("/shop");
    }
  };

  /*
   * =====================================================
   * LOGOUT
   * =====================================================
   */

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } finally {
      logout();
      navigate("/login");
    }
  };

  /*
   * =====================================================
   * DASHBOARD PATH
   * =====================================================
   */

  const dashboardPath =
    role === "admin"
      ? "/admin/dashboard"
      : "/dashboard";

  const dashboardLabel =
    role === "admin"
      ? "Admin Dashboard"
      : "Dashboard";

  /*
   * =====================================================
   * INITIALIZATION
   * =====================================================
   */

  if (!initialized) {
    return null;
  }

  return (
    <>
      {/* =====================================================
          TOP ANNOUNCEMENT BAR
      ====================================================== */}

      <div className={styles.topBar}>
        <span>Free Shipping on orders over $50</span>

        <span className={styles.topDivider}>•</span>

        <span>30-Day Returns</span>

        <span className={styles.topDivider}>•</span>

        <span>Secure Payment</span>
      </div>

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header
        className={`${styles.navbar} ${
          theme === "dark" ? styles.dark : ""
        }`}
      >
        <div className={styles.container}>

          {/* =================================================
              LEFT SIDE
          ================================================== */}

          <div className={styles.left}>

            {/* Mobile menu */}

            <button
              type="button"
              className={styles.mobileToggle}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

            {/* Logo */}

            <Link
              to="/"
              className={styles.logo}
              onClick={() => {
                setShopOpen(false);
                setMobileOpen(false);
              }}
            >
              Luxe<span>.</span>
            </Link>

            {/* Desktop navigation */}

            <nav className={styles.nav}>

              {/* HOME */}

              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.active}`
                    : styles.navLink
                }
              >
                Home
              </NavLink>

              {/* SHOP */}

              <div
                className={styles.dropdownWrapper}
                ref={shopRef}
              >
                <button
                  type="button"
                  className={`${styles.shopButton} ${
                    shopOpen
                      ? styles.shopButtonOpen
                      : ""
                  }`}
                  onClick={() =>
                    setShopOpen((value) => !value)
                  }
                  aria-expanded={shopOpen}
                  aria-haspopup="menu"
                >
                  <span>Shop</span>

                  <ChevronDown
                    size={14}
                    strokeWidth={1.8}
                    className={styles.shopChevron}
                  />
                </button>

                {shopOpen && (
                  <div className={styles.dropdown}>

                    <Link
                      to="/shop"
                      className={styles.dropdownItem}
                      onClick={() => {
                        setShopOpen(false);
                      }}
                    >
                      All Products
                    </Link>

                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        to={`/category/${category.slug}`}
                        className={styles.dropdownItem}
                        onClick={() => {
                          setShopOpen(false);
                        }}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* WOMEN */}

              <NavLink
                to="/category/women"
                className={styles.navLink}
              >
                Women
              </NavLink>

              {/* MEN */}

              <NavLink
                to="/category/men"
                className={styles.navLink}
              >
                Men
              </NavLink>

              {/* KIDS */}

              <NavLink
                to="/category/kids"
                className={styles.navLink}
              >
                Kids
              </NavLink>

              {/* SALE */}

              <NavLink
                to="/shop?sale=1"
                className={`${styles.navLink} ${styles.saleLink}`}
              >
                Sale
              </NavLink>
            </nav>
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================== */}

          <div className={styles.right}>

            {/* SEARCH */}

            <form
              className={styles.searchBox}
              onSubmit={handleSearch}
            >
              <Search
                size={16}
                strokeWidth={1.8}
              />

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                aria-label="Search products"
              />
            </form>

            {/* ACTIONS */}

            <div className={styles.actions}>

              {/* THEME */}

              <button
                type="button"
                onClick={toggleTheme}
                className={styles.iconButton}
                title="Toggle theme"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun size={18} />
                ) : (
                  <Moon size={18} />
                )}
              </button>

              {/* NOTIFICATIONS */}

              {isAuth && (
                <div
                  className={styles.notificationWrapper}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setNotifOpen((value) => !value)
                    }
                    className={styles.iconButton}
                    aria-label="Notifications"
                  >
                    <Bell size={18} />

                    {unreadCount > 0 && (
                      <span className={styles.badge}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div
                      className={
                        styles.notificationDropdown
                      }
                    >
                      <div
                        className={
                          styles.notificationHeader
                        }
                      >
                        <h4>Notifications</h4>

                        <button
                          type="button"
                          onClick={clearNotifications}
                        >
                          Clear
                        </button>
                      </div>

                      {notifications.length === 0 ? (
                        <div className={styles.empty}>
                          No notifications
                        </div>
                      ) : (
                        notifications.map(
                          (notification) => (
                            <Link
                              key={notification.id}
                              to={`/products/${notification.product_id}`}
                              className={
                                styles.notificationItem
                              }
                              onClick={() =>
                                setNotifOpen(false)
                              }
                            >
                              <strong>
                                {notification.title}
                              </strong>

                              <p>
                                {notification.message}
                              </p>
                            </Link>
                          )
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* WISHLIST */}

              <Link
                to="/wishlist"
                className={styles.iconButton}
                aria-label="Wishlist"
                title="Wishlist"
              >
                <Heart size={18} />

                {wishlistCount > 0 && (
                  <span className={styles.badge}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* =================================================
                  AUTHENTICATED USER
              ================================================== */}

              {isAuth ? (
                <>
                  {/* DASHBOARD */}

                  <Link
                    to={dashboardPath}
                    className={styles.dashboardNavButton}
                    aria-label={dashboardLabel}
                    title={dashboardLabel}
                  >
                    <LayoutDashboard size={17} />

                    <span>
                      {dashboardLabel}
                    </span>
                  </Link>

                  {/* PROFILE */}

                  <Link
                    to="/profile"
                    className={styles.iconButton}
                    aria-label="Profile"
                    title="Profile"
                  >
                    <User size={18} />
                  </Link>

                  {/* LOGOUT */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className={styles.logoutBtn}
                    title="Logout"
                    aria-label="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                /* GUEST */

                <div className={styles.authLinks}>
                  <Link
                    to="/login"
                    className={styles.authBtn}
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className={styles.authBtnPrimary}
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* CART */}

              <Link
                to="/cart"
                className={styles.cartButton}
                aria-label="Shopping cart"
                title="Shopping cart"
              >
                <ShoppingBag size={18} />

                {cartCount > 0 && (
                  <span className={styles.cartBadge}>
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* =====================================================
            MOBILE MENU
        ====================================================== */}

        {mobileOpen && (
          <div className={styles.mobileMenu}>

            <NavLink
              to="/"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </NavLink>

            <NavLink
              to="/shop"
              onClick={() => setMobileOpen(false)}
            >
              Shop
            </NavLink>

            {isAuth && (
              <NavLink
                to={dashboardPath}
                onClick={() => setMobileOpen(false)}
                className={styles.mobileDashboardLink}
              >
                <LayoutDashboard size={17} />
                {dashboardLabel}
              </NavLink>
            )}

            <NavLink
              to="/category/women"
              onClick={() => setMobileOpen(false)}
            >
              Women
            </NavLink>

            <NavLink
              to="/category/men"
              onClick={() => setMobileOpen(false)}
            >
              Men
            </NavLink>

            <NavLink
              to="/category/kids"
              onClick={() => setMobileOpen(false)}
            >
              Kids
            </NavLink>

            <NavLink
              to="/shop?sale=1"
              onClick={() => setMobileOpen(false)}
            >
              Sale
            </NavLink>
          </div>
        )}
      </header>
    </>
  );
}