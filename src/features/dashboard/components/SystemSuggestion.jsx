"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Info,
  ArrowRight,
} from "lucide-react";
import Card from "../../../components/ui/Card.jsx";
import Button from "../../../components/ui/Button.jsx";

const MODULE_ROUTES = {
  sanidad: { path: "/dashboard/health", label: "Ver Sanidad" },
  inventario: { path: "/dashboard/inventory", label: "Ver Inventario" },
  manejo: { path: "/dashboard/animals", label: "Ver Animales" },
  pesaje: { path: "/dashboard/weight", label: "Ver Pesaje" },
  alimentacion: { path: "/dashboard/feeding", label: "Ver Alimentación" },
};

function SystemSuggestion({ alerts = [], isLoading = false }) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card className="animate-pulse bg-slate-900 text-white">
        <div className="h-4 w-32 rounded bg-slate-800" />
        <div className="mt-4 h-8 w-3/4 rounded bg-slate-800" />
        <div className="mt-4 h-16 w-full rounded bg-slate-800" />
        <div className="mt-6 h-10 w-36 rounded-xl bg-slate-800" />
      </Card>
    );
  }

  // Estado Óptimo cuando no hay alertas
  if (!alerts || alerts.length === 0) {
    return (
      <Card className="bg-emerald-950 text-white shadow-xl shadow-emerald-900/20 border-emerald-800/40">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="h-5 w-5" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em]">
            Estado del Sistema
          </p>
        </div>
        <h3 className="mt-4 text-3xl font-black text-white">Operación Estable</h3>
        <p className="mt-3 text-sm leading-relaxed text-emerald-200/80">
          Bioseguridad e inventarios al día. No se registran alertas críticas de
          retiro farmacológico, desabastecimiento de alimento ni retrasos en la
          ganancia de peso en los lotes activos.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-900/50 px-3.5 py-2 text-xs font-semibold text-emerald-300 border border-emerald-700/50">
          <ShieldCheck className="h-4 w-4" />
          Monitoreo analítico activo con TimescaleDB
        </div>
      </Card>
    );
  }

  // Ordenar por severidad: danger > warning > info
  const priorityOrder = { danger: 1, warning: 2, info: 3 };
  const sortedAlerts = [...alerts].sort(
    (a, b) =>
      (priorityOrder[a.nivel] || 99) - (priorityOrder[b.nivel] || 99)
  );

  const mainAlert = sortedAlerts[0];
  const secondaryAlerts = sortedAlerts.slice(1);

  // Configuración de estilo según nivel
  const isDanger = mainAlert.nivel === "danger";
  const isWarning = mainAlert.nivel === "warning";

  const bgCard = isDanger
    ? "bg-rose-950 shadow-rose-900/20 border-rose-800/40"
    : isWarning
    ? "bg-amber-950 shadow-amber-900/20 border-amber-800/40"
    : "bg-sky-950 shadow-sky-900/20 border-sky-800/40";

  const textBadge = isDanger
    ? "text-rose-400"
    : isWarning
    ? "text-amber-400"
    : "text-sky-400";

  const textDesc = isDanger
    ? "text-rose-200/90"
    : isWarning
    ? "text-amber-200/90"
    : "text-sky-200/90";

  const btnClass = isDanger
    ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/30 text-white"
    : isWarning
    ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30 text-slate-950"
    : "bg-sky-500 hover:bg-sky-600 shadow-sky-500/30 text-white";

  const HeaderIcon = isDanger ? ShieldAlert : isWarning ? AlertTriangle : Info;
  const headerLabel = isDanger
    ? "Prioridad Crítica"
    : isWarning
    ? "Atención Requerida"
    : "Sugerencia Operativa";

  const routeConfig =
    MODULE_ROUTES[mainAlert.modulo?.toLowerCase()] || {
      path: "/dashboard",
      label: "Gestionar Módulo",
    };

  return (
    <Card className={`${bgCard} text-white shadow-xl flex flex-col justify-between`}>
      <div>
        <div className={`flex items-center justify-between ${textBadge}`}>
          <div className="flex items-center gap-2">
            <HeaderIcon className="h-5 w-5" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em]">
              {headerLabel}
            </p>
          </div>
          {alerts.length > 1 && (
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white">
              +{secondaryAlerts.length} pendientes
            </span>
          )}
        </div>

        <h3 className="mt-4 text-2xl font-black capitalize text-white">
          {mainAlert.modulo ? `Alerta en ${mainAlert.modulo}` : "Alerta de Sistema"}
        </h3>

        <p className={`mt-3 text-sm leading-relaxed ${textDesc}`}>
          {mainAlert.mensaje}
        </p>

        {mainAlert.accion_sugerida && (
          <div className="mt-4 rounded-xl bg-black/25 p-3 border border-white/10">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Acción sugerida:
            </p>
            <p className="mt-1 text-xs text-white/90 leading-relaxed">
              {mainAlert.accion_sugerida}
            </p>
          </div>
        )}

        {/* Alertas secundarias condensadas si existen */}
        {secondaryAlerts.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Otras notificaciones activas:
            </p>
            {secondaryAlerts.map((alert) => (
              <div
                key={alert.id || alert.mensaje}
                className="flex items-start gap-2 text-xs text-slate-300 bg-white/5 p-2 rounded-lg"
              >
                <span className="font-semibold text-white capitalize">
                  {alert.modulo}:
                </span>
                <span className="line-clamp-1">{alert.mensaje}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button
          className={`w-full justify-center border-none shadow-md ${btnClass}`}
          onClick={() => router.push(routeConfig.path)}
        >
          {routeConfig.label}
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

export default SystemSuggestion;
