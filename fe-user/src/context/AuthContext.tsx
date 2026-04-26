"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { io } from "socket.io-client";
import { toast } from "sonner";
import * as notificationServices from "@/services/notificationServices";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = async () => {
    const data = await notificationServices.getMyNotifications();
    setNotifications(data);
    // Tính toán số lượng chưa đọc
    const unread = data.filter((n: any) => !n.isRead).length;
    setUnreadCount(unread);
  };

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

  useEffect(() => {
    if (user) {
      loadNotifications();
      // 1. Khởi tạo socket toàn cục khi có User
      const newSocket = io("http://localhost:8080/notifications", {
        // Namespace riêng cho thông báo
        auth: { token: Cookies.get("access_token") },
      });

      // 2. Lắng nghe thông báo real-time ở MỌI TRANG
      newSocket.on("newNotification", (data) => {
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast.warning(data.title, {
          description: data.content,
          duration: 10000,
          action: {
            label: "Đặt lại giá",
            onClick: () => (window.location.href = data.link),
          },
        });
      });

      // Lắng nghe thông báo toàn hệ thống (Global)
      newSocket.on("globalUpdate", (data: { message: string }) => {
        console.log("📥 Received globalUpdate:", data.message);
        toast.info("Thông báo hệ thống", {
          id: `global-${data.message}`, // Chống lặp toast cho cùng một nội dung trong thời gian ngắn
          description: data.message,
          duration: 8000,
        });
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const logout = () => {
    Cookies.remove("access_token");
    Cookies.remove("user");
    setUser(null);
    window.location.href = "/";
  };

  const handleMarkAllRead = async () => {
    await notificationServices.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        unreadCount,
        setUnreadCount,
        handleMarkAllRead,
        notifications,
        logout,
        isLoading,
      }}
    >
      {children}
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
