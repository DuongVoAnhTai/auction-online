import { getSellerPublicProfile } from "@/services/userServices";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Package, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { notFound } from "next/navigation";

export const metadata = { title: "Thông tin người bán - Hệ thống đấu giá" };

export default async function SellerProfilePage({ params }: any) {
  const { id } = await params;
  const data = await getSellerPublicProfile(id);

  if (!data) return notFound();

  const { seller, auctions } = data;
  const joinDate = format(new Date(seller.createdAt), "MMMM 'năm' yyyy", {
    locale: vi,
  });

  // Phân loại sản phẩm để hiển thị trong Tabs
  const activeAuctions = auctions.filter((a: any) => a.status === "ACTIVE");
  const completedAuctions = auctions.filter(
    (a: any) => a.status === "COMPLETED",
  );

  return (
    <div className="container mx-auto py-10 px-4 space-y-10">
      {/* 1. Header Hồ sơ người bán */}
      <Card className="border-none shadow-none bg-slate-50/50 p-8 rounded-3xl">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
            <AvatarImage src={seller.avatarUrl} />
            <AvatarFallback className="text-3xl">
              {seller.fullName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="text-center md:text-left space-y-4">
            <div>
              <h1 className="text-3xl font-extrabold flex items-center justify-center md:justify-start gap-2">
                {seller.fullName}
                <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-50" />
              </h1>
              <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mt-1">
                <Calendar className="w-4 h-4" /> Tham gia từ {joinDate}
              </p>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold">{seller._count.products}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Sản phẩm
                </p>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="text-center">
                <p className="text-2xl font-bold">{completedAuctions.length}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Đã đấu giá xong
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Danh sách sản phẩm của người bán */}
      <div className="space-y-6">
        <Tabs defaultValue="live" className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-4">
            <h2 className="text-2xl font-bold">Gian hàng đấu giá</h2>
            <TabsList className="bg-slate-100">
              <TabsTrigger value="live">
                Đang diễn ra ({activeAuctions.length})
              </TabsTrigger>
              <TabsTrigger value="ended">
                Đã kết thúc ({completedAuctions.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="live" className="pt-6">
            {activeAuctions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {activeAuctions.map((auction: any) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-muted-foreground bg-slate-50 rounded-2xl border-2 border-dashed">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                Hiện không có sản phẩm nào đang đấu giá.
              </div>
            )}
          </TabsContent>

          <TabsContent value="ended" className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {completedAuctions.map((auction: any) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
