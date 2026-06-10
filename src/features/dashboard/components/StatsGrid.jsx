import Card from "@/components/ui/Card";

export default function StatsGrid() {
  const stats = [
    { label: "Población Activa", value: "320 cabezas", change: "+12% este mes", color: "text-sena-green" },
    { label: "Consumo Alimento", value: "4.2 ton", change: "Semana actual", color: "text-indigo-400" },
    { label: "Índice de Conversión", value: "2.4 FCR", change: "Meta: 2.2", color: "text-emerald-400" },
    { label: "Alertas Sanitarias", value: "0 activas", change: "Estado óptimo", color: "text-amber-400" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx} className="flex flex-col justify-between h-28">
          <span className="text-xs font-semibold text-zinc-400">{stat.label}</span>
          <div className="flex flex-col">
            <span className={`text-2xl font-bold tracking-tight ${stat.color}`}>
              {stat.value}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">{stat.change}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
