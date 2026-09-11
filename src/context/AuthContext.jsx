import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { adminRequest } from "../api/client";

const AuthContext = createContext(null);
const ADMIN_SESSION_KEY = "slms_admin_session";
const ADMIN_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function clearStoredAuthentication() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    storage.removeItem("slms_admin_session");
    storage.removeItem("slms_access_token");
    storage.removeItem("token");
  }
  window.sessionStorage.removeItem("slms-selected-student-id");
  window.sessionStorage.removeItem("slms-selected-student-name");
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    if (name) document.cookie = `${name}=; Max-Age=0; path=/`;
  });
}

const readSession = () => {
  try {
    const value = window.localStorage.getItem(ADMIN_SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

async function loginWithApi({ email, password }) {
  if (!ADMIN_API_BASE_URL) {
    throw new Error("API is not configured.");
  }

  clearStoredAuthentication();
  const payload = await adminRequest("/admin/login", {
    method: "POST",
    body: { email, password },
  });
  const token = payload?.token;
  const user = payload?.admin;

  if (!token || !user) {
    throw new Error("Authentication response is incomplete.");
  }

  const session = {
    ...user,
    token,
    refreshToken: payload?.refreshToken || null,
    sessionId: payload?.sessionId || null,
  };
  window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  window.localStorage.setItem("slms_access_token", token);
  return session;
}

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(readSession);

  useEffect(() => {
    const handleSessionExpired = () => setAdmin(null);
    window.addEventListener("slms:session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("slms:session-expired", handleSessionExpired);
  }, []);

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: Boolean(admin),
      login: async (nextAdmin) => {
        setAdmin(null);
        const session = await loginWithApi({
          email: nextAdmin?.email,
          password: nextAdmin?.password,
        });
        setAdmin(session);
        return session;
      },
      logout: async () => {
        try {
          if (admin?.token) {
            await adminRequest("/admin/logout", { method: "POST" });
          }
        } finally {
          clearStoredAuthentication();
          setAdmin(null);
        }
      },
    }),
    [admin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
