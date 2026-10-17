"use client";

import React from "react";
import { Activity } from "lucide-react";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { UUID_REGEX } from "@/utils/formatters";

export default function WeaningsTab({
  weanings,
  onOpenNewWeaning,
}) {
  const weaningColumns = [
    {
      key: "hembra",
      header: "Cerda Madre",
      render: (row) => {
        const rawArete = row.hembra_arete;
        const hasValidArete =
          rawArete && !UUID_REGEX.test(String(rawArete).trim());
        return (
          <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
            {hasValidArete ? `#${String(rawArete).trim()}` : (row.hembra_alias || "Madre")}
          </span>
        );
      },
    },
    {
      key: "fecha",
      header: "Fecha Destete",
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.fecha_destete}
        </span>
      ),
    },
    {
      key: "lechones",
      header: "Lechones Destetados",
      render: (row) => (
        <span className="font-black text-sm text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
          {row.lechones_destetados} lechones
        </span>
      ),
    },
    {
      key: "peso",
      header: "Peso Total Lote",
      render: (row) => {
        const peso = Number(row.peso_total_kg) || 0;
        const count = Number(row.lechones_destetados) || 1;
        const prom = count > 0 ? (peso / count).toFixed(2) : "0.00";
        return (
          <div>
            <span className="font-black text-slate-900 text-sm">{peso} kg</span>
            <span className="block text-[10px] text-slate-400">
              Prom: {prom} kg/lechón
            </span>
          </div>
        );
      },
    },
    {
      key: "lactancia",
      header: "Días Lactancia",
      render: (row) => (
        <span className="text-xs font-bold text-slate-700">
          {row.dias_lactancia} días
        </span>
      ),
    },
    {
      key: "destino",
      header: "Corral Destino (Precebo)",
      render: (row) => (
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
          {row.corral_destino_codigo || "Corral Precebo"}
        </span>
      ),
    },
  ];

  if (weanings.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Sin destetes registrados"
        description="No se han registrado destetes de camadas hacia corrales de precebo."
        actionLabel="Registrar Primer Destete"
        onAction={onOpenNewWeaning}
      />
    );
  }

  return <Table columns={weaningColumns} rows={weanings} />;
}
