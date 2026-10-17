"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import Card from "@/components/ui/Card";
import { UUID_REGEX } from "@/utils/formatters";

export default function WithdrawalAlertsBanner({ withdrawalAlerts = [] }) {
  if (!withdrawalAlerts || withdrawalAlerts.length === 0) return null;

  return (
    <Card className="rounded-3xl border border-rose-200 bg-linear-to-r from-rose-50 to-amber-50 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-md shadow-rose-500/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-rose-950">
              Alerta Sanitaria: Animales bajo Tiempo de Retiro Activo ({withdrawalAlerts.length})
            </h3>
            <p className="text-xs text-rose-800 mt-0.5">
              Restricción estricta de beneficio/faenado según normativa ICA. Los siguientes animales recibieron fármacos con periodo de carencia pendiente:
            </p>
          </div>
        </div>
        <span className="rounded-full bg-rose-200 text-rose-900 px-3 py-1 text-xs font-black shrink-0">
          Bloqueo de Despacho
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {withdrawalAlerts.map((alert, idx) => {
          const rawArete = alert.animal_arete;
          const hasValidArete =
            rawArete && !UUID_REGEX.test(String(rawArete).trim());
          const displayName =
            alert.animal_alias ||
            (hasValidArete ? `#${String(rawArete).trim()}` : "Cerdo en retiro");

          return (
            <div
              key={alert.id || alert.animal_id || idx}
              className="p-3.5 bg-white/90 border border-rose-200 rounded-2xl shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {hasValidArete ? `#${String(rawArete).trim()}` : displayName}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {alert.corral_codigo ? `Corral: ${alert.corral_codigo}` : ""}
                </span>
              </div>

              <div className="my-2">
                <p className="text-xs font-black text-slate-900">
                  {alert.producto_nombre || "Tratamiento farmacológico"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Retiro total: {alert.tiempo_retiro_dias} días
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                <span className="text-slate-500">Cierre de retiro:</span>
                <span className="text-rose-600 font-black">
                  {alert.dias_restantes !== undefined
                    ? `${alert.dias_restantes} días restantes`
                    : alert.fecha_fin_retiro || "Pendiente"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
