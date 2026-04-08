"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Bell,
  Search,
  LogOut,
  User as UserIcon,
  Gavel,
  PlusCircle,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // Cập nhật đồng hồ mỗi giây
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Lấy dữ liệu user từ Cookie
  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) setUser(JSON.parse(userCookie));
  }, []);

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("user");
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo & Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Gavel className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">T-Auction</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link
              href="/auctions"
              className="transition-colors hover:text-primary"
            >
              Đang diễn ra
            </Link>
            <Link
              href="/upcoming"
              className="transition-colors hover:text-primary"
            >
              Sắp tới
            </Link>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:flex flex-1 items-center justify-center px-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm sản phẩm..."
              className="pl-8 h-9"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Đồng hồ hệ thống */}
          {mounted ? (
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-md">
              <Clock className="h-3 w-3" />
              {time.toLocaleTimeString()}
            </div>
          ) : (
            <div className="hidden sm:flex h-6 w-24 bg-secondary animate-pulse rounded-md" />
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-600"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                      <AvatarFallback>
                        {user.fullName.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.fullName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4" /> Trang cá nhân
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "SELLER" && (
                    <DropdownMenuItem asChild>
                      <Link href="/auction/create" className="cursor-pointer">
                        <PlusCircle className="mr-2 h-4 w-4" /> Đăng sản phẩm
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Đăng ký</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
