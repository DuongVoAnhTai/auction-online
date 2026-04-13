import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function BidHistory({ bids }: { bids: any[] }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Lịch sử trả giá</h3>
      <ScrollArea className="h-[300px] pr-4">
        {bids.length > 0 ? (
          <div className="space-y-4">
            {bids.map((bid, index) => (
              <div
                key={bid.id}
                className="flex items-center justify-between p-2 rounded-lg bg-secondary/20"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={bid.bidder.avatarUrl} />
                    <AvatarFallback>
                      {bid.bidder.fullName.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{bid.bidder.fullName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(bid.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    {Number(bid.amount).toLocaleString()}đ
                  </p>
                  {index === 0 && (
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">
                      Dẫn đầu
                    </span>
                  )}
                </div>
              </div>
            ))}
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
