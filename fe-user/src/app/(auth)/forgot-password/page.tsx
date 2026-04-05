import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "Quên mật khẩu - Hệ thống đấu giá" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <ForgotPasswordForm />
    </div>
  );
}
