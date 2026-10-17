"use client";

import React from "react";
import { Baby } from "lucide-react";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { formatDateTime, UUID_REGEX } from "@/utils/formatters";

export default function FarrowingsTab({
  farrowings,
  onOpenNewFarrowing,
}) {
  const farrowingColumns = [
    {
      key: "hembra",
      header: "Cerda Madre",
      render: (row) => {
        const rawArete = row.hembra_arete;
        const hasValidArete =
          rawArete && !UUID_REGEX.test(String(rawArete).trim());
        return (
          <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
            {hasValidArete ? `#${String(rawArete).trim()}` : (row.hembra_alias || "Cerda")}
          </span>
        );
      },
    },
    {
      key: "corral",
      header: "Corral Maternidad",
      render: (row) => (
        <span className="text-xs font-bold text-slate-700">
          {row.corral_maternidad_codigo || "Paridera"}
        </span>
      ),
    },
    {
      key: "fecha_parto",
      header: "Fecha de Parto (COT)",
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {formatDateTime(row.fecha_parto)}
        </span>
      ),
    },
    {
      key: "lechones",
      header: "Camada (V / M / Mom)",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black">
            {row.nacidos_vivos} vivos
          </span>
          <span className="text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
            {row.nacidos_muertos || 0} m
          </span>
          <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
            {row.momias || 0} mom
          </span>
        </div>
      ),
    },
    {
      key: "peso",
      header: "Peso Camada Total",
      render: (row) => {
        const peso = Number(row.peso_camada_total_kg) || 0;
        const vivos = Number(row.nacidos_vivos) || 1;
        const promedio = vivos > 0 ? (peso / vivos).toFixed(2) : "0.00";
        return (
          <div>
            <span className="font-black text-slate-900 text-sm">{peso} kg</span>
            <span className="block text-[10px] text-slate-400">
              Prom: {promedio} kg/lechón
            </span>
          </div>
        );
      },
    },
    {
      key: "observaciones",
      header: "Observaciones",
      render: (row) => (
        <span className="text-xs text-slate-500 line-clamp-1">
          {row.observaciones || "Sin novedades"}
        </span>
      ),
    },
  ];

  if (farrowings.length === 0) {
    return (
      <EmptyState
        icon={Baby}
        title="Sin partos registrados"
        description="No se han registrado alumbramientos ni camadas en PostgreSQL."
        actionLabel="Registrar Primer Parto"
        onAction={onOpenNewFarrowing}
      />
    );
  }

  return <Table columns={farrowingColumns} rows={farrowings} />;
}
