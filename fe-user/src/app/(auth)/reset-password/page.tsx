import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Đặt lại mật khẩu - Hệ thống đấu giá" };

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <ResetPasswordForm />
    </div>
  );
}
