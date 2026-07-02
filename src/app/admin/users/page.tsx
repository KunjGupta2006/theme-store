import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Users — Admin" };

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Inter_Tight'] text-3xl font-bold text-[#111111]">
          Users
        </h1>
        <p className="text-sm text-[#666666] mt-1">
          {users.length} {users.length === 1 ? "user" : "users"} registered
        </p>
      </div>

      <div className="bg-[#FAF7F2] border border-black/6 rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/6">
              {["User", "Role", "Orders", "Joined"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] text-[#666666] tracking-widest uppercase px-6 py-4 font-normal"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-sm text-[#666666] py-12">
                  No users yet.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-black/4 hover:bg-[#EEE7DD]/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.imageUrl}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#EEE7DD] flex items-center justify-center text-xs font-medium text-[#666666]">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-[#111111]">
                          {user.name}
                        </p>
                        <p className="text-xs text-[#666666]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                        user.role === "ADMIN"
                          ? "bg-[#111111] text-white"
                          : "bg-[#EEE7DD] text-[#666666]"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#666666]">
                    {user._count.orders}
                  </td>
                  <td className="px-6 py-4 text-xs text-[#666666]">
                    {user.createdAt.toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}