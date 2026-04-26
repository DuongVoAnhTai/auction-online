"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gavel, DollarSign, Clock } from "lucide-react";
import { formatNumber } from "@/utils/format";
import { DashboardChart } from "./DashboardChart";

export function DashboardOverview({ stats }: { stats: any }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Người dùng"
          value={stats?.summary?.totalUsers ?? 0}
          icon={<Users />}
        />
        <StatsCard
          title="Đang đấu giá"
          value={stats?.summary?.activeAuctions ?? 0}
          icon={<Gavel />}
        />
        <StatsCard
          title="Chờ duyệt"
          value={stats?.summary?.pendingAuctions ?? 0}
          icon={<Clock />}
          color="text-orange-600"
        />
        <StatsCard
          title="Doanh thu"
          value={formatNumber(stats?.summary?.totalRevenue ?? 0) + "đ"}
          icon={<DollarSign />}
          color="text-emerald-600"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Biểu đồ (Chiếm 4 cột) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              Doanh thu 7 ngày gần nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardChart data={stats?.chartData || []} />
          </CardContent>
        </Card>

        {/* Hoạt động gần đây (Chiếm 3 cột) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Lượt trả giá mới nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentBids && stats.recentBids.length > 0 ? (
                stats.recentBids.map((bid: any) => (
                  <div key={bid.id} className="flex items-center gap-3 text-sm">
                    <span className="font-bold">
                      {bid.bidder?.fullName || "N/A"}
                    </span>
                    <span className="text-muted-foreground">đã trả</span>
                    <span className="text-primary font-bold">
                      {formatNumber(bid.amount)}đ
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  Chưa có lượt trả giá nào.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, color = "text-primary" }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={color}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
