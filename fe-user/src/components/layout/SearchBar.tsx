"use client";

import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { getSearchSuggestions } from "@/services/auctionServices";
import Link from "next/link";

export function SearchBar() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedKeyword = useDebounce(keyword, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedKeyword.trim().length > 1) {
        setIsLoading(true);
        const results = await getSearchSuggestions(debouncedKeyword);

        setSuggestions(results);
        setIsOpen(true);
        setIsLoading(false);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    };
    fetchSuggestions();
  }, [debouncedKeyword]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && keyword.trim()) {
      setIsOpen(false);
      router.push(`/auctions?search=${keyword.trim()}`);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[300px] lg:max-w-sm"
    >
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm sản phẩm..."
          className="pl-8 h-9"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => keyword.length > 1 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {isLoading && (
          <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* DROPDOWN KẾT QUẢ */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-md shadow-lg z-[100] overflow-hidden">
          {suggestions.length > 0 ? (
            <div className="flex flex-col">
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  href={`/auctions/${item.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 border-b last:border-0 transition-colors"
                >
                  <img
                    src={item.product.images[0]}
                    className="w-10 h-10 object-cover rounded"
                    alt=""
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-primary font-bold">
                      {Number(item.currentPrice).toLocaleString()}đ
                    </p>
                  </div>
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push(`/auctions?search=${keyword}`);
                }}
                className="p-2 text-center text-xs text-muted-foreground hover:text-primary font-medium bg-slate-50"
              >
                Xem tất cả kết quả cho "{keyword}"
              </button>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Không tìm thấy sản phẩm nào
            </div>
          )}
        </div>
      )}
    </div>
  );
}
