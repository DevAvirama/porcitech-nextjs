"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function ReportsView() {
  const reportsList = [
    { title: "Ganancia de Peso Lote A", type: "PDF / Excel", desc: "Histórico consolidado mensual de pesajes." },
    { title: "Reporte Clínico y Sanitario", type: "PDF", desc: "Listado de vacunas aplicadas y alertas del periodo." },
    { title: "Consumo e Inventario", type: "Excel", desc: "Raciones consumidas y balance de existencias de almacén." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">Reportes y Analíticas</h1>
        <p className="text-zinc-400 text-sm">Descarga y consolidación de datos de producción.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportsList.map((rep, idx) => (
          <Card key={idx} className="flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-sena-green uppercase tracking-wider">{rep.type}</span>
              <h3 className="text-base font-bold text-white">{rep.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{rep.desc}</p>
            </div>
            <Button variant="secondary" className="w-full">
              Exportar Informe
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
