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
  LogIn,
  UserPlus,
} from "lucide-react";

import styles from "../styles/Navbar.module.css";

import { useStore } from "../store/useStore";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useNotificationStore } from "../store/useNotificationStore";

import { useEffect, useState } from "react";
import { logoutRequest } from "../api";

export default function Navbar() {
  const navigate = useNavigate();

  const { isAuth, initialized, logout, theme, toggleTheme, role } = useStore();

  const cartCount = useCartStore((s) =>
    s.items.reduce((a, b) => a + b.quantity, 0),
  );

  const wishlistCount = useWishlistStore((s) => s.items.length);

  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const notifications = useNotificationStore((s) => s.notifications);
  const clearNotifications = useNotificationStore((s) => s.clear);

  const [categories, setCategories] = useState<
    { name: string; slug: string }[]
  >([]);
  const [shopOpen, setShopOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.data || data || []));
  }, []);

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } finally {
      logout();
      navigate("/login");
    }
  };

  if (!initialized) return null;

  return (
    <header
      className={`${styles.navbar} ${theme === "dark" ? styles.dark : ""}`}
    >
      <div className={styles.container}>
        {/* LEFT */}
        <div className={styles.left}>
          <Link to="/" className={styles.logo}>
            <span>Asset</span>Hub
          </Link>

          <nav className={styles.nav}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              Discover
            </NavLink>

            <div
              className={styles.dropdownWrapper}
              onMouseEnter={() => setShopOpen(true)}
              onMouseLeave={() => setShopOpen(false)}
            >
              <NavLink to="/shop" className={styles.navLink}>
                Shop <ChevronDown size={15} />
              </NavLink>

              {shopOpen && (
                <div className={styles.dropdown}>
                  <Link to="/shop" className={styles.dropdownItem}>
                    All Products
                  </Link>

                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      to={`/category/${c.slug}`}
                      className={styles.dropdownItem}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {isAuth && (
              <NavLink to="/dashboard" className={styles.navLink}>
                Dashboard
              </NavLink>
            )}

            {role === "admin" && (
              <NavLink to="/admin/dashboard" className={styles.navLink}>
                Admin
              </NavLink>
            )}
          </nav>
        </div>

        {/* RIGHT */}
        <div className={styles.right}>
          {/* SEARCH */}
          <div className={styles.searchBox}>
            <Search size={16} />
            <input type="text" placeholder="Search products..." />
          </div>

          <div className={styles.actions}>
            {/* THEME */}
            <button onClick={toggleTheme} className={styles.iconButton}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* 🔔 NOTIFICATIONS (ONLY IF LOGGED IN) */}
            {isAuth && (
              <div className={styles.notificationWrapper}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className={styles.iconButton}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount}</span>
                  )}
                </button>

                {notifOpen && (
                  <div className={styles.notificationDropdown}>
                    <div className={styles.notificationHeader}>
                      <h4>Notifications</h4>
                      <button onClick={clearNotifications}>Clear</button>
                    </div>

                    {notifications.length === 0 ? (
                      <div className={styles.empty}>No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n.id}
                          to={`/products/${n.product_id}`}
                          className={styles.notificationItem}
                        >
                          <strong>{n.title}</strong>
                          <p>{n.message}</p>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* WISHLIST (optional: hide if not auth if you want stricter UX) */}
            <Link to="/wishlist" className={styles.iconButton}>
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className={styles.badge}>{wishlistCount}</span>
              )}
            </Link>

            {/* AUTH SECTION */}
            {isAuth ? (
              <>
                <Link to="/profile" className={styles.iconButton}>
                  <User size={18} />
                </Link>

                <button onClick={handleLogout} className={styles.logoutBtn}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <div className={styles.authLinks}>
                <Link to="/login" className={styles.authBtn}>
                  <LogIn size={14} /> Login
                </Link>

                <Link to="/register" className={styles.authBtnPrimary}>
                  <UserPlus size={14} /> Register
                </Link>
              </div>
            )}

            {/* CART (always visible) */}
            <Link to="/cart" className={styles.cartButton}>
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
