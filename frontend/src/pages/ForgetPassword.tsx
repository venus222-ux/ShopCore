import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { toast } from "react-toastify";
import styles from "./ForgotPassword.module.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setIsSubmitting(true);

    try {
      await API.post("/forgot-password", { email: email.trim() });
      toast.success("Reset link sent! Check your inbox ✉️");
      setEmail("");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to send reset link. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span>🔑</span> Forgot password
          </h2>
          <p className={styles.subtitle}>
            Enter your email and we’ll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <input
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>

          <button className={styles.btn} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className={styles.footer}>
          Remember your password?
          <Link to="/login" className={styles.link}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
