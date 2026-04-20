"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatNumber } from "@/utils/format";
import * as userServices from "@/services/userServices";

export function BidsTab() {
  const [myBids, setMyBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBids = async () => {
      const profile = await userServices.getProfile();
      if (profile && profile.bids) {
        // Lọc để mỗi phiên chỉ hiện 1 dòng (lượt bid cao nhất của bạn)
        const uniqueBids = Array.from(
          new Map(
            profile.bids.map((item: any) => [item.auctionId, item]),
          ).values(),
        );
        setMyBids(uniqueBids);
      }
      setLoading(false);
    };
    loadBids();
  }, []);

  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="text-left p-4 font-semibold">Sản phẩm</th>
            <th className="text-left p-4 font-semibold">Giá hiện tại</th>
            <th className="text-left p-4 font-semibold">Trạng thái</th>
            <th className="text-right p-4 font-semibold">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {myBids.map((bid) => (
            <tr key={bid.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={bid.auction.product.images[0]}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <p className="font-medium line-clamp-1">
                    {bid.auction.product.name}
                  </p>
                </div>
              </td>
              <td className="p-4 font-bold text-primary">
                {formatNumber(bid.auction.currentPrice)}đ
              </td>
              <td className="p-4">
                {/* LOGIC QUAN TRỌNG: Hiện trạng thái Dẫn đầu / Bị vượt */}
                {bid.auction.currentWinnerId === bid.bidderId ? (
                  <Badge className="bg-emerald-500">Đang dẫn đầu</Badge>
                ) : (
                  <Badge variant="destructive">Bị vượt giá</Badge>
                )}
              </td>
              <td className="p-4 text-right">
                <Link
                  href={`/auctions/${bid.auctionId}`}
                  className="text-primary hover:underline font-medium"
                >
                  Chi tiết
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
