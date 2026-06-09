import Card from "@/components/ui/Card";

export default function SystemSuggestion() {
  return (
    <Card className="space-y-3 border-rose-500/10 bg-rose-500/[0.02]">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
        <h4 className="text-sm font-bold text-rose-400">Sugerencia del Sistema</h4>
      </div>
      <p className="text-xs text-zinc-300 leading-relaxed">
        El lote de ceba actual ha alcanzado un peso promedio de 85kg. Se recomienda cambiar la ración de crecimiento a acabado final a partir de mañana.
      </p>
    </Card>
  );
}
