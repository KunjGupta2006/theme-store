export default function AccountLoading() {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#FAF7F2]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10">
          <div className="h-8 bg-black/10 rounded w-48 animate-pulse" />
          <div className="h-8 bg-black/10 rounded w-32 animate-pulse" />
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-black/8 rounded p-5 h-24 animate-pulse flex flex-col justify-between">
              <div className="h-4 bg-black/5 rounded w-32" />
              <div className="h-4 bg-black/10 rounded w-48" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
