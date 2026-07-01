import Image from "next/image";
import Link from "next/link";

type Color = "BLACK" | "WHITE";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  thumbnail: string | null;
  colors: Color[];
}

export function ProductCard({
  name,
  slug,
  basePrice,
  thumbnail,
  colors,
}: ProductCardProps) {
  return (
    <Link href={`/shop/${slug}`} className="group block">
      {/* Image container */}
      <div className="relative overflow-hidden bg-[#EEE7DD] aspect-4/5 mb-4">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw 100vh, (max-width: 1200px) 50vw 60vh, 33vw 40vh"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#666666] text-sm">
            No image
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

        {/* Customize CTA */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-[#111111] text-white text-xs tracking-[0.15em] uppercase text-center py-3 px-4">
            Customize
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-[#111111] leading-snug group-hover:opacity-70 transition-opacity duration-200">
            {name}
          </h3>

          {/* Color dots */}
          <div className="flex items-center gap-1.5 mt-2">
            {colors.includes("BLACK") && (
              <span
                className="w-3 h-3 rounded-full border border-black/20 bg-[#111111]"
                title="Black"
              />
            )}
            {colors.includes("WHITE") && (
              <span
                className="w-3 h-3 rounded-full border border-black/20 bg-white"
                title="White"
              />
            )}
          </div>
        </div>

        <p className="text-sm text-[#111111] font-medium shrink-0">
          ₹{basePrice.toLocaleString("en-IN")}
        </p>
      </div>
    </Link>
  );
}