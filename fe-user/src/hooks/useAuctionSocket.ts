import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import Cookies from "js-cookie";

export const useAuctionSocket = (
  auctionId: string,
  initialPrice: number,
  initialEndTime: string,
  initialBids: any[] = [],
  initialStatus: string,
) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(initialPrice);
  const [bidHistory, setBidHistory] = useState<any[]>(initialBids);
  const [endTime, setEndTime] = useState<string>(initialEndTime);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const token = Cookies.get("access_token");

    // 1. Khởi tạo socket
    const socket = io("http://localhost:8080/auctions", {
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    socketRef.current = socket;

    // 2. Các sự kiện cơ bản
    socket.on("connect", () => {
      console.log("✅ Đã kết nối tới WebSocket Server. ID:", socket.id);
      setIsConnected(true);
      socket.emit("joinAuction", auctionId);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // 3. Lắng nghe cập nhật giá mới (Chúng ta sẽ làm sự kiện này ở bước sau)
    socket.on(
      "bidUpdated",
      (data: { newPrice: number; newBid: any; newEndTime?: string }) => {
        setCurrentPrice(data.newPrice);
        setBidHistory((prev) => [data.newBid, ...prev].slice(0, 10));

        // CẬP NHẬT THỜI GIAN MỚI NẾU CÓ
        if (
          data.newEndTime &&
          new Date(data.newEndTime).getTime() !== new Date(endTime).getTime()
        ) {
          setEndTime(data.newEndTime);
          toast.warning("Thời gian đấu giá đã được gia hạn thêm!");
        }
      },
    );

    // 4. Lắng nghe lỗi từ Server (Vd: đặt giá thấp hơn giá hiện tại)
    socket.on("exception", (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra khi đặt giá");
    });

    // Phiên đấu giá bắt đầu
    socket.on("auctionStarted", (data: { status: string }) => {
      setStatus("ACTIVE");
      toast.success("Phiên đấu giá đã bắt đầu!", {
        description: "Bây giờ bạn có thể tham gia đặt giá.",
      });
    });

    // Phiên đấu giá kết thúc
    socket.on("auctionFinished", (data) => {
      setStatus("COMPLETED");
      toast.success("Phiên đấu giá đã kết thúc!", {
        id: `auction-${data.auctionId}`,
        description: data.winnerId
          ? "Đã tìm thấy người thắng cuộc."
          : "Không có người tham gia trả giá.",
      });
    });

    // 5. Cleanup khi unmount
    return () => {
      socket.emit("leaveAuction", auctionId);
      socket.disconnect();
    };
  }, [auctionId]);

  // Hàm để gửi lượt đặt giá
  const placeBid = (amount: number) => {
    if (socketRef.current) {
      socketRef.current.emit("placeBid", { auctionId, amount });
    }
  };

  return {
    isConnected,
    endTime,
    currentPrice,
    bidHistory,
    placeBid,
    status,
  };
};
