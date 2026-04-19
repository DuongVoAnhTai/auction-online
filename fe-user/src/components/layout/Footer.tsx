import Link from "next/link";
import { Gavel } from "lucide-react";
import {
  FacebookIcon,
  GithubIcon,
  TwitterIcon,
} from "../../../public/image/icon";

export function Footer() {
  return (
    <footer className="w-full border-t bg-slate-50">
      <div className="container mx-auto px-4 py-10 md:py-16">
        {/* Thay đổi grid: 1 cột cho mobile, 2 cho tablet, 4 cho desktop */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
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

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Hỗ trợ
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Quy định đấu giá
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Giải quyết tranh chấp
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Danh mục
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Đồ điện tử
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Bất động sản
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Đồ cổ & Sưu tầm
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Kết nối
            </h3>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <FacebookIcon />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <TwitterIcon />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <GithubIcon />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-xs md:text-sm text-muted-foreground">
          © 2026 T-Auction. Developed by Duong Vo Anh Tai. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
