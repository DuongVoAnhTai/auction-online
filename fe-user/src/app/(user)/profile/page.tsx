import ProfileTab from "@/components/user/profile/ProfileTab";

export const metadata = { title: "Thông tin cá nhân - Hệ thống đấu giá" };

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Cài đặt tài khoản</h1>
      <ProfileTab />
    </div>
  );
}
