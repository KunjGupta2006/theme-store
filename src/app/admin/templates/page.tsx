import { db } from "@/lib/db";
import Image from "next/image";
import { createTemplateDesign, deleteTemplateDesign } from "@/features/admin/actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Templates — Admin" };

export default async function AdminTemplatesPage() {
  const templates = await db.templateDesign.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Inter_Tight'] text-3xl font-bold text-[#111111]">Templates</h1>
        <p className="text-sm text-[#666666] mt-1">
          {templates.length} design {templates.length === 1 ? "template" : "templates"} available in the customize canvas
        </p>
      </div>

      <form action={createTemplateDesign} className="bg-[#FAF7F2] border border-black/6 rounded p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-1.5 md:col-span-1">
          <label className="text-xs text-[#666666] tracking-widest uppercase">Name</label>
          <input
            name="name"
            required
            placeholder="Sunset Wave"
            className="w-full bg-white border border-black/8 px-4 py-3 text-sm rounded"
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs text-[#666666] tracking-widest uppercase">Image URL</label>
          <input
            name="imageUrl"
            type="url"
            required
            placeholder="https://res.cloudinary.com/.../design.png"
            className="w-full bg-white border border-black/8 px-4 py-3 text-sm rounded"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-[#666666] tracking-widest uppercase">Category</label>
          <input
            name="category"
            placeholder="Abstract"
            className="w-full bg-white border border-black/8 px-4 py-3 text-sm rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-[#111111] text-white text-xs tracking-widest uppercase px-6 py-3 hover:opacity-80 transition-opacity md:col-span-4 md:w-fit"
        >
          + Add Template
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {templates.length === 0 ? (
          <p className="text-sm text-[#666666] col-span-full text-center py-12">No templates yet. Add one above.</p>
        ) : (
          templates.map((t) => {
            const remove = deleteTemplateDesign.bind(null, t.id);
            return (
              <div key={t.id} className="bg-[#FAF7F2] border border-black/6 rounded overflow-hidden">
                <div className="relative aspect-square bg-white">
                  <Image src={t.imageUrl} alt={t.name} fill className="object-contain p-2" unoptimized />
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-xs font-medium text-[#111111] truncate">{t.name}</p>
                  <p className="text-[10px] text-[#666666] uppercase tracking-widest">{t.category}</p>
                  <form action={remove}>
                    <button type="submit" className="text-[11px] text-red-500 hover:text-red-700 transition-colors">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
