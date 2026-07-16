import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

function buildHref(
  page: number,
  searchParams: Record<string, string | undefined>
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== "") {
      params.set(key, value);
    }
  }
  params.set("page", String(page));
  return `/shop?${params.toString()}`;
}

/**
 * Compute which page numbers to display.
 * Shows at most 5 page buttons with ellipsis (represented as null) when needed.
 */
function getPageNumbers(
  currentPage: number,
  totalPages: number
): (number | null)[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | null)[] = [];

  if (currentPage <= 3) {
    // Near the start: show 1 2 3 4 ... last
    for (let i = 1; i <= 4; i++) pages.push(i);
    pages.push(null);
    pages.push(totalPages);
  } else if (currentPage >= totalPages - 2) {
    // Near the end: show 1 ... last-3 last-2 last-1 last
    pages.push(1);
    pages.push(null);
    for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
  } else {
    // In the middle: show 1 ... current-1 current current+1 ... last
    pages.push(1);
    pages.push(null);
    pages.push(currentPage - 1);
    pages.push(currentPage);
    pages.push(currentPage + 1);
    pages.push(null);
    pages.push(totalPages);
  }

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: PaginationProps) {
  const pages = getPageNumbers(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      {/* Previous */}
      {hasPrev ? (
        <Link
          href={buildHref(currentPage - 1, searchParams)}
          className="inline-flex h-9 items-center justify-center px-3 text-xs tracking-widest uppercase text-[#111111] border border-black/10 rounded hover:border-[#111111] transition-colors"
        >
          ←&ensp;Prev
        </Link>
      ) : (
        <span className="inline-flex h-9 items-center justify-center px-3 text-xs tracking-widest uppercase text-black/25 border border-black/5 rounded cursor-default select-none">
          ←&ensp;Prev
        </span>
      )}

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === null ? (
          <span
            key={`ellipsis-${idx}`}
            className="inline-flex h-9 w-9 items-center justify-center text-xs text-[#666666] select-none"
          >
            …
          </span>
        ) : page === currentPage ? (
          <span
            key={page}
            aria-current="page"
            className="inline-flex h-9 w-9 items-center justify-center text-xs tracking-widest uppercase bg-[#111111] text-white rounded font-medium"
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(page, searchParams)}
            className="inline-flex h-9 w-9 items-center justify-center text-xs tracking-widest uppercase text-[#111111] border border-black/10 rounded hover:border-[#111111] transition-colors"
          >
            {page}
          </Link>
        )
      )}

      {/* Next */}
      {hasNext ? (
        <Link
          href={buildHref(currentPage + 1, searchParams)}
          className="inline-flex h-9 items-center justify-center px-3 text-xs tracking-widest uppercase text-[#111111] border border-black/10 rounded hover:border-[#111111] transition-colors"
        >
          Next&ensp;→
        </Link>
      ) : (
        <span className="inline-flex h-9 items-center justify-center px-3 text-xs tracking-widest uppercase text-black/25 border border-black/5 rounded cursor-default select-none">
          Next&ensp;→
        </span>
      )}
    </nav>
  );
}
