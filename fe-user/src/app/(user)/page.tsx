import { getActiveAuctions } from "@/services/auctionServices";
import { AuctionCard } from "@/components/auction/AuctionCard";

export const metadata = { title: "Trang chủ - Hệ thống đấu giá" };

export default async function HomePage() {
  const auctions = await getActiveAuctions();

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="bg-slate-900 rounded-3xl p-8 md:p-16 text-white text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-extrabold">
          Săn Đồ Độc - Chốt Giá Hời
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Sàn đấu giá trực tuyến thời gian thực minh bạch và an toàn nhất. Tham
          gia ngay để sở hữu những sản phẩm giá trị.
        </p>
      </section>

      {/* Danh sách đấu giá */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            🔥 Đang diễn ra sôi nổi
          </h2>
          <span className="text-sm text-primary hover:underline cursor-pointer">
            Xem tất cả
          </span>
        </div>

        {auctions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {auctions.map((auction: any) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground">
              Hiện chưa có phiên đấu giá nào đang diễn ra.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
