"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import BrandMark from "../BrandMark.jsx";
import Button from "../ui/Button.jsx";

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-white/50 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4 lg:px-10">
        <BrandMark />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-500 md:flex">
          <a href="#inicio" className="transition hover:text-slate-950">
            Inicio
          </a>
          <a href="#caracteristicas" className="transition hover:text-slate-950">
            Caracteristicas
          </a>
          <a href="#impacto" className="transition hover:text-slate-950">
            Impacto
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button
            to="/login"
            className="rounded-full px-5 sm:px-8 py-2 text-xs sm:text-sm shadow-none"
            tone="primary"
          >
            Acceder
          </Button>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-slate-200/70 bg-white/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-3 text-sm font-semibold text-slate-700">
          <a
            href="#inicio"
            onClick={() => setMobileOpen(false)}
            className="py-1.5 transition hover:text-slate-950"
          >
            Inicio
          </a>
          <a
            href="#caracteristicas"
            onClick={() => setMobileOpen(false)}
            className="py-1.5 transition hover:text-slate-950"
          >
            Caracteristicas
          </a>
          <a
            href="#impacto"
            onClick={() => setMobileOpen(false)}
            className="py-1.5 transition hover:text-slate-950"
          >
            Impacto
          </a>
        </nav>
      )}
    </header>
  );
}
