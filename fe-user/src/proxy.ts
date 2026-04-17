import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Nếu đã đăng nhập mà cố vào trang /login hoặc /register -> Đẩy về trang chủ
  if (token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Nếu chưa đăng nhập mà vào các trang yêu cầu tài khoản (ví dụ /profile, /auction/create)
  // Tạm thời mình chưa có các trang này nên để ví dụ
  const privatePaths = ["/profile", "/auction/create"];
  if (!token && privatePaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Cấu hình Proxy chạy cho những đường dẫn này
export const config = {
  matcher: ["/login", "/signup", "/profile/:path*", "/auctions/:path*"],
};
