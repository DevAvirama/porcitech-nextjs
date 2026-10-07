"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Info,
  ArrowRight,
} from "lucide-react";
import Card from "../../../components/ui/Card.jsx";

const MODULE_ROUTES = {
  sanidad: { path: "/dashboard/health", label: "Ver Sanidad" },
  inventario: { path: "/dashboard/inventory", label: "Ver Inventario" },
  manejo: { path: "/dashboard/animals", label: "Ver Animales" },
  pesaje: { path: "/dashboard/weight", label: "Ver Pesaje" },
  alimentacion: { path: "/dashboard/feeding", label: "Ver Alimentación" },
  reproduccion: { path: "/dashboard/reproduction", label: "Ver Reproducción" },
  maternidad: { path: "/dashboard/reproduction", label: "Ver Maternidad" },
};

function SystemSuggestion({ alerts = [], isLoading = false }) {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden border border-slate-100 animate-pulse flex flex-col justify-between">
        <div>
          <div className="h-4 w-32 rounded-lg bg-slate-100" />
          <div className="mt-4 h-7 w-3/4 rounded-lg bg-slate-100" />
          <div className="mt-4 h-16 w-full rounded-xl bg-slate-100" />
          <div className="mt-4 h-20 w-full rounded-xl bg-slate-100" />
          <div className="mt-4 h-12 w-full rounded-xl bg-slate-100" />
        </div>
        <div className="mt-6 h-12 w-full rounded-xl bg-slate-100" />
      </Card>
    );
  }

  // Filtrado zootécnico: Alertas de partos o maternidad aplican estrictamente a hembras
  const validAlerts = (alerts || []).filter((alert) => {
    const isReproOrMaternity =
      alert.modulo === "reproduccion" ||
      alert.modulo === "maternidad" ||
      (alert.mensaje && (
        alert.mensaje.toLowerCase().includes("parto") ||
        alert.mensaje.toLowerCase().includes("maternidad") ||
        alert.mensaje.toLowerCase().includes("gestaci")
      ));

    // Si la alerta contiene datos de animal, verificar que sea hembra
    if (isReproOrMaternity && alert.animal) {
      const sexo = (alert.animal.sexo || "").toLowerCase().trim();
      return sexo === "hembra";
    }
    return true;
  });

  // Estado Óptimo cuando no hay alertas
  if (!validAlerts || validAlerts.length === 0) {
    return (
      <Card className="relative overflow-hidden border border-slate-100 shadow-sm flex flex-col justify-between">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              SISTEMA AL DÍA
            </span>
          </div>
          <h3 className="mt-4 text-2xl font-black text-slate-950">
            Sin Alertas Críticas Pendientes
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Todos los porcinos se encuentran dentro de los parámetros zootécnicos y sanitarios normales.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-50/80 px-3.5 py-2 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <ShieldCheck className="h-4 w-4" />
            Monitoreo analítico activo con TimescaleDB y FastAPI
          </div>
        </div>
      </Card>
    );
  }

  // Ordenar por severidad: danger > warning > info
  const priorityOrder = { danger: 1, warning: 2, info: 3 };
  const sortedAlerts = [...validAlerts].sort(
    (a, b) =>
      (priorityOrder[a.nivel] || 99) - (priorityOrder[b.nivel] || 99)
  );

  const mainAlert = sortedAlerts[0];
  const secondaryAlerts = sortedAlerts.slice(1);

  // Configuración de estilo según nivel
  const isDanger = mainAlert.nivel === "danger";
  const isWarning = mainAlert.nivel === "warning";

  const HeaderIcon = isDanger ? ShieldAlert : isWarning ? AlertTriangle : Info;
  const headerLabel = isDanger
    ? "Prioridad Crítica"
    : isWarning
    ? "Atención Requerida"
    : "Sugerencia Operativa";

  const headerColorClass = isDanger
    ? "text-rose-600"
    : isWarning
    ? "text-amber-600"
    : "text-sky-600";

  const badgeColorClass = isDanger
    ? "bg-rose-50 border-rose-200 text-rose-700"
    : isWarning
    ? "bg-amber-50 border-amber-200 text-amber-700"
    : "bg-sky-50 border-sky-200 text-sky-700";

  const routeConfig =
    MODULE_ROUTES[mainAlert.modulo?.toLowerCase()] || {
      path: "/dashboard/health",
      label: "Ver Sanidad",
    };

  // Extraer conteo si el mensaje inicia con un número (ej. "1 animales...")
  const countMatch = mainAlert.mensaje ? mainAlert.mensaje.match(/^(\d+)\s*(.*)$/) : null;
  const count = mainAlert.count ?? (countMatch ? countMatch[1] : null);
  const restOfMessage = countMatch ? countMatch[2] : mainAlert.mensaje;

  return (
    <Card className="relative overflow-hidden border border-slate-100 shadow-sm flex flex-col justify-between">
      {/* Borde superior de acento */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />

      <div>
        <div className={`flex items-center justify-between ${headerColorClass}`}>
          <div className="flex items-center gap-2">
            <HeaderIcon className="h-5 w-5" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em]">
              {headerLabel}
            </p>
          </div>
          {alerts.length > 1 && (
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${badgeColorClass}`}>
              +{secondaryAlerts.length} pendientes
            </span>
          )}
        </div>

        <h3 className="mt-4 text-2xl font-black capitalize text-slate-950">
          {mainAlert.modulo ? `Alerta en ${mainAlert.modulo}` : "Alerta de Sistema"}
        </h3>

        {/* 1. Mensaje de alerta en contenedor de alto contraste */}
        <div className="mt-4 bg-rose-50/60 border border-rose-200/80 rounded-xl p-3.5">
          <p className="text-rose-950 font-semibold text-sm md:text-base">
            {count ? (
              <>
                <span className="text-rose-600 font-bold text-lg mr-1">{count}</span>
                <span>{restOfMessage}</span>
              </>
            ) : (
              mainAlert.mensaje
            )}
          </p>
        </div>

        {/* 2. Bloque de acción sugerida rediseñado */}
        {mainAlert.accion_sugerida && (
          <div className="mt-4 bg-amber-50/80 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-900 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              Acción sugerida:
            </p>
            <p className="text-amber-800 text-xs md:text-sm font-medium leading-relaxed">
              {mainAlert.accion_sugerida}
            </p>
          </div>
        )}

        {/* 3. Sección de contexto zootécnico intermedio (Normativa ICA / Inocuidad Porcina) */}
        <div className="mt-4 bg-slate-50/80 rounded-xl p-3 border border-slate-100 text-xs text-slate-500">
          <p className="leading-relaxed">
            <strong className="font-semibold text-slate-700">Normativa Sanitaria ICA:</strong> El control de retiro farmacológico es obligatorio para garantizar la inocuidad porcina y asegurar que ningún lote tratado sea destinado a faenado antes de cumplir su periodo de carencia.
          </p>
        </div>

        {/* Alertas secundarias condensadas si existen */}
        {secondaryAlerts.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Otras notificaciones activas:
            </p>
            {secondaryAlerts.map((alert) => (
              <div
                key={alert.id || alert.mensaje}
                className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100"
              >
                <span className="font-semibold text-slate-900 capitalize">
                  {alert.modulo}:
                </span>
                <span className="line-clamp-1">{alert.mensaje}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Botón de Acción institucional PorciTech */}
      <div className="mt-6">
        <Link
          href={routeConfig?.path || "/dashboard/health"}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
        >
          {routeConfig?.label || "Ver Sanidad"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}

export default SystemSuggestion;
