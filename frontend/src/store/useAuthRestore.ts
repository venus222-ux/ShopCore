// hooks/useAuthRestore.ts
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useStore } from "../store/useStore";
import { refreshToken } from "../api";
import { updateEchoToken } from "../lib/echo";

const publicRoutes = ["/login", "/register", "/forgot-password"];

export const useAuthRestore = () => {
  const location = useLocation();
  const { setAuth, setInitialized, startTokenRefreshLoop, logout } = useStore();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const isPublic = publicRoutes.some(
      (route) =>
        location.pathname === route ||
        location.pathname.startsWith(route + "/"),
    );

    if (isPublic) {
      setInitialized(true);
      return;
    }

    const restore = async () => {
      try {
        const res = await refreshToken();

        const newToken = res.data.token;
        const role = res.data.role;

        // Save to localStorage + Zustand
        localStorage.setItem("token", newToken);
        setAuth(newToken, role);

        // Update Echo immediately
        updateEchoToken(newToken);

        console.log("✅ Auth restored + Echo token updated");

        startTokenRefreshLoop();
      } catch (err: any) {
        console.error("Auth restore failed:", err);
        if (err.response?.status === 401 || err.response?.status === 419) {
          logout();
        }
      } finally {
        setInitialized(true);
      }
    };

    restore();
  }, [
    location.pathname,
    setAuth,
    setInitialized,
    startTokenRefreshLoop,
    logout,
  ]);
};
