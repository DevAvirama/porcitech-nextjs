"use client";

import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";

export default function FeedingView() {
  const headers = ["Lote", "Etapa", "Tipo Alimento", "Ración Diaria", "Siguiente Suministro"];
  const rations = [
    { lot: "Lote Ceba-1", stage: "Ceba", type: "Preiniciador Fase A", ration: "1.2 kg/cab", next: "07:00 AM" },
    { lot: "Lote Maternidad-2", stage: "Lactancia", type: "Alimento Lactancia", ration: "3.5 kg/cab", next: "08:00 AM" },
    { lot: "Lote Destete-3", stage: "Preceba", type: "Iniciador Porcino", ration: "0.8 kg/cab", next: "07:30 AM" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Control Nutricional</h1>
        <p className="text-zinc-400 text-sm">Raciones, planes alimenticios y stock nutricional de los porcinos.</p>
      </div>

      <Card className="space-y-4">
        <h3 className="text-base font-bold text-white">Cronograma de Alimentación Activo</h3>
        <Table headers={headers}>
          {rations.map((rat, idx) => (
            <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
              <td className="px-4 py-3.5 font-medium text-white">{rat.lot}</td>
              <td className="px-4 py-3.5">{rat.stage}</td>
              <td className="px-4 py-3.5">{rat.type}</td>
              <td className="px-4 py-3.5 font-semibold text-sena-green">{rat.ration}</td>
              <td className="px-4 py-3.5 text-zinc-400 text-xs">{rat.next}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
