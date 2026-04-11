"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SortSelect({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    // 1. Lấy toàn bộ params hiện tại trên URL
    const params = new URLSearchParams(searchParams.toString());

    // 2. Cập nhật hoặc xóa param 'sort'
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }

    // 3. Đẩy URL mới lên thanh địa chỉ
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select defaultValue={defaultValue} onValueChange={handleSortChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sắp xếp" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Mới nhất</SelectItem>
        <SelectItem value="ending_soon">Sắp kết thúc</SelectItem>
        <SelectItem value="price_asc">Giá thấp đến cao</SelectItem>
        <SelectItem value="price_desc">Giá cao đến thấp</SelectItem>
      </SelectContent>
    </Select>
  );
}
