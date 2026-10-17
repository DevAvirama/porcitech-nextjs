"use client";

import React from "react";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { Utensils, RefreshCw } from "lucide-react";

export default function FeedingHistorySection({
  filteredRations = [],
  columns = [],
  corrales = [],
  filterCorral = "all",
  setFilterCorral,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  onOpenModal,
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">
            Historial de Raciones Servidas
          </h3>
          <p className="text-xs text-slate-500">
            Trazabilidad de alimentación por corral y turno operativo
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={filterCorral}
              onChange={(e) => setFilterCorral(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-xs outline-none cursor-pointer pr-8 shadow-xs"
            >
              <option value="all">Todos los Corrales</option>
              {corrales.map((c) => (
                <option key={c.id} value={c.id}>
                  Corral {c.codigo} ({c.fase})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-xs font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw
              size={13}
              className={isRefreshing ? "animate-spin text-emerald-600" : ""}
            />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-2">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 rounded-2xl bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : filteredRations.length === 0 ? (
          <EmptyState
            icon={Utensils}
            title="Sin suministros registrados"
            description={
              filterCorral !== "all"
                ? "No hay raciones servidas para el corral seleccionado."
                : "Aún no se han registrado entregas de alimento en la base de datos."
            }
            actionLabel="Registrar Primera Ración"
            onAction={onOpenModal}
          />
        ) : (
          <Table columns={columns} rows={filteredRations} />
        )}
      </div>
    </section>
  );
}
