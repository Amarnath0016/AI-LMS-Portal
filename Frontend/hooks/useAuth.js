import { useAuthContext } from "@/store/AuthContext";

export function useAuth() {
  const ctx = useAuthContext();
  return {
    user: ctx.user,
    loading: ctx.loading,
    isAuthenticated: ctx.isAuthenticated,
    login: ctx.login,
    logout: ctx.logout,
    register: ctx.register,
  };
}
