import { getAuctionDetail } from "@/services/auctionServices";
import { BidHistory } from "@/components/auction/BidHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { BiddingPanel } from "@/components/auction/BiddingPanel";
import Link from "next/link";

export const metadata = { title: "Chi tiết sản phẩm - Hệ thống đấu giá" };

export default async function AuctionDetailPage({ params }: any) {
  const { id } = await params;
  const auction = await getAuctionDetail(id);

  if (!auction)
    return (
      <div className="text-center py-20">Không tìm thấy phiên đấu giá</div>
    );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CỘT TRÁI: 7/12 - Thông tin sản phẩm */}
        <div className="lg:col-span-7 space-y-6">
          {/* Gallery ảnh đơn giản */}
          <div className="aspect-video rounded-xl overflow-hidden border bg-slate-100">
            <img
              src={auction.product.images[0]}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {auction.product.images.slice(1).map((img: string, i: number) => (
              <div
                key={i}
                className="aspect-square rounded-lg overflow-hidden border"
              >
                <img src={img} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <Tabs defaultValue="desc" className="w-full">
            <TabsList>
              <TabsTrigger value="desc">Mô tả sản phẩm</TabsTrigger>
              <TabsTrigger value="seller">Thông tin người bán</TabsTrigger>
            </TabsList>
            <TabsContent value="desc" className="p-4 border rounded-lg mt-2">
              <p className="whitespace-pre-wrap leading-relaxed">
                {auction.product.description}
              </p>
            </TabsContent>
            <TabsContent value="seller" className="p-4 border rounded-lg mt-2">
              <Link
                href={`/seller/${auction.product.seller.id}`}
                className="flex items-center gap-4 p-2 rounded-md hover:bg-slate-50 transition-colors group"
              >
                <Avatar className="h-12 w-12 border">
                  <AvatarImage src={auction.product.seller.avatarUrl} />
                  {/* <AvatarFallback>
                    {auction.product.seller.fullName.substring(0, 2)}
                  </AvatarFallback> */}
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold">{auction.product.seller.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {auction.product.seller.email}
                  </p>
                </div>
              </Link>
            </TabsContent>
          </Tabs>
        </div>

        {/* CỘT PHẢI: 5/12 - Khu vực đấu giá */}
        <div className="lg:col-span-5 space-y-6">
          {/* BiddingPanel sẽ chứa đồng hồ, giá hiện tại và form đặt giá */}
          <BiddingPanel auction={auction} />

          <div className="border rounded-xl p-6 bg-slate-50/50">
            <BidHistory bids={auction.bids} />
          </div>
        </div>
      </div>
    </div>
  );
}
