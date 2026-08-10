import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../api";
import { toast } from "react-toastify";
import { useStore } from "../store/useStore";
import styles from "./ResetPassword.module.css";

export default function ResetPassword() {
  const { token: tokenParam } = useParams();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || tokenParam || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const passwordsMatch =
    password.length > 0 && password === passwordConfirmation;

  useEffect(() => {
    if (!token || !email) {
      toast.error("Invalid or expired password reset link");
    }
  }, [token, email]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token || !email) {
      toast.error("Invalid password reset link");
      return;
    }

    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await API.post("/reset-password", {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      useStore.getState().logout();

      toast.success("Password reset successful 🎉");
      navigate("/login");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Password reset failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span>🔒</span> Reset password
          </h2>
          <p className={styles.subtitle}>
            Set a new password for <strong>{email || "your account"}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <input
              className={styles.input}
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              autoFocus
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <input
              className={styles.input}
              type="password"
              placeholder="Confirm new password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              autoComplete="new-password"
              disabled={loading}
            />

            {passwordConfirmation.length > 0 && (
              <span className={passwordsMatch ? styles.success : styles.error}>
                {passwordsMatch
                  ? "✓ Passwords match"
                  : "✗ Passwords do not match"}
              </span>
            )}
          </div>

          <button className={styles.btn} disabled={loading}>
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}
