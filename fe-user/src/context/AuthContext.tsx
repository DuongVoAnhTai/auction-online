"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load dữ liệu từ Cookie khi ứng dụng khởi chạy
  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        setUser(JSON.parse(userCookie));
      } catch (error) {
        console.error("Lỗi parse cookie user:", error);
        Cookies.remove("user");
      }
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    Cookies.remove("access_token");
    Cookies.remove("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}login
    </AuthContext.Provider>
  );
}

// Custom hook để dùng context nhanh
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
