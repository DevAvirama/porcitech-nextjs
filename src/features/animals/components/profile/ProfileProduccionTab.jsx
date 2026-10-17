"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { TrendingUp, Scale } from "lucide-react";
import { formatDateTime } from "@/utils/formatters";

export default function ProfileProduccionTab({
  pesajes = [],
  onNavigateWeight,
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
        <TrendingUp className="text-blue-500" /> Curva de Crecimiento y Pesajes del Ejemplar
      </h3>
      {pesajes.length === 0 ? (
        <div className="py-6">
          <EmptyState
            icon={Scale}
            title="Sin lecturas de peso registradas"
            description="Aún no se han registrado lecturas de peso (manuales o por visión artificial) para este ejemplar en la base de datos."
            actionLabel="+ Registrar Pesaje"
            onAction={onNavigateWeight}
          />
        </div>
      ) : (
        <>
          <Card className="bg-slate-50 border border-slate-100 shadow-none h-64 relative overflow-hidden flex flex-col justify-end p-0 rounded-2xl">
            <svg
              className="w-full h-48"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {pesajes.map((pt, idx) => {
                const x = (idx / Math.max(1, pesajes.length - 1)) * 100;
                const maxW = Math.max(...pesajes.map((p) => Number(p.peso_kg) || 120), 100);
                const y = 100 - ((Number(pt.peso_kg) || 0) / maxW) * 80;
                return (
                  <circle
                    key={idx}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="4"
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                );
              })}
              <polyline
                points={pesajes
                  .map((pt, idx) => {
                    const x = (idx / Math.max(1, pesajes.length - 1)) * 100;
                    const maxW = Math.max(...pesajes.map((p) => Number(p.peso_kg) || 120), 100);
                    const y = 100 - ((Number(pt.peso_kg) || 0) / maxW) * 80;
                    return `${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="absolute top-4 right-6 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-sm text-xs font-bold space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-500 rounded-full"></div> Registros de Báscula / IA ({pesajes.length})
              </div>
            </div>
          </Card>

          <div className="border border-slate-100 rounded-3xl overflow-hidden mt-6">
            <Table
              columns={[
                {
                  header: "Fecha de Pesaje",
                  key: "tiempo",
                  render: (r) => formatDateTime(r.tiempo),
                },
                {
                  header: "Peso Registrado",
                  key: "peso_kg",
                  render: (r) => (
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {r.peso_kg} kg
                    </span>
                  ),
                },
                {
                  header: "Método",
                  key: "metodo",
                  render: (r) => (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {r.metodo === "ia_vision" ? "Visión IA" : "Báscula Manual"}
                    </span>
                  ),
                },
                {
                  header: "Observaciones",
                  key: "observaciones",
                  render: (r) => r.observaciones || "Control periódico",
                },
              ]}
              rows={pesajes}
            />
          </div>
        </>
      )}
    </div>
  );
}
