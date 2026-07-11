import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F1EA] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="font-['Inter_Tight'] text-6xl font-bold text-[#111111] mb-4">404</h1>
      <h2 className="font-['Inter_Tight'] text-2xl font-semibold text-[#111111] mb-6">Page Not Found</h2>
      <p className="text-[#666666] mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        href="/"
        className="bg-[#111111] text-white text-xs tracking-widest uppercase px-8 py-4 hover:opacity-80 transition-opacity"
      >
        Return to Home
      </Link>
    </div>
  );
}
