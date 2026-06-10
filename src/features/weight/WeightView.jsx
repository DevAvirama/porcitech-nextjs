"use client";

import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import weightStandards from "./data/weightStandards.json";

export default function WeightView() {
  const headers = ["Semana", "Meta Esperada (kg)", "Ganancia Proyectada"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Curvas de Pesaje</h1>
        <p className="text-zinc-400 text-sm">Monitoreo del crecimiento semanal y ganancia diaria promedio de peso.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-white">Metas Esperadas por Etapa Biológica</h3>
          <Table headers={headers}>
            {weightStandards.weeklyWeights.map((w, idx) => (
              <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                <td className="px-4 py-3.5 font-medium text-white">Semana {w.week}</td>
                <td className="px-4 py-3.5 text-sena-green font-semibold">{w.targetKg} kg</td>
                <td className="px-4 py-3.5 text-zinc-400 text-xs">+{weightStandards.targetWeeklyGainKg} kg/sem promedio</td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-base font-bold text-white">Meta del Lote</h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            La ganancia diaria promedio esperada es de aproximadamente 750 gramos durante la etapa de acabado final (ceba).
          </p>
        </Card>
      </div>
    </div>
  );
}
