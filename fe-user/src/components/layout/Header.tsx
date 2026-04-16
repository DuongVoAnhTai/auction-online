"use client";

import Link from "next/link";
import {
  Bell,
  Search,
  LogOut,
  User as UserIcon,
  Gavel,
  PlusCircle,
  Clock,
  Menu,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export function Header() {
  const { user, logout } = useAuth();
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Cập nhật đồng hồ mỗi giây
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* --- LEFT SIDE: LOGO & MOBILE MENU --- */}
        <div className="flex items-center gap-2">
          {/* Hamburger Menu cho Mobile (Ẩn trên desktop) */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Gavel className="h-6 w-6 text-primary" /> T-Auction
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8 ml-4">
                  <Link href="/auctions" className="text-lg font-medium">
                    Đang diễn ra
                  </Link>
                  <Link href="/upcoming" className="text-lg font-medium">
                    Sắp diễn ra
                  </Link>
                  <Link href="/categories" className="text-lg font-medium">
                    Danh mục sản phẩm
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/" className="flex items-center gap-2">
            <Gavel className="h-6 w-6 text-primary" />
            <span className="text-lg md:text-xl font-bold tracking-tight">
              T-Auction
            </span>
          </Link>

          {/* Nav Links (Chỉ hiện trên Desktop) */}
          <nav className="hidden md:flex items-center gap-4 ml-6 text-sm font-medium">
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

        {/* --- MIDDLE: SEARCH (Ẩn trên mobile nhỏ, hiện từ tablet) --- */}
        <div className="hidden sm:flex flex-1 items-center justify-center px-4">
          <div className="relative w-full max-w-[300px] lg:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm..."
              className="pl-8 h-9"
            />
          </div>
        </div>

        {/* --- RIGHT SIDE: CLOCK & USER --- */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Đồng hồ (Ẩn trên điện thoại nhỏ) */}
          {mounted && (
            <div className="hidden md:flex items-center gap-1.5 text-[10px] md:text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-md">
              <Clock className="h-3 w-3" />
              {time.toLocaleTimeString()}
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 md:h-10 md:w-10"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-600"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 md:h-9 md:w-9 rounded-full"
                  >
                    <Avatar className="h-8 w-8 md:h-9 md:w-9">
                      <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                      <AvatarFallback>
                        {user.fullName?.substring(0, 2)}
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
                    <Link
                      href="/profile"
                      className="cursor-pointer w-full flex items-center"
                    >
                      <UserIcon className="mr-2 h-4 w-4" /> Trang cá nhân
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "SELLER" && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/auction/create"
                        className="cursor-pointer w-full flex items-center"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Đăng sản phẩm
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex gap-1 md:gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-xs md:text-sm"
              >
                <Link href={`/login?redirect=${pathname}`}>Đăng nhập</Link>
              </Button>
              <Button size="sm" asChild className="text-xs md:text-sm">
                <Link href="/signup">Đăng ký</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
