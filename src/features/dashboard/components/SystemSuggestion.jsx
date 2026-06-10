import Card from "@/components/ui/Card";

export default function SystemSuggestion() {
  return (
    <Card className="space-y-3 border-sena-green/10 bg-sena-green/2">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-sena-green animate-pulse"></span>
        <h4 className="text-sm font-bold text-sena-green">
          Sugerencia del Sistema
        </h4>
      </div>
      <p className="text-xs text-zinc-300 leading-relaxed">
        El lote de ceba actual ha alcanzado un peso promedio de 85kg. Se
        recomienda cambiar la ración de crecimiento a acabado final a partir de
        mañana.
      </p>
    </Card>
  );
}
