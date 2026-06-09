import Link from "next/link";
import Card from "@/components/ui/Card";

export default function QuickActions() {
  const actions = [
    { label: "Registrar Pesaje", path: "/dashboard/weight" },
    { label: "Ingreso Veterinario", path: "/dashboard/health" },
    { label: "Ciclos de Celos/Partos", path: "/dashboard/reproduction" },
    { label: "Configurar Raciones", path: "/dashboard/feeding" },
  ];

  return (
    <Card className="space-y-4">
      <h3 className="text-base font-bold text-white">Accesos Rápidos</h3>
      <div className="flex flex-col gap-2">
        {actions.map((act, index) => (
          <Link
            key={index}
            href={act.path}
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm font-semibold text-zinc-200 transition-all text-center block"
          >
            {act.label}
          </Link>
        ))}
      </div>
    </Card>
  );
}
