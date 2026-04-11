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
  const [timeLeft, setTimeLeft] = useState({
    text: "",
    label: "",
    isUrgent: false, // Dưới 5 phút
    isEnded: false, // Đã hết giờ
    isPending: false,
  });

  // Logic tính toán đếm ngược
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const start = new Date(auction.startTime).getTime();
      const end = new Date(auction.endTime).getTime();

      let targetDate: number;
      let label: string;
      let isPending = false;

      // 1. Xác định mục tiêu đếm ngược
      if (auction.status === "PENDING" || now < start) {
        targetDate = start;
        label = "Bắt đầu sau";
        isPending = true;
      } else if (auction.status === "ACTIVE" && now < end) {
        targetDate = end;
        label = "Kết thúc sau";
        isPending = false;
      } else {
        return {
          text: "Đã kết thúc",
          label: "",
          isUrgent: false,
          isEnded: true,
          isPending: false,
        };
      }

      const diff = targetDate - now;

      if (diff <= 0) {
        return {
          text: "Đang xử lý...",
          label: "",
          isUrgent: false,
          isEnded: false,
          isPending: false,
        };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const dayText = days > 0 ? `${days}n ` : "";
      const text = `${dayText}${hours}h ${minutes}m ${seconds}s`;

      const isUrgent = !isPending && diff < 5 * 60 * 1000; // Chỉ đỏ khi đang ACTIVE và < 5p

      return { text, label, isUrgent, isEnded: false, isPending };
    };

    const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(timer);
  }, [auction.startTime, auction.endTime, auction.status]);

  const getTimeStyles = () => {
    if (timeLeft.isEnded) return "text-gray-600 bg-gray-100";
    if (timeLeft.isPending)
      return "text-emerald-600 bg-emerald-50 border border-emerald-100";
    if (timeLeft.isUrgent)
      return "text-red-600 bg-red-50 animate-pulse border border-red-200";
    return "text-blue-600 bg-blue-50";
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Hình ảnh sản phẩm */}
      <div className="relative aspect-video">
        <img
          src={auction.product.images[0]}
          alt={auction.product.name}
          className={`object-cover w-full h-full ${timeLeft.isEnded ? "grayscale" : ""}`}
        />
        <Badge
          className={`absolute top-2 right-2 ${
            timeLeft.isPending
              ? "bg-emerald-500"
              : timeLeft.isEnded
                ? "bg-gray-500"
                : "bg-red-500"
          }`}
        >
          {timeLeft.isPending
            ? "Sắp diễn ra"
            : timeLeft.isEnded
              ? "Đã kết thúc"
              : "Đang diễn ra"}
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
        <div
          className={`flex items-center gap-2 text-sm font-bold p-2 rounded-md transition-colors ${getTimeStyles()}`}
        >
          <Clock className="h-4 w-4" />
          <span>
            {timeLeft.isEnded
              ? "Phiên đấu giá đã kết thúc"
              : `${timeLeft.label}: ${timeLeft.text}`}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          asChild
          className="w-full"
          variant={
            timeLeft.isEnded || timeLeft.isPending ? "outline" : "default"
          }
          disabled={timeLeft.isEnded}
        >
          <Link href={`/auction/${auction.id}`}>
            <Gavel className="mr-2 h-4 w-4" />{" "}
            {timeLeft.isPending
              ? "Xem trước"
              : timeLeft.isEnded
                ? "Xem kết quả"
                : "Đấu giá ngay"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
