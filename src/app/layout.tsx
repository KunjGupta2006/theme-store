import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Atelier — Custom T-Shirts",
  description: "Premium custom printed t-shirts. Upload your design or choose a template.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${interTight.variable}`}>
        <body>
          <Navbar />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#FAF7F2",
                border: "1px solid rgba(0,0,0,0.08)",
                color: "#111111",
                borderRadius: "4px",
                fontSize: "13px",
                fontFamily: "Inter, sans-serif",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}