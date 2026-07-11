"use client";

import { useClerk } from "@clerk/nextjs";

export function ProfileButton() {
  const { openUserProfile } = useClerk();

  return (
    <button
      onClick={() => openUserProfile()}
      className="text-xs tracking-widest uppercase border border-black/20 text-[#111111] px-4 py-2 hover:bg-[#111111] hover:text-white transition-colors"
    >
      Manage Profile
    </button>
  );
}
