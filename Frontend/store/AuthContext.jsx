import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [loading, setLoading] = useState(true);

  // Sync theme with DOM
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Initial authentication check from token/localStorage and /auth/me
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && localStorage.getItem("auth") === "true") {
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // ignore parsing error
        }
      }

      // Revalidate with server source of truth
      authApi
        .getMe()
        .then((res) => {
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          // Token expired or invalid
          setUser(null);
          localStorage.removeItem("auth");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("auth", "true");
    localStorage.setItem("user", JSON.stringify(userData));
    if (token) {
      localStorage.setItem("token", token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    authApi.logout().catch(() => {});
  };

  const register = (userData, token) => {
    login(userData, token);
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  const updateProfile = (profileData) => {
    setUser((prev) => {
      const updated = { ...prev, ...profileData };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user && localStorage.getItem("auth") === "true"),
        login,
        logout,
        register,
        theme,
        toggleTheme,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
