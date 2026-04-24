import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 1. Sidebar nằm cố định bên trái */}
      <AdminSidebar />

      {/* 2. Vùng chứa nội dung chính bên phải */}
      <div className="flex-1 flex flex-col">
        {/* Header riêng cho trang Admin */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div>
            <h2 className="font-bold text-slate-800 tracking-tight">
              Hệ thống quản trị
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">Administrator</p>
              <p className="text-[10px] text-slate-500">Toàn quyền hệ thống</p>
            </div>
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarImage src="https://ui-avatars.com/api/?name=Admin&background=0f172a&color=fff" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Nội dung thay đổi theo từng trang */}
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
