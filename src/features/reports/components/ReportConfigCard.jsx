"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { FileText } from "lucide-react";

export default function ReportConfigCard({
  selectedReportType = "consolidado",
  setSelectedReportType,
  dateRange = "30dias",
  setDateRange,
  selectedBatch = "todos",
  setSelectedBatch,
  corrales = [],
  isGenerating = false,
  onGenerateReport,
}) {
  return (
    <Card className="p-6 md:p-8 bg-white border border-slate-100 shadow-sm rounded-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <FileText size={20} />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">
            Generar Nuevo Informe Oficial
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Selecciona los parámetros de consulta para emitir el reporte.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* 1. Tipo de Reporte */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Tipo de Informe
          </label>
          <div className="relative">
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer appearance-none text-sm"
            >
              <option value="consolidado">
                Consolidado General (KPIs)
              </option>
              <option value="produccion">
                Crecimiento y Peso de Lotes
              </option>
              <option value="salud">
                Sanitario (Clínico y Vacunación)
              </option>
              <option value="reproduccion">Reproducción y Partos</option>
              <option value="nutricion">Alimentación e Inventario</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              ▼
            </div>
          </div>
        </div>

        {/* 2. Rango de fecha */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Rango de Datos
          </label>
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer appearance-none text-sm"
            >
              <option value="7dias">Últimos 7 días</option>
              <option value="30dias">Últimos 30 días</option>
              <option value="trimestre">Este Trimestre (90 días)</option>
              <option value="historico">Histórico Completo</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              ▼
            </div>
          </div>
        </div>

        {/* 3. Corral / Lote */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Foco por Corral
          </label>
          <div className="relative">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer appearance-none text-sm"
            >
              <option value="todos">Todos los Corrales</option>
              {corrales.map((c) => (
                <option key={c.id} value={c.id}>
                  Corral {c.codigo} ({c.fase || "Producción"})
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              ▼
            </div>
          </div>
        </div>

        {/* Botón Generar Reporte */}
        <div>
          <Button
            onClick={onGenerateReport}
            disabled={isGenerating}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl border-none shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-center text-sm h-[46px]"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Procesando...
              </>
            ) : (
              <>
                <FileText size={18} />
                Generar Reporte Oficial
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
