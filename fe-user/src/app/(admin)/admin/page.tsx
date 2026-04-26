import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { cookies } from "next/headers";

export const metadata = {
  title: "Bảng điều khiển - Admin",
};

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const res = await fetch("http://localhost:8080/api/v1/admin/stats", {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error(`Failed to fetch stats: ${res.status} ${res.statusText}`);
    return (
      <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-md">
        Không thể tải dữ liệu thống kê. Vui lòng kiểm tra lại kết nối server (HTTP {res.status}).
      </div>
    );
  }

  const data = await res.json();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Bảng điều khiển</h1>
        <div className="text-sm text-muted-foreground">
          Phiên đấu giá hôm nay: {data?.recentBids?.length || 0}
        </div>
      </div>

      <DashboardOverview stats={data} />
    </div>
  );
}
