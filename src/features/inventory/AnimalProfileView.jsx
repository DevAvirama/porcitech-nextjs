"use client";

import Card from "@/components/ui/Card";

export default function AnimalProfileView() {
  const profile = {
    code: "SIP-001",
    breed: "Landrace",
    birthdate: "2026-02-15",
    gender: "Hembra",
    weight: 85,
    motherCode: "SIP-M02",
    fatherCode: "SIP-F14",
    status: "activo",
    observations: "Desarrollo biológico óptimo. Buena ganancia de peso diaria.",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Ficha Técnica de Porcino</h1>
        <p className="text-zinc-400 text-sm">Detalle genealógico, físico e histórico individual del animal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-6">
          <div className="border-b border-zinc-900 pb-4">
            <h3 className="text-lg font-semibold text-white">Datos Biológicos</h3>
            <p className="text-xs text-zinc-500">Información básica del espécimen.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-zinc-300">
            <div>
              <span className="text-xs text-zinc-500 block">Código Único</span>
              <strong className="text-white text-lg">{profile.code}</strong>
            </div>
            <div>
              <span className="text-xs text-zinc-500 block">Raza</span>
              <strong className="text-white text-lg">{profile.breed}</strong>
            </div>
            <div>
              <span className="text-xs text-zinc-500 block">Fecha de Nacimiento</span>
              <span>{profile.birthdate}</span>
            </div>
            <div>
              <span className="text-xs text-zinc-500 block">Sexo</span>
              <span>{profile.gender}</span>
            </div>
            <div>
              <span className="text-xs text-zinc-500 block">Peso Actual</span>
              <span className="text-rose-400 font-semibold">{profile.weight} kg</span>
            </div>
            <div>
              <span className="text-xs text-zinc-500 block">Estado Actual</span>
              <span className="text-emerald-400 font-semibold capitalize">{profile.status}</span>
            </div>
          </div>
        </Card>

        <Card className="space-y-6">
          <div className="border-b border-zinc-900 pb-4">
            <h3 className="text-lg font-semibold text-white">Genealogía</h3>
            <p className="text-xs text-zinc-500">Línea parental del porcino.</p>
          </div>
          <div className="space-y-4 text-sm text-zinc-300">
            <div>
              <span className="text-xs text-zinc-500 block">Madre</span>
              <span className="font-semibold text-zinc-100">{profile.motherCode}</span>
            </div>
            <div>
              <span className="text-xs text-zinc-500 block">Padre</span>
              <span className="font-semibold text-zinc-100">{profile.fatherCode}</span>
            </div>
            <div>
              <span className="text-xs text-zinc-500 block">Observaciones</span>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{profile.observations}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
