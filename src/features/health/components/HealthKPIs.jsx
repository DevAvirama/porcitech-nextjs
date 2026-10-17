"use client";

import React from "react";
import { Clock, Activity, Syringe, Pill } from "lucide-react";
import Card from "@/components/ui/Card";

export default function HealthKPIs({
  withdrawalCount = 0,
  totalTreatments = 0,
  vaccinesCount = 0,
  curativeCount = 0,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Retiros Activos */}
      <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Retiros Farmacológicos
          </p>
          <h4
            className={`text-2xl font-black mt-1 ${
              withdrawalCount > 0 ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {withdrawalCount} Animales
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {withdrawalCount > 0
              ? "Restricción de faenado activa"
              : "Todos aptos para beneficio"}
          </p>
        </div>
        <div
          className={`p-3 rounded-2xl ${
            withdrawalCount > 0
              ? "bg-rose-50 text-rose-600"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          <Clock className="w-6 h-6" />
        </div>
      </Card>

      {/* Total Tratamientos */}
      <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Eventos Registrados
          </p>
          <h4 className="text-2xl font-black text-slate-900 mt-1">
            {totalTreatments}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Historial acumulado en granja
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
          <Activity className="w-6 h-6" />
        </div>
      </Card>

      {/* Vacunaciones */}
      <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Vacunaciones
          </p>
          <h4 className="text-2xl font-black text-blue-600 mt-1">
            {vaccinesCount}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Inmunizaciones preventivas
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
          <Syringe className="w-6 h-6" />
        </div>
      </Card>

      {/* Tratamientos Curativos */}
      <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tratamientos Curativos
          </p>
          <h4 className="text-2xl font-black text-emerald-600 mt-1">
            {curativeCount}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Atención clínica individual
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
          <Pill className="w-6 h-6" />
        </div>
      </Card>
    </div>
  );
}
