"use client";

interface RoleToggleFormProps {
  action: (formData: FormData) => void;
  userName: string;
  nextRole: "ADMIN" | "USER";
}

export function RoleToggleForm({ action, userName, nextRole }: RoleToggleFormProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Change ${userName}'s role to ${nextRole}?`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="role" value={nextRole} />
      <button
        type="submit"
        className="text-xs text-[#666666] hover:text-[#111111] underline transition-colors"
      >
        Make {nextRole === "ADMIN" ? "Admin" : "User"}
      </button>
    </form>
  );
}
