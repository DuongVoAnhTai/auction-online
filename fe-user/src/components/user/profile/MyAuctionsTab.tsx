"use client";

import { useEffect, useState } from "react";
import { getMyAuctions } from "@/services/auctionServices";
import { formatNumber } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  ExternalLink,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as auctionServices from "@/services/auctionServices";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  const getStatusBadge = (item: any) => {
    const now = new Date().getTime();
    const start = new Date(item.startTime).getTime();
    const end = new Date(item.endTime).getTime();

    if (item.status === "PENDING")
      return (
        <Badge variant="outline" className="text-amber-500 border-amber-500">
          Chờ duyệt
        </Badge>
      );
    if (item.status === "REJECTED")
      return <Badge variant="destructive">Bị từ chối</Badge>;
    if (item.status === "COMPLETED")
      return <Badge className="bg-emerald-500">Đã kết thúc</Badge>;

    if (now < start)
      return <Badge className="bg-emerald-500">Sắp bắt đầu</Badge>;
    if (now >= start && now < end)
      return <Badge className="bg-blue-500">Đang đấu giá</Badge>;

    return <Badge className="bg-gray-500">Đã kết thúc</Badge>;
  };

  const handleDelete = async (id: string) => {
    const res = await auctionServices.deleteAuction(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Đã xóa bài đăng thành công");
      // Load lại danh sách sau khi xóa
      setAuctions((prev) => prev.filter((item) => item.id !== id));
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
                  <td className="p-4">{getStatusBadge(item)}</td>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/auction/edit/${item.id}`}
                              className="flex items-center cursor-pointer"
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                            </Link>
                          </DropdownMenuItem>

                          {/* Nút xóa chỉ hiện nếu status là PENDING/REJECTED */}
                          {(item.status === "PENDING" ||
                            item.status === "REJECTED") && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Bạn có chắc chắn muốn xóa?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Hành động này không thể hoàn tác. Sản phẩm "
                                    {item.product.name}" sẽ bị xóa vĩnh viễn
                                    khỏi hệ thống.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    Xác nhận xóa
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
