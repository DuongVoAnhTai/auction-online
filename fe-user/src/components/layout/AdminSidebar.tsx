"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Gavel,
  Users,
  FolderTree,
  LogOut,
  Home,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { href: "/admin", icon: <LayoutDashboard size={20} />, label: "Thống kê" },
    {
      href: "/admin/auctions",
      icon: <Gavel size={20} />,
      label: "Duyệt sản phẩm",
    },
    { href: "/admin/users", icon: <Users size={20} />, label: "Người dùng" },
    {
      href: "/admin/categories",
      icon: <FolderTree size={20} />,
      label: "Danh mục",
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col sticky top-0 h-screen border-r border-slate-800">
      {/* Logo Admin */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2 font-bold text-xl text-white">
          <Gavel className="text-primary" />
          <span className="tracking-tight">T-AUCTION</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-semibold">
          Management Portal
        </p>
      </div>

      {/* Danh sách Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "hover:bg-slate-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* Phần chân Sidebar */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-900"
          asChild
        >
          <Link href="/">
            <Home className="mr-3" size={18} />
            <span className="text-sm">Về trang chủ</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30"
          onClick={logout}
        >
          <LogOut className="mr-3" size={18} />
          <span className="text-sm">Đăng xuất</span>
        </Button>
      </div>
    </aside>
  );
}
