import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const ADMIN_SESSION_KEY = "slms_admin_session";

const readSession = () => {
  try {
    const value = window.localStorage.getItem(ADMIN_SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(readSession);

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: Boolean(admin),
      login: (nextAdmin) => {
        const session = {
          name: nextAdmin?.name || "SLMS Administrator",
          email: nextAdmin?.email || "admin@slms.edu.pk",
          role: nextAdmin?.role || "System Administrator",
        };
        window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        setAdmin(session);
      },
      logout: () => {
        window.localStorage.removeItem(ADMIN_SESSION_KEY);
        setAdmin(null);
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
