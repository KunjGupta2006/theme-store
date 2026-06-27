"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faUser, faBagShopping, faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

const navLinks = [
  { label: "Shop", href: "#" },
  { label: "Collections", href: "#" },
  { label: "Customize", href: "#" },
  { label: "About", href: "#" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="flex h-16 w-full items-center justify-between border-b border-outline-variant bg-secondary-container px-6">
        <div className="font-display text-2xl font-semibold tracking-tight text-on-surface">
          Atelier
        </div>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="font-body text-sm font-medium text-on-surface transition-all duration-300 hover:shadow-2xs hover:shadow-black"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-5">
          <button
            className="flex items-center gap-1.5 text-on-surface transition-colors hover:text-primary md:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <FontAwesomeIcon icon={faBars} className="text-lg" />
          </button>
          {menuOpen==true && 

<div className="hidden items-center gap-2 rounded-md border border-outline-variant px-3 py-1.5 sm:flex">
  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm text-on-surface-variant" />
  <input
    type="text"
    placeholder="Search"
    className="w-32 bg-transparent font-body text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
  />
</div>
          }


          <a href="#" className=" items-center gap-1.5 text-on-surface transition-colors hover:text-primary sm:flex">
            <FontAwesomeIcon icon={faUser} className="text-sm" />
            <span className="hidden font-body text-sm md:flex">Profile</span>
          </a>

          <a href="#" className=" items-center gap-1.5 text-on-surface transition-colors hover:text-primary sm:flex">
            <FontAwesomeIcon icon={faBagShopping} className="text-sm" />
            <span className="hidden font-body text-sm md:flex">Bag</span>
          </a>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-black/20" />

        <aside
          className={`absolute right-0 top-0 flex h-full w-1/2 flex-col bg-surface p-6 shadow-xl transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end">
            <button onClick={() => setMenuOpen(false)} className="text-on-surface transition-colors hover:text-primary">
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
                  className="font-body text-lg font-medium text-on-surface transition-colors hover:text-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

        </aside>
      </div>
    </>
  );
}
