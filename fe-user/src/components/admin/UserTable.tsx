"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import * as userServices from "@/services/userServices";

export function UserTable({ initialData }: { initialData: any[] }) {
  const [users, setUsers] = useState(initialData);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await userServices.updateUserRole(userId, newRole);
    if (!res.error) {
      toast.success("Đã cập nhật quyền hạn thành công");
      setUsers(
        users.map((u: any) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } else {
      toast.error("Không thể đổi quyền");
    }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b text-slate-500">
          <tr>
            <th className="text-left p-4">Thành viên</th>
            <th className="text-left p-4">Ngày tham gia</th>
            <th className="text-left p-4">Quyền hạn</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user: any) => (
            <tr
              key={user.id}
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="p-4 flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>
                    {user.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </td>
              <td className="p-4 text-muted-foreground">
                {format(new Date(user.createdAt), "dd/MM/yyyy")}
              </td>
              <td className="p-4">
                {/* Không cho phép tự đổi Role của chính mình hoặc các Admin khác để bảo mật */}
                {user.role === "ADMIN" ? (
                  <Badge variant="destructive">ADMINISTRATOR</Badge>
                ) : (
                  <Select
                    defaultValue={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BIDDER">Người mua</SelectItem>
                      <SelectItem value="SELLER">Người bán</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
