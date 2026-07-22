import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/products/ProductCard";
import ScrollReveal from "@/components/ScrollReveal";
import ParallaxHero from "@/components/ParallaxHero";
import ParallaxBanner from "@/components/ParallaxBanner";
import Footer from "@/components/Footer";

export default async function HomePage() {
  // Fetch 4 newest products for the Featured Collection section
  const featuredProducts = await db.product.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      variants: {
        select: {
          id: true,
          color: true,
          size: true,
          stockQuantity: true,
          priceAdjustment: true,
        },
      },
      colors: { orderBy: { position: "asc" } },
    },
  });

  return (
    <>
      <main>
        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1 — Hero (parallax)
        ═══════════════════════════════════════════════════════════════ */}
        <ParallaxHero />

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2 — What We Do (existing)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-surface px-5 py-section md:px-16">
          <div className="mx-auto max-w-max">
            <ScrollReveal>
              <div className="flex flex-col items-center text-center md:items-start md:text-left">
                <span className="label-caps text-on-surface-variant">What We Do</span>
                <h2 className="headline-lg mt-3 text-on-surface md:headline-xl md:mt-4">
                  Premium Craft,<br />Your Way
                </h2>
                <p className="body-lg mt-4 max-w-2xl text-on-surface-variant md:mt-5">
                  Every garment is a blank canvas. We partner with you to bring your vision to life using
                  the finest materials and most advanced printing techniques in the industry.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-16 grid gap-6 md:mt-24 md:grid-cols-3">
              <ScrollReveal delay={0}>
                <div className="group border border-outline-variant bg-surface-container-lowest p-8 transition-all duration-300 hover:border-primary hover:bg-surface-container-low md:p-10">
                  <h3 className="headline-sm mt-6 text-on-surface">Custom Designs</h3>
                  <p className="body-md mt-3 text-on-surface-variant">
                    Full customization from concept to creation. Upload your artwork, choose placement, and we handle the rest.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={150}>
                <div className="group border border-outline-variant bg-surface-container-lowest p-8 transition-all duration-300 hover:border-primary hover:bg-surface-container-low md:p-10">
                  <h3 className="headline-sm mt-6 text-on-surface">Sublimation &amp; DTF</h3>
                  <p className="body-md mt-3 text-on-surface-variant">
                    Vibrant, durable prints using state-of-the-art sublimation and Direct-to-Film technology that won&rsquo;t fade or crack.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="group border border-outline-variant bg-surface-container-lowest p-8 transition-all duration-300 hover:border-primary hover:bg-surface-container-low md:p-10">
                  <h3 className="headline-sm mt-6 text-on-surface">Premium Fabrics</h3>
                  <p className="body-md mt-3 text-on-surface-variant">
                    Choose from a range of GSM weights &mdash; 160, 180, 200, 240 &amp; 260 &mdash; each selected for comfort, durability, and drape.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3 — Featured Collection (NEW)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-[#F5F1EA] px-5 py-24 md:px-16 md:py-32">
          <div className="mx-auto max-w-[1280px]">
            <ScrollReveal>
              <div className="flex flex-col items-center text-center md:flex-row md:items-end md:justify-between md:text-left">
                <div>
                  <span className="label-caps text-on-surface-variant">Curated For You</span>
                  <h2 className="headline-lg mt-3 text-on-surface md:headline-xl md:mt-4">
                    Featured<br className="hidden md:block" /> Collection
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="mt-6 md:mt-0 inline-flex items-center gap-2 text-sm font-medium text-[#111111] border-b border-[#111111] pb-0.5 hover:opacity-70 transition-opacity"
                >
                  View All
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </ScrollReveal>

            {featuredProducts.length > 0 && (
              <div className="mt-14 md:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                {featuredProducts.map((product, i) => (
                  <ScrollReveal key={product.id} delay={i * 120}>
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      basePrice={product.basePrice}
                      thumbnail={product.thumbnail}
                      variants={product.variants}
                      isCustomizable={product.isCustomizable}
                      colors={product.colors}
                    />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3.5 — Parallax Lifestyle Banner (NEW)
        ═══════════════════════════════════════════════════════════════ */}
        <ParallaxBanner />

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 4 — How It Works (NEW)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-surface px-5 py-24 md:px-16 md:py-32 overflow-hidden">
          <div className="mx-auto max-w-[1280px]">
            <ScrollReveal>
              <div className="text-center mb-16 md:mb-24">
                <span className="label-caps text-on-surface-variant">The Process</span>
                <h2 className="headline-lg mt-3 text-on-surface md:headline-xl md:mt-4">
                  How It Works
                </h2>
                <p className="body-lg mt-4 max-w-xl mx-auto text-on-surface-variant">
                  From concept to your doorstep in three simple steps.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative">
              {/* Connecting line (desktop only) */}
              <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[#cac6bd] to-transparent" />

              {[
                {
                  step: "01",
                  title: "Design",
                  desc: "Choose a base or upload your own artwork. Use our studio editor to position, scale, and perfect your design on front and back.",
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                },
                {
                  step: "02",
                  title: "Print",
                  desc: "Our artisans print your design using premium DTF and sublimation techniques on carefully selected, high-GSM cotton fabric.",
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                },
                {
                  step: "03",
                  title: "Deliver",
                  desc: "Quality-checked, carefully packed, and shipped to your doorstep. Track your order every step of the way.",
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M16 16l2 2 4-4M21 10V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l2-1.14M12 22.08V12M2.46 7L12 12l9.54-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                },
              ].map((item, i) => (
                <ScrollReveal key={item.step} delay={i * 200}>
                  <div className="flex flex-col items-center text-center group">
                    {/* Step number circle */}
                    <div className="relative w-32 h-32 rounded-full bg-[#F5F1EA] border border-[#cac6bd] flex items-center justify-center mb-8 group-hover:border-[#111111] transition-colors duration-500">
                      <div className="text-[#111111]">{item.icon}</div>
                      <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#111111] text-white text-[11px] font-semibold flex items-center justify-center tracking-wider">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="headline-sm text-on-surface">{item.title}</h3>
                    <p className="body-md mt-3 text-on-surface-variant max-w-xs">
                      {item.desc}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 5 — CTA Banner (NEW)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#111111] text-white">
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />

          <div className="relative z-10 mx-auto max-w-[1280px] px-6 py-24 md:py-36 flex flex-col items-center text-center">
            <ScrollReveal>
              <span className="label-caps text-white/40 tracking-[0.2em]">
                Make It Yours
              </span>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <h2 className="font-['Inter_Tight'] text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mt-5 leading-[1.1]">
                Your Vision.<br />Our Craft.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="body-lg mt-6 max-w-lg text-white/50">
                Upload your design, pick your fabric, and let our artisans create
                something truly one-of-a-kind. No minimums. No compromises.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
                <Link
                  href="/shop"
                  className="label-caps bg-white text-[#111111] px-10 py-4 tracking-widest hover:bg-white/90 transition-all duration-300 hover:scale-[1.02]"
                >
                  Start Designing
                </Link>
                <Link
                  href="/shop"
                  className="label-caps border border-white/25 text-white px-10 py-4 tracking-widest hover:bg-white/10 transition-all duration-300"
                >
                  Browse Collection
                </Link>
              </div>
            </ScrollReveal>

            {/* Decorative floating elements */}
            <div className="absolute top-12 left-8 md:left-16 w-20 h-20 border border-white/[0.06] rounded-full animate-pulse-glow" />
            <div className="absolute bottom-16 right-8 md:right-20 w-14 h-14 border border-white/[0.06] rounded-full" style={{ animation: "pulse-glow 3s ease-in-out infinite 1s" }} />
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════ */}
      <Footer />
    </>
  );
}