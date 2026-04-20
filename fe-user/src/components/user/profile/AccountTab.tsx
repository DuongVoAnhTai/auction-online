"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import * as userServices from "@/services/userServices";

export function AccountTab() {
  const { user, setUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    const res = await userServices.updateProfile({ fullName });
    if (!res.error) {
      if (user) {
        setUser({ ...user, fullName });
      }
      toast.success("Đã cập nhật tên!");
    }
    setIsUpdating(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.promise(userServices.uploadAvatar(file), {
      loading: "Đang tải ảnh lên...",
      success: (res: any) => {
        // Sau khi upload lên Cloudinary, gọi tiếp API update để lưu URL vào DB
        userServices.updateProfile({ avatarUrl: res.url });
        if (user) {
          setUser({ ...user, avatarUrl: res.url });
        }
        return "Cập nhật ảnh đại diện thành công!";
      },
      error: "Lỗi khi upload ảnh",
    });
  };

  return (
    <div className="space-y-6 border rounded-xl p-6">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback className="text-2xl">
              {user?.fullName?.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white">
            <Camera className="h-6 w-6" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        <div>
          <h2 className="text-xl font-bold">{user?.fullName}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="text-xs mt-1 bg-primary/10 text-primary w-fit px-2 py-0.5 rounded-full font-medium">
            Vai trò: {user?.role}
          </p>
        </div>
      </div>

      <div className="grid gap-4 py-4 border-t">
        <div className="grid gap-2">
          <Label htmlFor="name">Họ và tên</Label>
          <Input
            id="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email (Không thể thay đổi)</Label>
          <Input id="email" value={user?.email} disabled />
        </div>
        <Button onClick={handleUpdate} disabled={isUpdating} className="w-fit">
          {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  );
}
