"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faUser, faBagShopping, faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { SignInButton, useClerk, useUser } from "@clerk/nextjs";
import { CartButton } from "@/components/cart/CartButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Customize", href: "/customize" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const transparent = pathname === "/"; // only the hero page gets the overlay treatment


  return (
    <>
      <nav
        className={`left-0 right-0 top-0 z-100 flex h-16 w-full items-center justify-between px-6 transition-colors ${
          transparent
            ? "absolute bg-transparent text-white"
            : "sticky bg-[#F5F1EA]/90 backdrop-blur-sm border-b border-black/6 text-[#111111]"
        }`}
      >
        <div className="font-display text-3xl font-semibold tracking-tight">
          Atelier
        </div>

        <ul className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="group relative font-body text-sm font-medium transition-all duration-300 "
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover:w-full " />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-5">
          <button
            className="flex items-center gap-1.5 transition-all duration-200 hover:scale-105 hover:text-white/70 md:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <FontAwesomeIcon icon={faBars} className="text-lg" />
          </button>

          <div className="hidden items-center gap-2 rounded-md border border-white/20 px-3 py-1.5 transition-all duration-200 focus-within:border-white/50 hover:border-white/40 sm:flex">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm text-white/60" />
            <input
              type="text"
              placeholder="Search"
              className="w-32 bg-transparent font-body text-sm outline-none placeholder:text-white/60"
            />
          </div>

          <div className="relative">
            {isSignedIn ? (
              <ProfileDropdown />
            ) : (
              <SignInButton mode="modal">
                <button className="group flex items-center gap-1.5 transition-all duration-200 hover:scale-105 hover:text-white/70 sm:flex">
                  <FontAwesomeIcon icon={faUser} className="text-sm transition-transform duration-200 group-hover:scale-110" />
                  <span className="hidden font-body text-sm md:flex">Sign In</span>
                </button>
              </SignInButton>
            )}
          </div>

          <a href="#" className="group flex items-center gap-1.5 transition-all duration-200 hover:scale-105 hover:text-white/70 sm:flex">
            <CartButton />
            <span className="hidden font-body text-sm md:flex">Bag</span>
          </a>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-1000 transition-opacity duration-300 ${menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-black/20" />

        <aside
          className={`absolute right-0 top-0 flex h-full w-1/2 flex-col bg-surface p-6 shadow-xl transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end">
            <button onClick={() => setMenuOpen(false)} className="z-100 text-on-surface transition-colors hover:text-primary">
              <FontAwesomeIcon icon={faXmark} className="text-xl" />
            </button>
          </div>
          <div className="mt-2 w-12/11 flex items-center gap-2 rounded-md border border-outline-variant px-2 py-1.5">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent font-body text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
            />
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm text-on-surface-variant mx-4 cursor-pointer " />
          </div>

          <ul className="mt-8 flex flex-col gap-6">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="group relative inline-block font-body text-lg font-medium text-on-surface transition-all duration-300"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-on-surface transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

        </aside>
      </div>
      <CartDrawer />
    </>
  );
}

function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { signOut } = useClerk();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="group flex items-center gap-1.5 transition-all duration-200 hover:scale-105 hover:text-white/70 sm:flex  "
      >
        <FontAwesomeIcon icon={faUser} className="text-sm transition-transform duration-200 group-hover:scale-110 " />

      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 rounded-md border border-white/20 bg-black/80 py-1 shadow-lg backdrop-blur-sm">
          <button
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-white-600 transition-colors hover:bg-white/10"
          >
            Profile
          </button>

          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-white/10"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
