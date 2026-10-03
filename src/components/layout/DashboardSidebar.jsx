"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import BrandMark from "../BrandMark.jsx";
import Button from "../ui/Button.jsx";
import { getCurrentUser, logout } from "../../services/auth/authService.js";
import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";
import QrQuickSearchModal from "./QrQuickSearchModal.jsx";

export default function DashboardSidebar({ items = [] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Cargamos el usuario en un useEffect para evitar hydration mismatch del lado del servidor
  useEffect(() => {
    setMounted(true);
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const userRole = user?.role || user?.rol || "operario";

  // Si no se pasaron items, usamos los predeterminados de la app
  const menuItems =
    items.length > 0
      ? items
      : [
          { name: "Inicio", path: "/dashboard" },
          { name: "Animales", path: "/dashboard/animals" },
          { name: "Inventario", path: "/dashboard/inventory" },
          { name: "Resgistro de Peso", path: "/dashboard/weight" },
          { name: "Alimentación", path: "/dashboard/feeding" },
          { name: "Reproducción", path: "/dashboard/reproduction" },
          { name: "Vacunación", path: "/dashboard/health" },
          { name: "Alertas y Reportes", path: "/dashboard/reports" },
          { name: "Configuración de usuarios", path: "/dashboard/settings" },
        ];

  // Lógica de filtrado basada en el rol
  const filteredItems = menuItems.filter((item) => {
    if (userRole === "veterinario") {
      // Veterinario no ve Alimentación, Peso ni Configuración de usuarios
      return ![
        "/dashboard/feeding",
        "/dashboard/weight",
        "/dashboard/settings",
      ].includes(item.path);
    }
    if (userRole === "operativo" || userRole === "operario") {
      // Operario no ve Salud (Vacunación), Reproducción, Reportes ni Configuración
      return ![
        "/dashboard/health",
        "/dashboard/reproduction",
        "/dashboard/reports",
        "/dashboard/settings",
      ].includes(item.path);
    }
    // Administrador u otros ven todo
    return true;
  });

  // Función para cerrar sesión correctamente
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!mounted) {
    return (
      <aside className="w-full bg-slate-950 px-6 py-8 text-white xl:min-h-screen xl:w-80 xl:px-8 flex flex-col justify-between">
        <BrandMark light />
        <div className="h-40 animate-pulse bg-slate-900/50 rounded-2xl"></div>
      </aside>
    );
  }

  return (
    <aside className="w-full bg-slate-950 px-6 py-8 text-white xl:min-h-screen xl:w-80 xl:px-8 flex flex-col">
      <BrandMark light />

      {/* SECCIÓN DE PERFIL E INDICADOR DE ROL */}
      <div className="mt-8 px-5 py-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-start">
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
          Usuario Actual
        </p>
        <p className="font-bold text-white mt-1">
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
      <div className="mt-5">
        <button
          type="button"
          onClick={() => setIsSearchModalOpen(true)}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer group"
        >
          <QrCode
            size={18}
            className="text-slate-950 group-hover:scale-110 transition-transform"
          />
          <span>+ Escanear QR</span>
        </button>
      </div>

      <nav className="mt-6 grid gap-2 content-start flex-1">
        {filteredItems.map((item) => {
          // En Next.js determinamos si está activo comprobando la ruta actual
          const isActive =
            item.path === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/dashboard/"
              : pathname === item.path || pathname.startsWith(item.path + "/");

          return (
            <Link
              key={item.path}
              href={item.path}
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
      <Button className="mt-auto" onClick={handleLogout} tone="ghost">
        Cerrar Sesión
      </Button>

      {/* Modal de Búsqueda y Escáner QR */}
      <QrQuickSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </aside>
  );
}
