"use client";

import React from "react";
import { Scale, TrendingUp, ShieldCheck, ShieldAlert, Layers } from "lucide-react";
import Card from "../../../components/ui/Card.jsx";
import { formatCount } from "../../../utils/formatters.js";

function StatsGrid({ kpis, isLoading = false }) {
  if (isLoading) {
    return (
      <section className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((item) => (
          <Card key={item} className="animate-pulse">
            <div className="flex items-start justify-between">
              <div className="h-3 w-28 rounded bg-slate-200" />
              <div className="h-8 w-8 rounded-xl bg-slate-200" />
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div className="h-8 w-20 rounded bg-slate-200" />
              <div className="h-5 w-16 rounded-full bg-slate-200" />
            </div>
            <div className="mt-5 h-3 rounded-full bg-slate-100">
              <div className="h-3 w-2/3 rounded-full bg-slate-200" />
            </div>
          </Card>
        ))}
      </section>
    );
  }

  const totalAnimales = Number(kpis?.total_animales ?? 0);
  const corralesActivos = Number(kpis?.total_corrales_activos ?? 0);
  const tasaOcupacion = Number(kpis?.tasa_ocupacion_porcentaje ?? 0);
  const pesoPromedio = Number(kpis?.peso_promedio_granja_kg ?? 0);
  const rawGmd = kpis?.gmd_promedio_kg;
  const hasGmdData = rawGmd !== undefined && rawGmd !== null && Number(rawGmd) > 0;
  const gmdPromedio = hasGmdData ? Number(rawGmd) : 0;
  const gmdGramos = hasGmdData ? Math.round(gmdPromedio * 1000) : null;
  const alertasSanitarias = Number(kpis?.alertas_sanitarias ?? 0);
  const alertasStock = Number(kpis?.alertas_inventario_stock ?? 0);

  // Filtrado zootécnico: alertas de maternidad y partos aplican únicamente a cerdas hembras
  const alertasMaternidad = Array.isArray(kpis?.alertas_maternidad_animales)
    ? kpis.alertas_maternidad_animales.filter(
        (a) => (a.sexo || "").toLowerCase().trim() === "hembra"
      ).length
    : Number(kpis?.alertas_maternidad ?? kpis?.partos_inminentes_hembras ?? 0);

  const totalAlertas = alertasSanitarias + alertasStock + alertasMaternidad;

  // Calculo de estilos visuales
  const ocupacionWidth = Math.min(100, Math.max(0, Math.round(tasaOcupacion)));
  const ocupacionTone =
    tasaOcupacion > 90
      ? "bg-rose-500"
      : tasaOcupacion > 80
      ? "bg-amber-500"
      : "bg-emerald-500";

  const gmdTone = !hasGmdData
    ? "bg-slate-100 text-slate-500"
    : gmdPromedio >= 0.75
    ? "bg-emerald-100 text-emerald-700"
    : gmdPromedio >= 0.6
    ? "bg-amber-100 text-amber-700"
    : "bg-rose-100 text-rose-700";

  const gmdLabel = !hasGmdData
    ? "Sin datos"
    : gmdPromedio >= 0.75
    ? "Óptimo"
    : gmdPromedio >= 0.6
    ? "Regular"
    : "Bajo";

  const pesoProgressWidth = pesoPromedio > 0 ? Math.min(100, Math.round((pesoPromedio / 120) * 100)) : 0;
  const gmdProgressWidth = hasGmdData ? Math.min(100, Math.round((gmdPromedio / 1.0) * 100)) : 0;

  return (
    <section className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {/* 1. Total Animales */}
      <Card>
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Total Animales
          </p>
          <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
            <Layers className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between gap-4">
          <p className="text-3xl font-black text-slate-950">
            {formatCount(totalAnimales)}
          </p>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {totalAnimales === 0 ? "0 Registros" : "Activos"}
          </span>
        </div>
        <div className="mt-4 h-2.5 rounded-full bg-slate-100">
          <div
            className="h-2.5 rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${totalAnimales > 0 ? 100 : 0}%` }}
          />
        </div>
      </Card>

      {/* 2. Ocupación de Corrales */}
      <Card>
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Tasa Ocupación
          </p>
          <span className="rounded-xl bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700">
            {corralesActivos} corrales
          </span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-4">
          <p className="text-3xl font-black text-slate-950">
            {tasaOcupacion === 0 ? "0%" : `${tasaOcupacion.toFixed(1)}%`}
          </p>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Capacidad
          </span>
        </div>
        <div className="mt-4 h-2.5 rounded-full bg-slate-100">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${ocupacionTone}`}
            style={{ width: `${ocupacionWidth}%` }}
          />
        </div>
      </Card>

      {/* 3. Peso Promedio Granja */}
      <Card>
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Peso Promedio
          </p>
          <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
            <Scale className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between gap-4">
          <p className="text-3xl font-black text-slate-950">
            {pesoPromedio.toFixed(1)}
            <span className="text-sm font-bold text-slate-500 ml-1">kg</span>
          </p>
          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
            Granja
          </span>
        </div>
        <div className="mt-4 h-2.5 rounded-full bg-slate-100">
          <div
            className="h-2.5 rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${pesoProgressWidth}%` }}
          />
        </div>
      </Card>

      {/* 4. GMD Promedio */}
      <Card>
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            GMD Promedio
          </p>
          <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-black text-slate-950">
              {hasGmdData ? `${gmdPromedio.toFixed(2)}` : "--"}
              <span className="text-sm font-bold text-slate-500 ml-1">kg/d</span>
            </p>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              {gmdGramos !== null ? `${gmdGramos} g/día` : "-- g/día"}
            </p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${gmdTone}`}>
            {gmdLabel}
          </span>
        </div>
        <div className="mt-2.5 h-2.5 rounded-full bg-slate-100">
          <div
            className="h-2.5 rounded-full bg-purple-500 transition-all duration-500"
            style={{ width: `${gmdProgressWidth}%` }}
          />
        </div>
      </Card>

      {/* 5. Alertas Sanitarias & Stock */}
      <Card>
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Alertas Críticas
          </p>
          <div
            className={`rounded-xl p-2 ${
              totalAlertas > 0
                ? "bg-rose-50 text-rose-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {totalAlertas > 0 ? (
              <ShieldAlert className="h-5 w-5" />
            ) : (
              <ShieldCheck className="h-5 w-5" />
            )}
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between gap-4">
          <p
            className={`text-3xl font-black ${
              totalAlertas > 0 ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {totalAlertas}
          </p>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              totalAlertas > 0
                ? "bg-rose-100 text-rose-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {totalAlertas > 0 ? "Requiere acción" : "Al día"}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Sanidad: {alertasSanitarias}</span>
          <span>Stock: {alertasStock}</span>
          {alertasMaternidad > 0 && (
            <span className="text-fuchsia-600 font-bold">
              Maternidad: {alertasMaternidad}
            </span>
          )}
        </div>
      </Card>
    </section>
  );
}

export default StatsGrid;
