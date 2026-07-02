export default function ShopLoading() {
  return (
    <main className="min-h-screen bg-[#F5F1EA]">
      {/* Header skeleton */}
      <section className="max-w-max mx-auto px-6 pt-24 pb-12">
        <div className="w-24 h-3 bg-[#EEE7DD] rounded mb-3 animate-pulse" />
        <div className="w-72 h-14 bg-[#EEE7DD] rounded animate-pulse" />
      </section>

      {/* Filter skeleton */}
      <section className="max-w-max mx-auto px-6 pb-8 border-b border-black/8">
        <div className="flex gap-4">
          {[80, 60, 120, 60, 60].map((w, i) => (
            <div
              key={i}
              className="h-8 bg-[#EEE7DD] rounded animate-pulse"
              style={{ width: w }}
            />
          ))}
        </div>
      </section>

      {/* Grid skeleton */}
      <section className="max-w-max mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-4/5 bg-[#EEE7DD] animate-pulse mb-4" />
              <div className="w-3/4 h-4 bg-[#EEE7DD] rounded animate-pulse mb-2" />
              <div className="w-1/4 h-4 bg-[#EEE7DD] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}