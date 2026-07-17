import { useCallback } from "react";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";

export type AuthUser = {
  id: number;
  staffId: string;
  staffName: string;
  username: string;
  email: string;
  mobileNumber: string;
  role: "Admin" | "Staff";
  isActive: boolean;
};

export function useAuth() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    utils.auth.me.invalidate();
    navigate("/login");
  }, [navigate, utils]);

  const isAdmin = user?.role === "Admin";
  const isStaff = user?.role === "Staff";
  const isAuthenticated = !!user;

  return {
    user: user as AuthUser | null,
    isLoading,
    isAuthenticated,
    isAdmin,
    isStaff,
    logout,
  };
}
