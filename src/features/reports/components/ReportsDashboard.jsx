"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import {
  Bell,
  ShieldCheck,
  AlertTriangle,
  Info,
  TrendingUp,
  PieChart,
} from "lucide-react";

export default function ReportsDashboard({
  dbAlerts = [],
  animalsCount = 0,
  stageDistribution = {},
  dynamicKpis = [],
  kpiCols = [],
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="text-slate-400 h-5 w-5" />
        <h3 className="text-lg font-black italic text-slate-800">
          Notificaciones Recientes
        </h3>
      </div>

      {dbAlerts.length === 0 ? (
        <div className="bg-white rounded-3xl p-6 text-center border border-slate-100 shadow-xs text-slate-500">
          <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
          <p className="font-bold text-slate-700">Sin notificaciones pendientes</p>
          <p className="text-xs text-slate-400 mt-1">
            El sistema no reporta alertas sanitarias, de inventario o zootécnicas activas en este momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dbAlerts.map((alert, idx) => (
            <div
              key={alert.id || idx}
              className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden flex relative group hover:shadow-md transition-shadow"
            >
              <div
                className={`w-2 shrink-0 ${alert.nivel === "danger" ? "bg-rose-500" : "bg-amber-400"}`}
              ></div>
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start">
                  <div
                    className={`p-2 rounded-xl ${alert.nivel === "danger" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}
                  >
                    {alert.nivel === "danger" ? (
                      <AlertTriangle size={18} />
                    ) : (
                      <Info size={18} />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {alert.modulo || "Sistema"}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 mt-4">
                  {alert.mensaje}
                </h4>
                {alert.accion_sugerida && (
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {alert.accion_sugerida}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Graficos Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Gráfica de Crecimiento */}
        <Card className="p-6 border border-slate-100 flex flex-col justify-between rounded-4xl bg-white shadow-xs">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black italic text-slate-800 flex items-center gap-2">
                <TrendingUp className="text-blue-500 h-6 w-6" />{" "}
                Crecimiento Global
              </h3>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">
                {animalsCount > 0 ? "Activo" : "Sin registros"}
              </span>
            </div>
            {animalsCount === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                <TrendingUp className="w-10 h-10 text-slate-200 mb-2" />
                <p className="font-bold text-slate-600">Sin lecturas de peso registradas</p>
                <p className="text-slate-400 mt-0.5">Las curvas de crecimiento se graficarán conforme se registren pesajes.</p>
              </div>
            ) : (
              <div className="h-64 w-full relative">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="border-t border-slate-100 w-full h-0"
                    ></div>
                  ))}
                </div>
                <svg
                  className="w-full h-full relative z-10"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points="0,80 20,65 40,55 60,35 80,25 100,10"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="0,85 20,70 40,60 60,45 80,30 100,20"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="opacity-50"
                  />
                </svg>
              </div>
            )}
          </div>
          {animalsCount > 0 && (
            <div className="flex gap-4 mt-4 justify-center text-sm font-bold text-slate-500">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>{" "}
                Real
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-50"></div>{" "}
                Ideal
              </span>
            </div>
          )}
        </Card>

        {/* Distribución del Inventario */}
        <Card className="p-6 border border-slate-100 flex flex-col justify-between rounded-4xl bg-white shadow-xs">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black italic text-slate-800 flex items-center gap-2">
                <PieChart className="text-emerald-500 h-6 w-6" />{" "}
                Distribución del Plantel
              </h3>
            </div>
            <div className="flex justify-center items-center h-64">
              <div className="relative w-48 h-48">
                <svg
                  viewBox="0 0 100 100"
                  className="transform -rotate-90 w-full h-full"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="20"
                  />
                  {animalsCount > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="20"
                      strokeDasharray="251.2"
                      strokeDashoffset="60"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900">
                    {animalsCount}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Porcinos
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-bold text-slate-600">
            {Object.keys(stageDistribution).length === 0 ? (
              <div className="col-span-2 text-center text-slate-400 font-semibold py-2">
                Sin porcinos clasificados por etapas en el sistema.
              </div>
            ) : (
              Object.entries(stageDistribution).map(([stage, count], idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>{" "}
                  {stage}: {count}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* KPIs del mes */}
      <div className="mt-8">
        <h3 className="text-lg font-black italic text-slate-800 mb-4">
          Indicadores del Sistema
        </h3>
        <div className="bg-white rounded-4xl shadow-xs overflow-hidden border border-slate-100 p-2">
          <Table columns={kpiCols} rows={dynamicKpis} />
        </div>
      </div>
    </div>
  );
}
