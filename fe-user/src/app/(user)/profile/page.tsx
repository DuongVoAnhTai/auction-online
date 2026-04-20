import { SecurityTab } from "@/components/profile/SecurityTab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gavel, ShieldCheck, User } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Cài đặt tài khoản</h1>

      <Tabs defaultValue="account" className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <TabsList className="flex flex-col h-auto bg-transparent space-y-2 w-full md:w-64">
          <TabsTrigger
            value="account"
            className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-primary/10"
          >
            <User className="h-4 w-4" /> Thông tin cá nhân
          </TabsTrigger>
          <TabsTrigger
            value="bids"
            className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-primary/10"
          >
            <Gavel className="h-4 w-4" /> Đấu giá của tôi
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-primary/10"
          >
            <ShieldCheck className="h-4 w-4" /> Bảo mật & 2FA
          </TabsTrigger>
          {/* Hiện thêm tab My Auctions nếu là Seller */}
        </TabsList>

        {/* Nội dung chi tiết */}
        <div className="flex-1">
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Hồ sơ cá nhân</CardTitle>
              </CardHeader>
              <CardContent>{/* Form cập nhật tên, avatar... */}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bids">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử tham gia đấu giá</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Bảng danh sách hoặc Grid sản phẩm đang bid */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Cấu hình bảo mật</CardTitle>
              </CardHeader>
              <CardContent>
                <SecurityTab />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
