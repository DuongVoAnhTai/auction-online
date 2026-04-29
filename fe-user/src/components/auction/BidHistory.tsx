"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { formatNumber, maskName } from "@/utils/format";

export function BidHistory({ bids }: { bids: any[] }) {
  const { user: currentUser } = useAuth();

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Lịch sử trả giá</h3>
      <ScrollArea className="h-[300px] pr-4">
        {bids.length > 0 ? (
          <div className="space-y-4">
            {bids.map((bid, index) => {
              // 4. Kiểm tra xem có phải là chính mình không
              const isMe = bid.bidderId === currentUser?.id;

              return (
                <div
                  key={bid.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isMe
                      ? "bg-primary/5 border-primary/20 ring-1 ring-primary/10" // Làm nổi bật nếu là "Bạn"
                      : "bg-white border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* <Avatar className="h-8 w-8 border">
                      <AvatarImage src={bid.bidder.avatarUrl} />
                      <AvatarFallback className="text-[10px]">
                        {bid.bidder.fullName.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar> */}

                    <div>
                      <p
                        className={`text-sm ${isMe ? "font-bold text-primary" : "font-medium text-slate-700"}`}
                      >
                        {/* 5. Logic hiển thị tên */}
                        {isMe
                          ? `Bạn (${maskName(bid.bidder.fullName)})`
                          : maskName(bid.bidder.fullName)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(bid.createdAt).toLocaleTimeString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-mono font-bold ${isMe ? "text-primary text-base" : "text-slate-900"}`}
                    >
                      {formatNumber(bid.amount)}đ
                    </p>
                    {index === 0 && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                        Dẫn đầu
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-10">
            Chưa có lượt trả giá nào.
          </p>
        )}
      </ScrollArea>
    </div>
  );
}
