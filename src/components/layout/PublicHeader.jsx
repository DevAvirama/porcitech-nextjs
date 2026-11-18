"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import BrandMark from "../BrandMark.jsx";
import Button from "../ui/Button.jsx";

const NAV_ITEMS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#modulos", label: "Módulos" },
  { href: "#ecosistema", label: "Web y Móvil" },
  { href: "#flujo", label: "Cómo Funciona" },
  { href: "#contacto", label: "Contacto" },
];

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-10">
        <Link href="#inicio" className="shrink-0 focus:outline-none">
          <BrandMark light compact />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-300 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-emerald-300"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Button
            to="/login"
            className="rounded-full px-4 py-2 text-xs sm:px-6 sm:py-2.5 sm:text-sm"
            tone="primary"
          >
            Ingresar
            <ArrowRight className="ml-1.5 h-4 w-4 hidden sm:inline" />
          </Button>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
            className="lg:hidden rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10 cursor-pointer"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl px-4 sm:px-6 py-4 flex flex-col gap-1.5 text-sm font-semibold text-slate-200">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 transition hover:bg-white/5 hover:text-emerald-300"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2 mt-2 border-t border-white/10">
            <Button
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full rounded-xl py-2.5 text-sm"
              tone="primary"
            >
              Iniciar Sesión en la Plataforma
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
