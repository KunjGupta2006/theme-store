import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Shirt Store",
  description: "Modern custom t-shirt ecommerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en" className={`${inter.variable} ${interTight.variable}`}>
      <body>
        <Navbar />
        {children}

      </body>
    </html>
    </ClerkProvider>
  );
}