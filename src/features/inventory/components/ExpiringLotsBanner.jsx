"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, CalendarClock, ShieldAlert, ArrowUpRight } from "lucide-react";

export default function ExpiringLotsBanner({
  expiringLots = [],
  expiredLotsCount = 0,
  soonExpiringCount = 0,
}) {
  if (!Array.isArray(expiringLots) || expiringLots.length === 0) {
    return null;
  }

  const hasExpired = expiredLotsCount > 0;

  return (
    <div
      className={`rounded-3xl border p-5 shadow-xs ${
        hasExpired
          ? "border-rose-200 bg-rose-50/70"
          : "border-amber-200 bg-amber-50/70"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-2xl shrink-0 ${
              hasExpired
                ? "bg-rose-100 text-rose-600"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {hasExpired ? <ShieldAlert size={20} /> : <CalendarClock size={20} />}
          </div>
          <div>
            <h4
              className={`text-sm font-black uppercase tracking-tight ${
                hasExpired ? "text-rose-950" : "text-amber-950"
              }`}
            >
              Control de Caducidad de Lotes (Regla 30 Días · ICA)
            </h4>
            <p
              className={`text-xs font-medium mt-0.5 ${
                hasExpired ? "text-rose-800" : "text-amber-800"
              }`}
            >
              {expiredLotsCount > 0 && (
                <strong className="font-black">
                  {expiredLotsCount}{" "}
                  {expiredLotsCount === 1 ? "lote vencido" : "lotes vencidos"} (bloqueados para vacunación)
                </strong>
              )}
              {expiredLotsCount > 0 && soonExpiringCount > 0 && " · "}
              {soonExpiringCount > 0 && (
                <span>
                  {soonExpiringCount}{" "}
                  {soonExpiringCount === 1 ? "lote próximo" : "lotes próximos"} a vencer en los próximos 30 días.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {expiringLots.map((lote) => {
          const isExpired = lote.estado === "vencido";
          return (
            <Link
              key={lote.id}
              href={`/dashboard/inventory/${lote.item_id}`}
              className={`group flex flex-col justify-between rounded-2xl border bg-white p-3.5 transition-all hover:shadow-sm ${
                isExpired
                  ? "border-rose-200 hover:border-rose-400"
                  : "border-amber-200 hover:border-amber-400"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate flex items-center gap-1">
                    {lote.item_nombre}
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    Lote: <strong className="text-slate-700">{lote.numero_lote}</strong> · {lote.codigo_sku}
                  </p>
                </div>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    isExpired
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {isExpired
                    ? `Vencido (${Math.abs(lote.dias_para_vencer)}d)`
                    : lote.dias_para_vencer === 0
                      ? "Vence hoy"
                      : `En ${lote.dias_para_vencer}d`}
                </span>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <AlertTriangle
                    className={`w-3 h-3 ${isExpired ? "text-rose-500" : "text-amber-500"}`}
                  />
                  Vence: <strong className="text-slate-700">{lote.fecha_vencimiento}</strong>
                </span>
                <span className="font-bold text-slate-700">
                  {lote.cantidad_disponible} {lote.unidad_medida}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
