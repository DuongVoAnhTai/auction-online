import SignUpForm from "@/components/auth/SignUpForm";

export const metadata = {
  title: "Đăng ký - Hệ thống đấu giá",
};

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <SignUpForm />
    </div>
  );
}
