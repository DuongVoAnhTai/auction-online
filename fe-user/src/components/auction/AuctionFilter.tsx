"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "../ui/button";

export function AuctionFilter({
  categories,
  currentStatus,
}: {
  categories: any[];
  currentStatus: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lấy giá trị hiện tại từ URL hoặc mặc định
  const currentCategory = searchParams.get("categoryId") || "";
  const currentMinPrice = Number(searchParams.get("minPrice")) || 0;
  const currentMaxPrice = Number(searchParams.get("maxPrice")) || 100000000;

  const [priceRange, setPriceRange] = useState([
    currentMinPrice,
    currentMaxPrice,
  ]); // 0 - 100 triệu

  // Hàm cập nhật URL khi có thay đổi
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // LUÔN LUÔN giữ lại trạng thái hiện tại (ACTIVE/PENDING)
    params.set("status", currentStatus);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePriceChange = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("minPrice", priceRange[0].toString());
    params.set("maxPrice", priceRange[1].toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-4">Danh mục</h3>
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <Checkbox
                id={cat.id}
                checked={currentCategory === cat.id}
                onCheckedChange={(checked) =>
                  updateFilters("categoryId", checked ? cat.id : "")
                }
              />
              <Label
                htmlFor={cat.id}
                className="text-sm font-medium leading-none cursor-pointer"
              >
                {cat.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <h3 className="text-lg font-bold mb-4">Khoảng giá (VNĐ)</h3>
        <Slider
          max={10000000}
          step={100000}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mb-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{priceRange[0].toLocaleString()}đ</span>
          <span>{priceRange[1].toLocaleString()}đ</span>
        </div>
        <Button className="w-full h-8" onClick={handlePriceChange}>
          Áp dụng giá
        </Button>
      </div>

      <Button
        variant="outline"
        className="w-full h-8 text-xs"
        onClick={() => router.push(pathname)} // Xóa hết filter
      >
        Xóa bộ lọc
      </Button>
    </div>
  );
}
