"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

export function BiddingPanel({ auction }: { auction: any }) {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState("");
  const [bidAmount, setBidAmount] = useState<number>(0);
  const pathname = usePathname();

  // Mức giá tối thiểu người dùng phải trả
  const minNextBid =
    Number(auction.currentPrice) + Number(auction.bidIncrement);

  useEffect(() => {
    setBidAmount(minNextBid); // Gợi ý sẵn mức giá tối thiểu

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(auction.endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Đã kết thúc");
        clearInterval(timer);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [auction.endTime, auction.currentPrice]);

  const handleQuickBid = (amount: number) => {
    setBidAmount(Number(auction.currentPrice) + amount);
  };

  return (
    <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
      <div className="bg-primary p-4 text-primary-foreground">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span className="font-mono text-xl font-bold">{timeLeft}</span>
          </div>
          <Badge variant="secondary" className="animate-pulse">
            Đang diễn ra
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Khối hiển thị giá hiện tại */}
        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-dashed">
          <div>
            <p className="text-sm text-muted-foreground">
              Giá cao nhất hiện tại
            </p>
            <p className="text-3xl font-extrabold text-primary">
              {Number(auction.currentPrice).toLocaleString()}đ
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-emerald-500" />
        </div>

        {/* Khối đặt giá */}
        {!user ? (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-center space-y-3">
            <p className="text-sm text-amber-800 font-medium">
              Bạn cần đăng nhập để tham gia phiên đấu giá này
            </p>
            <Button asChild className="w-full">
              <Link href={`/login?redirect=${pathname}`}>Đăng nhập ngay</Link>
            </Button>
          </div>
        ) : user.id === auction.product.sellerId ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-slate-100 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            Bạn không thể tự trả giá sản phẩm của chính mình
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[50000, 100000, 500000].map((val) => (
                <Button
                  key={val}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickBid(val)}
                >
                  +{val.toLocaleString()}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Số tiền của bạn (đ)</label>
              <Input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                className="text-lg font-bold"
                min={minNextBid}
              />
              <p className="text-[10px] text-muted-foreground italic">
                * Phải trả ít nhất {minNextBid.toLocaleString()}đ (Giá hiện tại
                + bước giá)
              </p>
            </div>

            <Button
              className="w-full h-12 text-lg font-bold"
              disabled={bidAmount < minNextBid || timeLeft === "Đã kết thúc"}
            >
              {timeLeft === "Đã kết thúc" ? "PHIÊN ĐÃ ĐÓNG" : "ĐẶT GIÁ NGAY"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
