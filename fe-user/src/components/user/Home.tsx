import { getAuctions } from "@/services/auctionServices";
import { AuctionCard } from "@/components/auction/AuctionCard";
import Link from "next/link";

export default async function Home() {
  // Lấy 4 cái sắp kết thúc
  const endingSoon = await getAuctions({
    status: "ACTIVE",
    limit: 4,
    sort: "ending_soon",
  });
  // Lấy 4 cái mới nhất
  const latest = await getAuctions({ status: "ACTIVE", limit: 4 });

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

      <section>
        <h2 className="text-2xl font-bold mb-6 flex justify-between">
          🔥 Sắp kết thúc
          <Link
            href="/auctions?sort=ending_soon"
            className="text-sm text-primary"
          >
            Xem tất cả
          </Link>
        </h2>
        <div className="grid grid-cols-4 gap-6">
          {endingSoon.map((item: any) => (
            <AuctionCard key={item.id} auction={item} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 flex justify-between">
          ✨ Đấu giá mới nhất
          <Link href="/auctions" className="text-sm text-primary">
            Xem tất cả
          </Link>
        </h2>
        <div className="grid grid-cols-4 gap-6">
          {latest.map((item: any) => (
            <AuctionCard key={item.id} auction={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
