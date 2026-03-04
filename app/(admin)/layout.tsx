import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/actions/auth.actions";
import { AdminSidebar } from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/");

  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={user} />
      <main className="ml-56 flex-1 p-8">{children}</main>
    </div>
  );
}
