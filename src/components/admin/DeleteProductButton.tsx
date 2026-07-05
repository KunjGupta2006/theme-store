"use client";
import { useTransition } from "react";
import { toast } from "@/lib/toast";

interface DeleteProductButtonProps {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  productName: string;
}

export function DeleteProductButton({ action, productName }: DeleteProductButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        const result = await action(new FormData());
        if (result?.error) toast.error(result.error);
        else toast.success(`"${productName}" deleted`);
      } catch {
        toast.error("Failed to delete product");
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}