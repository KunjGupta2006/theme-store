import { redirect } from "next/navigation";

// Template products are now just regular Products with isCustomizable: false —
// managed from /admin/products. This route is kept only so old links/bookmarks
// don't 404; it forwards straight to the real page.
export default function TemplatesPage() {
  redirect("/admin/products");
}