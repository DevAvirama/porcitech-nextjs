"use client";

import React from "react";
import { Heart, CalendarDays, Baby, Activity } from "lucide-react";
import Card from "@/components/ui/Card";

export default function ReproductionKPIs({
  gestacionesConfirmadas,
  proximosPartos,
  totalNacidosVivos,
  totalDestetados,
  farrowingsCount,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Hembras Gestantes
          </p>
          <h4 className="text-2xl font-black text-fuchsia-600 mt-1">
            {gestacionesConfirmadas} Cerda{gestacionesConfirmadas === 1 ? "" : "s"}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Confirmadas con diagnóstico positivo
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-fuchsia-50 text-fuchsia-600">
          <Heart className="w-6 h-6" />
        </div>
      </Card>

      <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Partos Inminentes (14d)
          </p>
          <h4 className="text-2xl font-black text-pink-600 mt-1">
            {proximosPartos} Parto{proximosPartos === 1 ? "" : "s"}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Preparación de parideras
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-pink-50 text-pink-600">
          <CalendarDays className="w-6 h-6" />
        </div>
      </Card>

      <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Lechones Vivos Nacidos
          </p>
          <h4 className="text-2xl font-black text-emerald-600 mt-1">
            {totalNacidosVivos.toLocaleString("es-CO")}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            En {farrowingsCount} partos registrados
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
          <Baby className="w-6 h-6" />
        </div>
      </Card>

      <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Lechones Destetados
          </p>
          <h4 className="text-2xl font-black text-purple-600 mt-1">
            {totalDestetados.toLocaleString("es-CO")}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Transición a corrales de precebo
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
          <Activity className="w-6 h-6" />
        </div>
      </Card>
    </div>
  );
}
