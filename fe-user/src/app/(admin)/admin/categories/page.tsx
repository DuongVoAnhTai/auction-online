import { CategoryTable } from "@/components/admin/CategoryTable";
import { getCategories } from "@/services/auctionServices";

export default async function AdminCategoriesPage() {
  const categories = await getCategories(); // Dùng lại hàm lấy danh mục có sẵn của bạn

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
      </div>
      <CategoryTable initialData={categories} />
    </div>
  );
}
