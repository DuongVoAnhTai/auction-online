import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Đăng nhập - Hệ thống đấu giá" };

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <LoginForm />
    </div>
  );
}
