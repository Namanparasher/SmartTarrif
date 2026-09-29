import { useSelector } from "react-redux";

export function useAuth() {
  const { user, status, bootstrapped } = useSelector((s) => s.auth);
  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isCustomer: user?.role === "customer",
    status,
    bootstrapped,
  };
}
