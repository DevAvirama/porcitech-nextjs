"use client";

import React from "react";
import { Heart, Clock, CheckCircle2 } from "lucide-react";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { UUID_REGEX } from "@/utils/formatters";
import { SERVICE_STATUS_BADGES } from "../hooks/useReproductionData";

export default function ServicesTab({
  services,
  onOpenDiagnose,
  onOpenNewService,
}) {
  const serviceColumns = [
    {
      key: "hembra",
      header: "Cerda Madre / Arete",
      render: (row) => {
        const rawArete = row.hembra_arete;
        const hasValidArete =
          rawArete && !UUID_REGEX.test(String(rawArete).trim());
        const displayName =
          row.hembra_alias ||
          (hasValidArete ? `#${String(rawArete).trim()}` : "Cerda Madre");
        return (
          <div className="flex items-center gap-2">
            {hasValidArete && (
              <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                #{String(rawArete).trim()}
              </span>
            )}
            <span className="font-bold text-sm text-slate-900">
              {displayName}
            </span>
          </div>
        );
      },
    },
    {
      key: "tipo_servicio",
      header: "Modalidad",
      render: (row) => (
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${
            row.tipo_servicio === "inseminacion_artificial"
              ? "bg-purple-100 text-purple-700 border-purple-200"
              : "bg-blue-100 text-blue-700 border-blue-200"
          }`}
        >
          {row.tipo_servicio === "inseminacion_artificial"
            ? "Inseminación Artificial"
            : "Monta Natural"}
        </span>
      ),
    },
    {
      key: "macho",
      header: "Semental / Pajilla",
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-700">
          {row.macho_arete || row.codigo_pajilla_macho || "No especificado"}
        </span>
      ),
    },
    {
      key: "fecha_servicio",
      header: "Fecha Servicio",
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.fecha_servicio}
        </span>
      ),
    },
    {
      key: "fecha_probable_parto",
      header: "Parto Probable (+114d)",
      render: (row) => (
        <div>
          <span className="text-xs font-black text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {row.fecha_probable_parto}
          </span>
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado Confirmación",
      render: (row) => {
        const config =
          SERVICE_STATUS_BADGES[row.estado_confirmacion] || {
            label: row.estado_confirmacion || "Pendiente",
            className: "bg-slate-100 text-slate-700 border-slate-200",
          };
        return (
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${config.className}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.estado_confirmacion === "pendiente" ? (
            <button
              type="button"
              onClick={() => onOpenDiagnose(row)}
              className="px-3 py-1.5 rounded-xl bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-600 hover:text-white border border-fuchsia-200 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
              title="Confirmar diagnóstico de gestación"
            >
              <CheckCircle2 size={13} />
              Diagnosticar / Confirmar
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-slate-400 italic">
              {row.fecha_diagnostico ? `Diag: ${row.fecha_diagnostico}` : "Confirmado"}
            </span>
          )}
        </div>
      ),
    },
  ];

  if (services.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Sin servicios registrados"
        description="No hay inseminaciones ni montas naturales registradas en la base de datos."
        actionLabel="Registrar Primer Servicio"
        onAction={onOpenNewService}
      />
    );
  }

  return <Table columns={serviceColumns} rows={services} />;
}
