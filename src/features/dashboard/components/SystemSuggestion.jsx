"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, Baby, Activity, TrendingDown } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function SystemSuggestion() {
  const router = useRouter();

  // Mocks de estados para probar las prioridades del sistema
  const compliance = 95; // Si es menor a 90 dispara alerta de bioseguridad
  const loteCrecimiento = { id: "L-042", gdpReal: 680, gdpIdeal: 800 };
  const hembraPartoInminente = { id: "H-045", diasGestacion: 100 };
  const hembraAnestro = { id: "H-089", diasPostDestete: 8 };

  // 1. Alerta de Bioseguridad (Prioridad Crítica)
  if (compliance < 90) {
    return (
      <Card className="!bg-rose-950 text-white shadow-xl shadow-rose-900/20">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm font-semibold uppercase tracking-[0.22em]">
            Prioridad Crítica
          </p>
        </div>
        <h3 className="mt-4 text-3xl font-black">Revisar Protocolo ICA</h3>
        <p className="mt-4 leading-7 text-rose-200/80">
          El cumplimiento sanitario ha caído al {compliance}%. Es urgente revisar los protocolos sanitarios para cumplir con la normativa ICA.
        </p>
        <Button
          className="mt-8 border-none bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/30 text-white"
          onClick={() => router.push("/dashboard/health")}
        >
          Ver Protocolos
        </Button>
      </Card>
    );
  }

  // 2. Alerta de Desviación de Crecimiento (Prioridad Alta)
  const desviacionGDP = (loteCrecimiento.gdpIdeal - loteCrecimiento.gdpReal) / loteCrecimiento.gdpIdeal;

  if (desviacionGDP > 0.10) {
    return (
      <Card className="!bg-orange-950 text-white shadow-xl shadow-orange-900/20">
        <div className="flex items-center gap-2 text-orange-400">
          <TrendingDown className="h-5 w-5" />
          <p className="text-sm font-semibold uppercase tracking-[0.22em]">
            Prioridad Alta
          </p>
        </div>
        <h3 className="mt-4 text-3xl font-black">Alerta de Rendimiento</h3>
        <p className="mt-4 leading-7 text-orange-200/80">
          📉 El Lote <strong>{loteCrecimiento.id}</strong> presenta un crecimiento por debajo del estándar de Porkcolombia ({loteCrecimiento.gdpReal} g/día vs esperado de {loteCrecimiento.gdpIdeal} g/día). Revisar conversión alimenticia.
        </p>
        <Button
          className="mt-8 border-none text-white shadow-md bg-orange-500 hover:bg-orange-600 shadow-orange-500/30"
          onClick={() => router.push("/dashboard/weight")}
        >
          Ver Análisis
        </Button>
      </Card>
    );
  }

  // 5. Sugerencia Normal por Defecto (Prioridad Baja)
  return (
    <Card className="!bg-slate-950 text-white shadow-xl shadow-slate-300/20">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
        Sugerencia del sistema
      </p>
      <h3 className="mt-4 text-3xl font-black">Optimiza el feed del Lote #42</h3>
      <p className="mt-4 leading-7 text-slate-300">
        Basado en el crecimiento actual, conviene ajustar la ración para mejorar
        conversión y reducir desperdicio en la siguiente semana.
      </p>
      <Button
        className="mt-8"
        tone="accent"
        onClick={() => router.push("/dashboard/feeding")}
      >
        Ver detalles
      </Button>
    </Card>
  );
}
