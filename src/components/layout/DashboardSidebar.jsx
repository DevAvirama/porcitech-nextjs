"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandMark from "../BrandMark";

export default function DashboardSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Panel de Control", path: "/dashboard" },
    { name: "Inventario", path: "/dashboard/inventory" },
    { name: "Animales", path: "/dashboard/animals" },
    { name: "Alimentación", path: "/dashboard/feeding" },
    { name: "Pesaje", path: "/dashboard/weight" },
    { name: "Reproducción", path: "/dashboard/reproduction" },
    { name: "Sanidad", path: "/dashboard/health" },
    { name: "Reportes", path: "/dashboard/reports" },
    { name: "Configuración", path: "/dashboard/settings" },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-zinc-900">
        <BrandMark />
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-zinc-900">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-300">
            U
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-200">Usuario Demo</span>
            <span className="text-[10px] text-zinc-500">Administrador</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
