"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const DEFAULT_ACTIONS = [
  { label: "Registrar nuevo cerdo", path: "/dashboard/animals" },
  { label: "Ver inventario", path: "/dashboard/inventory" },
  { label: "Registrar alimentación", path: "/dashboard/feeding" },
  { label: "Ver reportes de salud", path: "/dashboard/health" },
];

export default function QuickActions({ actions = DEFAULT_ACTIONS }) {
  return (
    <Card className="mt-6 rounded-[2rem]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 font-bold text-amber-800 text-sm">
          AI
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Accesos rápidos
          </p>
          <h2 className="text-2xl font-black text-slate-950">Acciones frecuentes</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <Link key={action.label} href={action.path}>
            <Button
              tone="soft"
              className="w-full justify-start text-left hover:scale-[1.02] transition-transform text-slate-800 bg-slate-100 hover:bg-slate-200 border-none font-semibold px-4 py-3 rounded-xl"
            >
              {action.label}
            </Button>
          </Link>
        ))}
      </div>
    </Card>
  );
}
