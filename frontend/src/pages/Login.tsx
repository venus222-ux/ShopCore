import { useState, FormEvent, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useStore } from "../store/useStore";
import { login } from "../api";
import styles from "./Login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { setAuth, startTokenRefreshLoop, isAuth, role, initialized } =
    useStore();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login({ email, password });
      const { token, role } = res.data;

      setAuth(token, role);
      startTokenRefreshLoop();

      toast.success("Welcome back! 👋");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized) return;
    if (!isAuth) return;

    navigate(role === "admin" ? "/admin/dashboard" : "/dashboard");
  }, [isAuth, role, initialized, navigate]);

  if (!initialized) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span>🔐</span> Welcome back
          </h2>
          <p className={styles.subtitle}>Sign in to continue to your account</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <input
              className={styles.input}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <input
              className={styles.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className={styles.links}>
          <Link to="/register" className={styles.link}>
            Create account
          </Link>
          <Link to="/forgot-password" className={styles.link}>
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
