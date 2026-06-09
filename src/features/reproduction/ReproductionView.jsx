"use client";

import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import reproductionStandards from "./data/reproductionStandards.json";

export default function ReproductionView() {
  const headers = ["Madre", "Fecha Monta", "Estado Gestación", "Fecha Probable Parto", "Detalles"];
  const cycles = [
    { mother: "SIP-M02", mateDate: "2026-03-01", status: "Confirmado", expected: "2026-06-23" },
    { mother: "SIP-M05", mateDate: "2026-04-10", status: "Confirmado", expected: "2026-08-02" },
    { mother: "SIP-M08", mateDate: "2026-05-20", status: "Pendiente Confirmación", expected: "2026-09-11" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Control Reproductivo</h1>
        <p className="text-zinc-400 text-sm">Monitoreo de montas, inseminación, gestación y nacimientos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-white">Madres en Periodo Gestacional</h3>
          <Table headers={headers}>
            {cycles.map((cyc, idx) => (
              <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                <td className="px-4 py-3.5 font-medium text-white">{cyc.mother}</td>
                <td className="px-4 py-3.5">{cyc.mateDate}</td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      cyc.status === "Confirmado"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {cyc.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-semibold text-rose-400">{cyc.expected}</td>
                <td className="px-4 py-3.5 text-zinc-500 text-xs">Período: {reproductionStandards.gestationPeriodDays} días</td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-base font-bold text-white">Estándares de Gestación</h3>
          <div className="space-y-3">
            {Object.entries(reproductionStandards.stages).map(([key, desc], idx) => (
              <div key={idx} className="p-3 rounded bg-zinc-900/40 text-xs border border-zinc-900 space-y-1">
                <span className="font-bold text-rose-400 capitalize">{key}</span>
                <p className="text-zinc-300 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
