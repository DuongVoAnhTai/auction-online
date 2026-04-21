import { EditAuctionForm } from "@/components/auction/EditAuctionForm";
import { getAuctionDetail, getCategories } from "@/services/auctionServices";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Chỉnh sửa bài đăng đấu giá - T-Auction",
};

export default async function EditPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  // Lấy đồng thời dữ liệu sản phẩm và danh sách danh mục
  const [auction, categories] = await Promise.all([
    getAuctionDetail(id),
    getCategories(),
  ]);

  if (!auction) return notFound();

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Chỉnh sửa bài đăng</h1>
        <EditAuctionForm auction={auction} categories={categories} />
      </div>
    </div>
  );
}
