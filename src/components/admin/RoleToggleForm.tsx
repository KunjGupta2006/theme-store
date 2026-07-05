"use client";

import { useTransition } from "react";
import { toast } from "@/lib/toast";

interface RoleToggleFormProps {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  userName: string;
  nextRole: "ADMIN" | "USER";
}

export function RoleToggleForm({ action, userName, nextRole }: RoleToggleFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Change ${userName}'s role to ${nextRole}?`)) return;
    const formData = new FormData();
    formData.set("role", nextRole);
    startTransition(async () => {
      try {
        const result = await action(formData);
        if (result?.error) toast.error(result.error);
        else toast.success(`${userName} is now ${nextRole === "ADMIN" ? "an admin" : "a user"}`);
      } catch {
        toast.error("Failed to update role");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs text-[#666666] hover:text-[#111111] underline transition-colors disabled:opacity-50"
    >
      {isPending ? "Updating…" : `Make ${nextRole === "ADMIN" ? "Admin" : "User"}`}
    </button>
  );
}