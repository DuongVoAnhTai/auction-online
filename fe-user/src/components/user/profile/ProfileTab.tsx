"use client";

import { SecurityTab } from "@/components/user/profile/SecurityTab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gavel, Package, ShieldCheck, User } from "lucide-react";
import { AccountTab } from "@/components/user/profile/AccountTab";
import { BidsTab } from "@/components/user/profile/BidsTab";
import { MyAuctionsTab } from "@/components/user/profile/MyAuctionsTab";
import { useAuth } from "@/context/AuthContext";

export default function ProfileTab() {
  const { user } = useAuth();

  if (!user)
    return <div className="p-20 text-center">Vui lòng đăng nhập...</div>;

  return (
    <Tabs
      defaultValue="account"
      orientation="vertical"
      className="flex flex-col md:flex-row gap-8"
    >
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
        {user.role === "SELLER" && (
          <TabsTrigger
            value="auctions"
            className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Package className="h-4 w-4" /> Sản phẩm đã đăng
          </TabsTrigger>
        )}
      </TabsList>

      {/* Nội dung chi tiết */}
      <div className="flex-1">
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Hồ sơ cá nhân</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bids">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử tham gia đấu giá</CardTitle>
            </CardHeader>
            <CardContent>
              <BidsTab />
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

        <TabsContent value="auctions" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <MyAuctionsTab />
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
}
