"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, AlertCircle } from "lucide-react";
import { useAuctionSocket } from "@/hooks/useAuctionSocket";
import { BidHistory } from "./BidHistory";
import { formatNumber, parseNumber } from "@/utils/format";

export function BiddingPanel({ auction }: { auction: any }) {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState({
    text: "",
    label: "",
    isUrgent: false,
    isEnded: false,
    isPending: false,
  });
  // State hiển thị trên ô input (dạng chuỗi "1.000.000")
  const [displayAmount, setDisplayAmount] = useState("");
  const [bidAmount, setBidAmount] = useState<number>(0);
  const pathname = usePathname();

  const { currentPrice, endTime, placeBid, bidHistory, status } =
    useAuctionSocket(
      auction.id,
      Number(auction.currentPrice),
      auction.endTime,
      auction.bids || [],
      auction.status,
    );

  // Mức giá tối thiểu người dùng phải trả
  const minNextBid = currentPrice + Number(auction.bidIncrement);

  useEffect(() => {
    const initialBid = Math.floor(minNextBid);
    setBidAmount(initialBid);
    setDisplayAmount(formatNumber(initialBid));
  }, [minNextBid]);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const start = new Date(auction.startTime).getTime();
      const end = new Date(endTime).getTime();

      let targetDate: number;
      let label: string;
      let isPending = false;

      if (status === "PENDING" || now < start) {
        targetDate = start;
        label = "Bắt đầu sau";
        isPending = true;
      } else if (status === "ACTIVE" && now < end) {
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

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      const text = `${h}h ${m}m ${s}s`;
      const isUrgent = !isPending && diff < 5 * 60 * 1000;

      return { text, label, isUrgent, isEnded: false, isPending };
    };

    setTimeLeft(calculateTime());
    const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(timer);
  }, [endTime, status, auction.startTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // 1. Chuyển chuỗi người dùng nhập về số thuần túy
    const numericValue = parseNumber(rawValue);

    // 2. Cập nhật state thực tế (để kiểm tra logic bidAmount < minNextBid)
    setBidAmount(numericValue);

    // 3. Cập nhật state hiển thị (format lại ngay lập tức)
    setDisplayAmount(formatNumber(numericValue));
  };

  const handleQuickBid = (amount: number) => {
    const newAmount = currentPrice + amount;
    setBidAmount(newAmount);
    setDisplayAmount(formatNumber(newAmount));
  };

  // Xác định màu nền
  const getHeaderBgColor = () => {
    if (status === "COMPLETED" || timeLeft.isEnded) return "bg-gray-600";
    if (status === "PENDING" || timeLeft.isPending) return "bg-emerald-600";
    if (timeLeft.isUrgent) return "bg-red-600 animate-pulse";
    return "bg-primary"; // Mặc định cho ACTIVE
  };

  const getActualStatus = () => {
    const now = new Date().getTime();
    const start = new Date(auction.startTime).getTime();
    const end = new Date(endTime).getTime();

    if (status === "PENDING") return "WAITING_REVIEW";
    if (status === "REJECTED") return "REJECTED";
    if (status === "COMPLETED") return "FINISHED";

    // Nếu status là ACTIVE trong DB, ta check tiếp thời gian
    if (now < start) return "UPCOMING";
    if (now >= start && now < end) return "BIDDING";
    return "FINISHED";
  };

  const actualStatus = getActualStatus();

  return (
    <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
      <div
        className={`${getHeaderBgColor()} p-4 text-primary-foreground transition-colors`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Clock
              className={`h-5 w-5 ${timeLeft.isUrgent ? "animate-pulse" : ""}`}
            />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase opacity-80 leading-none">
                {timeLeft.label}
              </span>
              <span className="font-mono text-xl font-bold">
                {timeLeft.text}
              </span>
            </div>
          </div>
          <Badge
            variant={actualStatus === "BIDDING" ? "default" : "secondary"}
            className={
              actualStatus === "BIDDING"
                ? "animate-pulse bg-white text-primary"
                : ""
            }
          >
            {actualStatus === "BIDDING" && "Đang diễn ra"}
            {actualStatus === "UPCOMING" && "Sắp diễn ra"}
            {actualStatus === "FINISHED" && "Đã kết thúc"}
            {actualStatus === "WAITING_REVIEW" && "Chờ duyệt"}
            {actualStatus === "REJECTED" && "Bị từ chối"}
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
              {formatNumber(currentPrice)}đ
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
        ) : status === "COMPLETED" ? (
          <div className="bg-gray-100 p-4 rounded-lg text-center font-bold text-gray-600">
            PHIÊN ĐẤU GIÁ ĐÃ KẾT THÚC
          </div>
        ) : status === "PENDING" ? (
          <div className="bg-emerald-50 p-4 rounded-lg text-center font-bold text-emerald-600 border border-emerald-100">
            PHIÊN ĐẤU GIÁ CHƯA BẮT ĐẦU
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
                  +{formatNumber(val)}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Số tiền của bạn (VNĐ)
              </label>
              <Input
                type="text"
                value={displayAmount}
                onChange={handleInputChange}
                className="text-lg font-bold"
                // min={minNextBid}
              />
              <p className="text-[10px] text-muted-foreground italic">
                * Phải trả ít nhất{" "}
                <span className="font-bold">{formatNumber(minNextBid)}đ</span>
              </p>
            </div>

            <Button
              className="w-full h-12 text-lg font-bold"
              disabled={bidAmount < minNextBid || timeLeft.isEnded}
              onClick={() => placeBid(bidAmount)}
            >
              {timeLeft.isEnded ? "PHIÊN ĐÃ ĐÓNG" : "ĐẶT GIÁ NGAY"}
            </Button>
          </div>
        )}
      </CardContent>

      <div className="border-t p-6 bg-slate-50/50">
        <BidHistory bids={bidHistory} />
      </div>
    </Card>
  );
}
