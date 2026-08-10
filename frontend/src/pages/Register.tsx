import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { register } from "../api";
import { useStore } from "../store/useStore";
import styles from "./Register.module.css";

interface FormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export default function Register() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useStore((state) => state.setAuth);

  const passwordsMatch =
    form.password === form.password_confirmation && form.password.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await register(form);
      const { token, role } = response.data;

      setAuth(token, role);
      toast.success("Account created successfully 🎉");

      navigate(role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          toast.error(`${errors[key][0]}`);
        });
      } else {
        toast.error(error.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span>✨</span> Create account
          </h2>
          <p className={styles.subtitle}>
            Join and start building something amazing
          </p>
        </div>

        <form onSubmit={handleRegister}>
          {/* NAME */}
          <div className={styles.formGroup}>
            <input
              className={styles.input}
              placeholder="Full name"
              name="name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          {/* EMAIL */}
          <div className={styles.formGroup}>
            <input
              className={styles.input}
              type="email"
              placeholder="Email address"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className={styles.formGroup}>
            <input
              className={styles.input}
              type="password"
              placeholder="Password (min 6 chars)"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div className={styles.formGroup}>
            <input
              className={styles.input}
              type="password"
              placeholder="Confirm password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />

            {form.password_confirmation.length > 0 && (
              <span
                className={passwordsMatch ? styles.success : styles.errorText}
              >
                {passwordsMatch
                  ? "✓ Passwords match"
                  : "✗ Passwords do not match"}
              </span>
            )}
          </div>

          <button className={styles.btn} disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account?
          <Link to="/login" className={styles.link}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
