import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Mail,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function SellerInfo({ seller }: { seller: any }) {
  const joinDate = format(new Date(seller.createdAt), "MMMM 'năm' yyyy", {
    locale: vi,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/10">
            <AvatarImage src={seller.avatarUrl} alt={seller.fullName} />
            <AvatarFallback className="text-xl">
              {seller.fullName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{seller.fullName}</h3>
              <Badge className="bg-emerald-500 hover:bg-emerald-600">
                <ShieldCheck className="w-3 h-3 mr-1" /> Người bán xác thực
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Mail className="w-3 h-3" /> {seller.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 border rounded-lg bg-slate-50/50">
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Thành viên từ
          </p>
          <p className="text-sm font-medium flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4 text-primary" /> {joinDate}
          </p>
        </div>
        <div className="p-3 border rounded-lg bg-slate-50/50">
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Địa điểm
          </p>
          <p className="text-sm font-medium flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4 text-primary" /> TP. Hồ Chí Minh
          </p>
        </div>
      </div>

      <Button asChild className="w-full" variant="outline">
        <Link href={`/seller/${seller.id}`}>
          Xem gian hàng của người bán <ExternalLink className="ml-2 w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}
