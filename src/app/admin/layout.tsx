import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { UserButton } from "@clerk/nextjs";

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
      <main className="flex-1 ml-56 min-h-screen">
        <div className="sticky top-0 z-40 bg-[#F5F1EA]/80 backdrop-blur-md border-b border-black/6 px-8 py-4 flex items-center justify-between">
          <AdminSearch />
          <div className="flex items-center gap-4">
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10 border border-black/10 shadow-sm"
                }
              }}
            />
          </div>
        </div>
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}