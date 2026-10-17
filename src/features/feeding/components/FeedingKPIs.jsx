"use client";

import React from "react";
import Card from "@/components/ui/Card";
import { Scale, Utensils, Warehouse, Database } from "lucide-react";

export default function FeedingKPIs({
  totalKgServidos = 0,
  rationsCount = 0,
  corralesAlimentados = 0,
  totalStockAlimento = 0,
  feedItemsCount = 0,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* KPI 1: Total Alimento Servido */}
      <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Alimento Servido
          </p>
          <h4 className="text-2xl font-black text-slate-900 mt-1">
            {totalKgServidos.toLocaleString("es-CO")}{" "}
            <span className="text-sm font-bold text-slate-500">kg</span>
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Consumo acumulado registrado
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-orange-50 text-orange-600">
          <Scale className="w-6 h-6" />
        </div>
      </Card>

      {/* KPI 2: Raciones Suministradas */}
      <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Raciones Suministradas
          </p>
          <h4 className="text-2xl font-black text-slate-900 mt-1">
            {rationsCount} Entregas
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Eventos nutricionales en granja
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
          <Utensils className="w-6 h-6" />
        </div>
      </Card>

      {/* KPI 3: Corrales Atendidos */}
      <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Corrales Atendidos
          </p>
          <h4 className="text-2xl font-black text-emerald-600 mt-1">
            {corralesAlimentados} Corrales
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Con raciones asignadas
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
          <Warehouse className="w-6 h-6" />
        </div>
      </Card>

      {/* KPI 4: Stock en Bodega / Silos */}
      <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Stock en Bodega / Silos
          </p>
          <h4 className="text-2xl font-black text-purple-600 mt-1">
            {totalStockAlimento.toLocaleString("es-CO")} Unds
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {feedItemsCount} referencias de alimento
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
          <Database className="w-6 h-6" />
        </div>
      </Card>
    </div>
  );
}
