import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId: clerkId } = await auth();

  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") redirect("/");

  return (
    <div className="flex min-h-screen bg-[#F5F1EA]">
      <AdminSidebar />
      <main className="flex-1 ml-56 p-8">{children}</main>
    </div>
  );
}