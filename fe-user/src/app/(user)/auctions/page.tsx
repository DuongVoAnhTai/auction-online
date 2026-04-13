import { getAuctions, getCategories } from "@/services/auctionServices";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { AuctionFilter } from "@/components/auction/AuctionFilter";
import { SortSelect } from "@/components/auction/SortSelect";

export const metadata = { title: "Danh sách sản phẩm - Hệ thống đấu giá" };

export default async function AuctionsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>; // Định nghĩa kiểu Promise
  forcedStatus?: string;
}) {
  const searchParams = await props.searchParams;
  const forcedStatus = props.forcedStatus;

  const status = forcedStatus || (searchParams.status as string) || "ACTIVE";
  const sort = (searchParams.sort as string) || "newest";
  const filters = {
    status: status,
    sort: sort,
    categoryId: searchParams.categoryId,
    minPrice: searchParams.minPrice,
    maxPrice: searchParams.maxPrice,
  };

  const [auctions, categories] = await Promise.all([
    getAuctions(filters),
    getCategories(),
  ]);

  return (
    <div className="flex flex-col md:flex-row gap-8 py-8">
      {/* Sidebar bên trái - Ẩn trên mobile hoặc dùng Sheet */}
      <aside className="hidden md:block w-64 shrink-0">
        <AuctionFilter categories={categories} currentStatus={status} />
      </aside>

      {/* Danh sách bên phải */}
      <div className="flex-1 space-y-6">
        {/* Header của danh sách */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {status === "ACTIVE"
                ? "Phiên đấu giá đang diễn ra"
                : "Phiên đấu giá sắp tới"}
            </h1>
            <p className="text-muted-foreground text-sm">
              Tìm thấy {auctions.length} sản phẩm
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Sắp xếp theo:
            </span>
            <SortSelect defaultValue={sort} />
          </div>
        </div>

        {/* Grid sản phẩm */}
        {auctions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction: any) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground">
              Không tìm thấy sản phẩm nào khớp với bộ lọc.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
