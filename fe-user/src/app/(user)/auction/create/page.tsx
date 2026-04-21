import { CreateAuctionForm } from "@/components/auction/CreateAuctionForm";
import { getCategories } from "@/services/auctionServices";

export const metadata = {
  title: "Đăng sản phẩm đấu giá - T-Auction",
};

export default async function CreateAuctionPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Đăng sản phẩm mới</h1>
        <p className="text-muted-foreground mb-8">
          Cung cấp thông tin chi tiết để sản phẩm của bạn được duyệt nhanh nhất.
        </p>

        <CreateAuctionForm categories={categories} />
      </div>
    </div>
  );
}
