import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import { useStore } from "./store/useStore";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthRestore } from "./store/useAuthRestore";
import Success from "./pages/Success";
import CategoryPage from "./pages/CategoryPage";
import { useSettings } from "./hooks/useSettings";
import OrderConfirmation from "./pages/OrderConfirmation";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const ForgotPassword = lazy(() => import("./pages/ForgetPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Wishlist = lazy(() => import("./pages/Wishlist"));

const AuthBootstrap = () => {
  useAuthRestore();
  return null;
};

const App = () => {
  useSettings();
  const { theme, initialized } = useStore();

  // Theme
  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

  return (
    <BrowserRouter>
      {/* AuthBootstrap must run BEFORE any loading check */}
      <AuthBootstrap />

      {!initialized ? (
        <div
          style={{
            textAlign: "center",
            marginTop: "120px",
            fontSize: "1.3rem",
          }}
        >
          Loading...
        </div>
      ) : (
        <>
          <Navbar />

          <Suspense
            fallback={
              <div style={{ textAlign: "center", marginTop: "80px" }}>
                Loading page...
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/products/:slug" element={<ProductDetails />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/success" element={<Success />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} /> for cash payment

              <Route
                path="/login"
                element={
                  !useStore.getState().isAuth ? (
                    <Login />
                  ) : useStore.getState().role === "admin" ? (
                    <Navigate to="/admin/dashboard" replace />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />

              <Route
                path="/register"
                element={
                  !useStore.getState().isAuth ? (
                    <Register />
                  ) : useStore.getState().role === "admin" ? (
                    <Navigate to="/admin/dashboard" replace />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />

              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>

          <ToastContainer position="top-right" autoClose={3000} />
        </>
      )}
    </BrowserRouter>
  );
};

export default App;
