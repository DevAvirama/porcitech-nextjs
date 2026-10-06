"use client";

import React from "react";
import {
  Scale,
  ShieldAlert,
  Utensils,
  Package,
  Activity,
  Clock,
  User,
} from "lucide-react";
import Card from "../../../components/ui/Card.jsx";
import Table from "../../../components/ui/Table.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import { formatDateTime } from "../../../utils/formatters.js";

const TYPE_CONFIG = {
  pesaje: {
    label: "Pesaje IA",
    icon: Scale,
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  sanidad: {
    label: "Sanidad",
    icon: ShieldAlert,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  alimentacion: {
    label: "Alimentación",
    icon: Utensils,
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
  },
  inventario: {
    label: "Inventario",
    icon: Package,
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  animal: {
    label: "Animal",
    icon: Activity,
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

function RecentActivityTable({ rows, activities, isLoading = false }) {
  const data = activities || rows || [];

  const columns = [
    {
      key: "tipo",
      header: "Módulo",
      render: (row) => {
        const config = TYPE_CONFIG[row.tipo?.toLowerCase()] || {
          label: row.tipo || "General",
          icon: Activity,
          badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
        };
        const Icon = config.icon;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.badgeClass}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </span>
        );
      },
    },
    {
      key: "titulo",
      header: "Actividad / Evento",
      render: (row) => {
        const arete = row.metadata?.codigo_arete || row.animal_arete || row.arete;
        return (
          <div className="py-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-slate-900 text-sm">
                {row.titulo || "Evento operativo"}
              </p>
              {arete && !row.titulo?.includes(arete) && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono border border-slate-200">
                  #{arete}
                </span>
              )}
            </div>
            {row.descripcion && (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {row.descripcion}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "usuario",
      header: "Responsable",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
          <User className="h-3 w-3 text-slate-400" />
          {row.usuario || "Sistema"}
        </span>
      ),
    },
    {
      key: "tiempo",
      header: "Momento (COT)",
      render: (row) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDateTime(row.tiempo)}
        </span>
      ),
    },
  ];

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-950">
              Actividad Reciente
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Últimos eventos registrados en tiempo real por el equipo operativo
            </p>
          </div>
          <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            {data.length} eventos
          </span>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-2xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : data.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Sin actividades recientes"
              description="No se han registrado eventos o movimientos en la granja recientemente."
            />
          ) : (
            <Table columns={columns} rows={data} />
          )}
        </div>
      </div>
    </Card>
  );
}

export default RecentActivityTable;
