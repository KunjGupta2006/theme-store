"use client";

interface DeleteProductButtonProps {
  action: (formData: FormData) => void;
  productName: string;
}

export function DeleteProductButton({ action, productName }: DeleteProductButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete "${productName}"? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-xs text-red-500 hover:text-red-700 transition-colors">
        Delete
      </button>
    </form>
  );
}
