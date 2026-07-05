// src/lib/toast.ts
// Re-export sonner with preset styles matching design system

export { toast } from "sonner";

// Usage:
// import { toast } from "@/lib/toast";
// toast.success("Product created");
// toast.error("Something went wrong");
// toast.loading("Uploading...");
// toast.promise(myPromise, { loading: "...", success: "Done", error: "Failed" });