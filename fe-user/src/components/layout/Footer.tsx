import Link from "next/link";
import { Gavel, Facebook, Twitter, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Cột 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Gavel className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">T-Auction</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sàn đấu giá trực tuyến thời gian thực hàng đầu Việt Nam. Minh bạch
              - An toàn - Nhanh chóng.
            </p>
          </div>

          {/* Cột 2: Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Hỗ trợ
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary">
                  Quy định đấu giá
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Giải quyết tranh chấp
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Categories */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Danh mục
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary">
                  Đồ điện tử
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Bất động sản
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Đồ cổ & Sưu tầm
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Social */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Kết nối
            </h3>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          © 2026 T-Auction. Developed by Duong Vo Anh Tai. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
