import { UserTable } from "@/components/admin/UserTable";
import { cookies } from "next/headers";

export default async function AdminUsersPage(props: any) {
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const res = await fetch(
    `http://localhost:8080/api/v1/users/admin/all?search=${searchParams.search || ""}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  const result = await res.json();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
      <UserTable initialData={result.data} />
    </div>
  );
}
