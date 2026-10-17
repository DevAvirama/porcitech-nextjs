"use client";

import React from "react";
import { Plus, RefreshCw, ClipboardList } from "lucide-react";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { formatDateTime } from "@/utils/formatters";
import { MOVEMENT_CONFIG } from "../hooks/useInventoryData";

export default function InventoryMovementsTab({
  movements,
  isLoading,
  onOpenNewMovement,
}) {
  const movementColumns = [
    {
      key: "fecha",
      header: "Fecha / Momento (COT)",
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
          {formatDateTime(row.fecha_movimiento)}
        </span>
      ),
    },
    {
      key: "tipo",
      header: "Operación",
      render: (row) => {
        const config =
          MOVEMENT_CONFIG[row.tipo_movimiento] || {
            label: row.tipo_movimiento || "Movimiento",
            badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
            icon: RefreshCw,
            sign: "",
            signColor: "text-slate-600",
          };
        const Icon = config.icon;

        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${config.badgeClass}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </span>
        );
      },
    },
    {
      key: "item",
      header: "Insumo Afectado",
      render: (row) => (
        <span className="font-bold text-slate-900 text-sm">
          {row.item_nombre || "Insumo"}
        </span>
      ),
    },
    {
      key: "cantidad",
      header: "Cantidad",
      render: (row) => {
        const config = MOVEMENT_CONFIG[row.tipo_movimiento] || {
          sign: "",
          signColor: "text-slate-900",
        };
        return (
          <span className={`font-black text-sm ${config.signColor}`}>
            {config.sign}
            {Number(row.cantidad).toLocaleString("es-CO")}
          </span>
        );
      },
    },
    {
      key: "motivo",
      header: "Motivo / Justificación",
      render: (row) => (
        <span className="text-xs text-slate-600 line-clamp-2">
          {row.motivo || "Sin justificación"}
        </span>
      ),
    },
    {
      key: "usuario",
      header: "Responsable",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
          {row.usuario_nombre || "Sistema"}
        </span>
      ),
    },
  ];

  return (
    <section className="bg-white rounded-3xl shadow-sm overflow-hidden p-2 border border-slate-100">
      <div className="p-4 flex items-center justify-between border-b border-slate-100">
        <div>
          <h3 className="text-lg font-black text-slate-900">
            Auditoría de Movimientos Físicos (Kardex)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Trazabilidad inmutable de entradas por compra, consumos de lotes y ajustes por merma
          </p>
        </div>
        <Button
          onClick={onOpenNewMovement}
          tone="primary"
          className="text-xs font-bold py-2 px-3 rounded-xl!"
        >
          <Plus size={14} className="mr-1" />
          Nuevo Movimiento
        </Button>
      </div>

      {isLoading ? (
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 rounded-2xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : movements.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Sin movimientos registrados"
          description="No hay entradas o salidas físicas registradas en el Kardex de inventario."
          actionLabel="Registrar Primer Movimiento"
          onAction={onOpenNewMovement}
        />
      ) : (
        <Table columns={movementColumns} rows={movements} />
      )}
    </section>
  );
}
