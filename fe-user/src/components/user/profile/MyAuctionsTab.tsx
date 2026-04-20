"use client";

import { useEffect, useState } from "react";
import { getMyAuctions } from "@/services/auctionServices";
import { formatNumber } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, ExternalLink, MoreVertical } from "lucide-react";
import Link from "next/link";

export function MyAuctionsTab() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyAuctions = async () => {
      const data = await getMyAuctions();
      setAuctions(data);
      setLoading(false);
    };
    fetchMyAuctions();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-blue-500">Đang đấu giá</Badge>;
      case "PENDING":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            Chờ duyệt
          </Badge>
        );
      case "COMPLETED":
        return <Badge className="bg-emerald-500">Đã kết thúc</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6">
      {/* Header của Tab */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">
          Danh sách sản phẩm ({auctions.length})
        </h3>
        <Button asChild size="sm">
          <Link href="/auction/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Đăng sản phẩm mới
          </Link>
        </Button>
      </div>

      {auctions.length > 0 ? (
        <div className="border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold">Sản phẩm</th>
                <th className="text-left p-4 font-semibold">Danh mục</th>
                <th className="text-left p-4 font-semibold">Giá hiện tại</th>
                <th className="text-left p-4 font-semibold">Trạng thái</th>
                <th className="text-right p-4 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {auctions.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        className="w-12 h-12 rounded-lg object-cover border"
                        alt=""
                      />
                      <div className="flex flex-col">
                        <span className="font-medium line-clamp-1">
                          {item.product.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground italic">
                          Kết thúc:{" "}
                          {new Date(item.endTime).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {item.product.category.name}
                  </td>
                  <td className="p-4 font-bold text-primary">
                    {formatNumber(item.currentPrice)}đ
                  </td>
                  <td className="p-4">{getStatusBadge(item.status)}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="Xem chi tiết"
                      >
                        <Link href={`/auctions/${item.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" title="Thêm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-xl space-y-4">
          <p className="text-muted-foreground">
            Bạn chưa có sản phẩm nào được đăng bán.
          </p>
          <Button asChild variant="outline">
            <Link href="/auction/create">Đăng ngay món đồ đầu tiên</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
