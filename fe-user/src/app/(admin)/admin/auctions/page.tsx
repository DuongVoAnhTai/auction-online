import { getPendingAuctions } from "@/services/auctionServices";
import { AuctionApprovalTable } from "@/components/admin/AuctionApprovalTable";
import { cookies } from "next/headers";

export const metadata = {
  title: "Phê duyệt đấu giá - Admin",
};

export default async function AdminAuctionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const response = await fetch(
    "http://localhost:8080/api/v1/auctions/admin/pending",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    console.error("Lỗi gọi API Admin:", response.status);
    return (
      <div className="p-10 text-center text-red-500">
        Không thể tải dữ liệu. Bạn có phải Admin không?
      </div>
    );
  }

  const result = await response.json();
  const initialData = result.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Phê duyệt đấu giá</h1>
        <div className="text-sm text-muted-foreground">
          Tổng cộng: <b>{initialData.length}</b> phiên đang chờ
        </div>
      </div>

      <AuctionApprovalTable initialAuctions={initialData} />
    </div>
  );
}
