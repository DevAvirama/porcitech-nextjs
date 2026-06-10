"use client";

import Card from "@/components/ui/Card";
import protocols from "./data/biosecurityProtocols.json";

export default function BiosecurityView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Protocolos de Bioseguridad</h1>
        <p className="text-zinc-400 text-sm">Lineamientos y controles para mitigar riesgos biológicos en granjas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {protocols.map((protocol) => (
          <Card key={protocol.id} className="space-y-4">
            <span className="text-xs font-semibold text-sena-green uppercase tracking-wider">
              {protocol.required ? "Requerido" : "Opcional"}
            </span>
            <h3 className="text-lg font-bold text-white">{protocol.name}</h3>
            <div className="flex justify-between items-center text-xs text-zinc-400">
              <span>Frecuencia:</span>
              <span className="font-semibold text-zinc-200">{protocol.frequency}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
