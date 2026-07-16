import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faXTwitter, faPinterest } from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  return (
    <footer className="bg-[#1c1b1b] text-white/70">
      {/* Main footer content */}
      <div className="max-w-[1280px] mx-auto px-6 pt-20 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <h3 className="font-['Inter_Tight'] text-2xl font-bold text-white tracking-tight">
              Atelier
            </h3>
            <p className="text-sm leading-relaxed mt-4 max-w-xs">
              Premium custom-printed apparel. Where craft meets creativity, and
              every garment tells your story.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all duration-300"
              >
                <FontAwesomeIcon icon={faInstagram} className="text-sm" />
              </a>
              <a
                href="#"
                aria-label="X (Twitter)"
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all duration-300"
              >
                <FontAwesomeIcon icon={faXTwitter} className="text-sm" />
              </a>
              <a
                href="#"
                aria-label="Pinterest"
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all duration-300"
              >
                <FontAwesomeIcon icon={faPinterest} className="text-sm" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-white/40 mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Shop All", href: "/shop" },
                { label: "Customize", href: "/customize" },
                { label: "About Us", href: "/about" },
                { label: "My Account", href: "/account" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-white/40 mb-5">
              Customer Service
            </h4>
            <ul className="space-y-3">
              {[
                "Shipping & Delivery",
                "Returns & Exchanges",
                "Size Guide",
                "Care Instructions",
              ].map((item) => (
                <li key={item}>
                  <span className="text-sm hover:text-white transition-colors duration-300 cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-white/40 mb-5">
              Stay Updated
            </h4>
            <p className="text-sm leading-relaxed mb-4">
              New drops, exclusive offers, and style inspiration — straight to
              your inbox.
            </p>
            <form
              action="#"
              className="flex items-stretch"
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-w-0 bg-white/8 border border-white/15 border-r-0 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/30 transition-colors"
              />
              <button
                type="submit"
                className="px-5 bg-white text-[#1c1b1b] text-xs font-semibold tracking-widest uppercase hover:bg-white/90 transition-colors shrink-0"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="max-w-[1280px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Atelier. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-white/30 hover:text-white/50 transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="text-xs text-white/30 hover:text-white/50 transition-colors cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
