"use client";

import { useState } from "react";
import { reviewAuction } from "@/services/auctionServices";
import { formatNumber } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function AuctionApprovalTable({
  initialAuctions,
}: {
  initialAuctions: any[];
}) {
  const [auctions, setAuctions] = useState(initialAuctions);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const handleApprove = async (id: string) => {
    const res = await reviewAuction(id, "approve");
    if (!res.error) {
      toast.success("Đã phê duyệt sản phẩm thành công");
      setAuctions((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return toast.error("Vui lòng nhập lý do");
    const res = await reviewAuction(selectedId!, "reject", rejectReason);
    if (!res.error) {
      toast.success("Đã từ chối sản phẩm");
      setIsRejectDialogOpen(false);
      setRejectReason("");
      setAuctions((prev) => prev.filter((a) => a.id !== selectedId));
    }
  };

  if (auctions.length === 0) {
    return (
      <div className="p-20 text-center border-2 border-dashed rounded-xl text-muted-foreground bg-white">
        Hiện không có sản phẩm nào cần duyệt 🎉
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="text-left p-4">Sản phẩm</th>
            <th className="text-left p-4">Người bán</th>
            <th className="text-left p-4">Giá sàn</th>
            <th className="text-right p-4">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {auctions.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="p-4 flex items-center gap-3">
                <img
                  src={item.product.images[0]}
                  className="w-10 h-10 rounded object-cover border"
                  alt=""
                />
                <span className="font-medium line-clamp-1">
                  {item.product.name}
                </span>
              </td>
              <td className="p-4 text-muted-foreground">
                {item.product.seller.fullName}
              </td>
              <td className="p-4 font-bold text-primary">
                {formatNumber(item.startingPrice)}đ
              </td>
              <td className="p-4 text-right space-x-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleApprove(item.id)}
                >
                  <Check className="w-4 h-4 mr-1" /> Duyệt
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setSelectedId(item.id);
                    setIsRejectDialogOpen(true);
                  }}
                >
                  <X className="w-4 h-4 mr-1" /> Từ chối
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lý do từ chối sản phẩm</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Nêu rõ lý do để người bán chỉnh sửa..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Gửi thông báo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
