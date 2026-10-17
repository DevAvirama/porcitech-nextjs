"use client";

import React from "react";
import { Activity } from "lucide-react";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";

export default function HealthTreatmentsTable({
  isLoading = false,
  treatments = [],
  columns = [],
  hasActiveFilters = false,
  onRegisterClick,
}) {
  return (
    <section className="bg-white rounded-3xl shadow-sm overflow-hidden p-2 border border-slate-100">
      {isLoading ? (
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 rounded-2xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : treatments.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Sin registros sanitarios"
          description={
            hasActiveFilters
              ? "No se encontraron tratamientos que coincidan con los filtros aplicados."
              : "Aún no se han registrado eventos clínicos o vacunaciones en la base de datos."
          }
          actionLabel="Registrar Primer Tratamiento"
          onAction={onRegisterClick}
        />
      ) : (
        <Table columns={columns} rows={treatments} />
      )}
    </section>
  );
}
