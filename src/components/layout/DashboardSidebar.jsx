"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import BrandMark from "../BrandMark.jsx";
import Button from "../ui/Button.jsx";
import { getCurrentUser, logout } from "../../services/auth/authService.js";
import { useEffect, useState } from "react";
import { Menu, QrCode, X } from "lucide-react";
import dynamic from "next/dynamic";

const QrQuickSearchModal = dynamic(() => import("./QrQuickSearchModal.jsx"), {
  ssr: false,
});

export default function DashboardSidebar({ items = [] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cargamos el usuario en un useEffect para evitar hydration mismatch del lado del servidor
  useEffect(() => {
    setMounted(true);
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  // Cerrar el menú móvil automáticamente al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Bloquear scroll del body y soportar tecla Escape cuando el cajón móvil está abierto
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const userRole = user?.role || user?.rol || "operario";

  // Si no se pasaron items, usamos los predeterminados de la app
  const menuItems =
    items.length > 0
      ? items
      : [
          { name: "Inicio", path: "/dashboard" },
          { name: "Animales", path: "/dashboard/animals" },
          { name: "Inventario", path: "/dashboard/inventory" },
          { name: "Registro de Peso", path: "/dashboard/weight" },
          { name: "Alimentación", path: "/dashboard/feeding" },
          { name: "Reproducción", path: "/dashboard/reproduction" },
          { name: "Vacunación", path: "/dashboard/health" },
          { name: "Alertas y Reportes", path: "/dashboard/reports" },
          { name: "Configuración de usuarios", path: "/dashboard/settings" },
        ];

  // Lógica de filtrado basada en el rol (todos los roles tienen acceso a Configuración para editar su propio perfil y contraseña)
  const filteredItems = menuItems.filter((item) => {
    if (userRole === "veterinario") {
      // Veterinario no ve Alimentación ni Peso
      return ![
        "/dashboard/feeding",
        "/dashboard/weight",
      ].includes(item.path);
    }
    if (userRole === "operativo" || userRole === "operario") {
      // Operario no ve Salud (Vacunación), Reproducción ni Reportes
      return ![
        "/dashboard/health",
        "/dashboard/reproduction",
        "/dashboard/reports",
      ].includes(item.path);
    }
    // Administrador u otros ven todo
    return true;
  });

  // Función para cerrar sesión correctamente
  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
    router.push("/login");
  };

  const handleOpenQrModal = () => {
    setIsMobileMenuOpen(false);
    setIsSearchModalOpen(true);
  };

  if (!mounted) {
    return (
      <>
        <div className="lg:hidden sticky top-0 z-30 bg-slate-950 px-4 sm:px-6 py-3.5 text-white flex items-center justify-between border-b border-white/10 no-print">
          <BrandMark light />
          <div className="h-9 w-9 rounded-xl bg-slate-900 animate-pulse" />
        </div>
        <aside className="hidden lg:flex lg:w-72 xl:w-80 lg:shrink-0 lg:h-screen lg:sticky lg:top-0 bg-slate-950 px-6 xl:px-7 py-7 text-white flex-col justify-between border-r border-white/5 no-print">
          <BrandMark light />
          <div className="h-40 animate-pulse bg-slate-900/50 rounded-2xl"></div>
        </aside>
      </>
    );
  }

  const sidebarBody = (
    <>
      {/* SECCIÓN DE PERFIL E INDICADOR DE ROL */}
      <div className="mt-6 px-5 py-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-start shrink-0">
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
          Usuario Actual
        </p>
        <p className="font-bold text-white mt-1 truncate max-w-full">
          {user?.name || "Usuario Invitado"}
        </p>

        {/* Badge Dinámico */}
        <span
          className={`inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border 
          ${
            userRole === "administrador" || userRole === "admin"
              ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
              : userRole === "veterinario"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-blue-500/20 text-blue-300 border-blue-500/30"
          }`}
        >
          {userRole}
        </span>
      </div>

      {/* BOTÓN RÁPIDO: ESCANEAR / BUSCAR CHAPETA */}
      <div className="mt-4 shrink-0">
        <button
          type="button"
          onClick={handleOpenQrModal}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer group"
        >
          <QrCode
            size={18}
            className="text-slate-950 group-hover:scale-110 transition-transform"
          />
          <span>Buscar Arete / QR</span>
        </button>
      </div>

      <nav className="mt-5 grid gap-1.5 content-start flex-1 overflow-y-auto pr-1">
        {filteredItems.map((item) => {
          const isActive =
            item.path === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/dashboard/"
              : pathname === item.path || pathname.startsWith(item.path + "/");

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                isActive
                  ? "bg-emerald-400 text-slate-950"
                  : "bg-white/0 text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* mt-auto empuja el botón siempre al fondo */}
      <div className="pt-4 mt-auto shrink-0">
        <Button className="w-full" onClick={handleLogout} tone="ghost">
          Cerrar Sesión
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* BARRA SUPERIOR MÓVIL / TABLET (< lg) CON MENÚ HAMBURGUESA */}
      <div className="lg:hidden sticky top-0 z-30 bg-slate-950 px-4 sm:px-6 py-3.5 text-white flex items-center justify-between border-b border-white/10 shadow-md no-print">
        <BrandMark light />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenQrModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm cursor-pointer"
            title="Buscar cerdo por arete, alias o código QR"
          >
            <QrCode size={16} />
            <span className="hidden sm:inline">QR</span>
          </button>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Abrir menú de navegación"
            aria-expanded={isMobileMenuOpen}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition cursor-pointer"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* CAJÓN DESLIZANTE (DRAWER) PARA MÓVIL / TABLET (< lg) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex no-print">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 sm:w-80 max-w-[85vw] h-full bg-slate-950 px-6 py-6 text-white flex flex-col shadow-2xl border-r border-white/10 overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between gap-2 shrink-0">
              <BrandMark light />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Cerrar menú de navegación"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            {sidebarBody}
          </aside>
        </div>
      )}

      {/* SIDEBAR FIJO DE ESCRITORIO (lg+) — NO SE MUEVE CON EL SCROLL DERECHO */}
      <aside className="hidden lg:flex lg:w-72 xl:w-80 lg:shrink-0 lg:h-screen lg:sticky lg:top-0 bg-slate-950 px-6 xl:px-7 py-7 text-white flex-col overflow-hidden border-r border-white/5 no-print">
        <div className="shrink-0">
          <BrandMark light />
        </div>
        {sidebarBody}
      </aside>

      {/* Modal de Búsqueda Rápida por Arete / QR */}
      <QrQuickSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
}
