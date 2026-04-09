"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Gavel } from "lucide-react";

export function AuctionCard({ auction }: { auction: any }) {
  const [timeLeft, setTimeLeft] = useState("");

  // Logic tính toán đếm ngược
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(auction.endTime).getTime();
      const diff = end - now;

      if (diff <= 0) return "Đã kết thúc";

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${hours}h ${minutes}m ${seconds}s`;
    };

    const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(timer);
  }, [auction.endTime]);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Hình ảnh sản phẩm */}
      <div className="relative aspect-video">
        <img
          src={auction.product.images[0]}
          alt={auction.product.name}
          className="object-cover w-full h-full"
        />
        <Badge className="absolute top-2 right-2 bg-red-500">
          Đang diễn ra
        </Badge>
      </div>

      <CardHeader className="p-4 pb-0">
        <div className="text-xs text-muted-foreground uppercase">
          {auction.product.category.name}
        </div>
        <h3 className="font-bold text-lg line-clamp-1">
          {auction.product.name}
        </h3>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Giá hiện tại */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-muted-foreground">Giá hiện tại</p>
            <p className="text-xl font-bold text-primary">
              {Number(auction.currentPrice).toLocaleString()} đ
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">
              Bước giá: {Number(auction.bidIncrement).toLocaleString()} đ
            </p>
          </div>
        </div>

        {/* Thời gian còn lại */}
        <div className="flex items-center gap-2 text-sm font-medium text-orange-600 bg-orange-50 p-2 rounded-md">
          <Clock className="h-4 w-4" />
          <span>Còn lại: {timeLeft}</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/auction/${auction.id}`}>
            <Gavel className="mr-2 h-4 w-4" /> Đấu giá ngay
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
