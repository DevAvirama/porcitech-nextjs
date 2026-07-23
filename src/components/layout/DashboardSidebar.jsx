"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import BrandMark from "../BrandMark";
import Button from "../ui/Button";
import { getCurrentUser, logout } from "../../services/auth/authService";

const DEFAULT_ITEMS = [
  { name: "Inicio", path: "/dashboard" },
  { name: "Inventario", path: "/dashboard/inventory" },
  { name: "Registro de animales", path: "/dashboard/animals" },
  { name: "Alimentación", path: "/dashboard/feeding" },
  { name: "Registro de peso", path: "/dashboard/weight" },
  { name: "Reproducción", path: "/dashboard/reproduction" },
  { name: "Vacunación", path: "/dashboard/health" },
  { name: "Alertas y reportes", path: "/dashboard/reports" },
  { name: "Configuración de usuarios", path: "/dashboard/settings" },
];

export default function DashboardSidebar({ items = DEFAULT_ITEMS }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const userRole = user?.role || "operativo";

  // Lógica de filtrado basada en el rol
  const filteredItems = items.filter((item) => {
    if (userRole === "veterinario") {
      // Veterinario no ve Alimentación ni Peso
      return !["/dashboard/feeding", "/dashboard/weight"].includes(item.path);
    }
    if (userRole === "operativo" || userRole === "operario") {
      // Operativo no ve Salud, Reproducción, Reportes ni Configuración
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

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-full bg-slate-950 px-6 py-8 text-white xl:min-h-screen xl:w-80 xl:px-8 flex flex-col shrink-0">
      <BrandMark light />

      {/* SECCIÓN DE PERFIL E INDICADOR DE ROL */}
      <div className="mt-8 px-5 py-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-start">
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
          Usuario Actual
        </p>
        <p className="font-bold text-white mt-1">
          {user?.name || "Usuario Demostración"}
        </p>

        {/* Badge Dinámico */}
        <span
          className={`inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
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

      <nav className="mt-8 grid gap-2 content-start flex-1">
        {filteredItems.map((item) => {
          const isActive =
            item.path === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/dashboard/"
              : pathname.startsWith(item.path);

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

      {/* Botón Cerrar Sesión */}
      <Button className="mt-auto" onClick={handleLogout} tone="ghost">
        Cerrar Sesión
      </Button>
    </aside>
  );
}
