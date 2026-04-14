import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

export const useAuctionSocket = (auctionId: string, initialPrice: number) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(initialPrice);
  const [bidHistory, setBidHistory] = useState<any[]>([]);

  useEffect(() => {
    // 1. Khởi tạo socket
    const socket = io("http://localhost:8080/auctions", {
      withCredentials: true,
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
      (data: { newPrice: number; bidderName: string; newBid: any }) => {
        setCurrentPrice(data.newPrice);
        setBidHistory((prev) => [data.newBid, ...prev].slice(0, 10)); // Thêm vào lịch sử

        // Thông báo cho người dùng khác (trừ người vừa đặt)
        toast.info(
          `${data.bidderName} vừa trả giá ${data.newPrice.toLocaleString()}đ`,
        );
      },
    );

    // 4. Lắng nghe lỗi từ Server (Vd: đặt giá thấp hơn giá hiện tại)
    socket.on("exception", (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra khi đặt giá");
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

  return { isConnected, currentPrice, bidHistory, placeBid, setBidHistory };
};
