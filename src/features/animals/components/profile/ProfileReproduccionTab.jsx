"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import {
  Scale,
  ArrowRight,
  TrendingUp,
  Heart,
  Award,
  Baby,
} from "lucide-react";

export default function ProfileReproduccionTab({
  animal = {},
  isMacho = false,
  isSemental = false,
  coberturas = [],
  partos = [],
  onNavigateProduction,
  onNavigateReproduction,
}) {
  // Caso 1: Macho de ceba / engorde (no reproductor)
  if (isMacho && !isSemental) {
    return (
      <div className="py-14 px-6 flex flex-col items-center justify-center text-center max-w-lg mx-auto bg-slate-50/70 border border-slate-200/80 rounded-3xl my-2">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 shadow-xs">
          <Scale className="w-8 h-8" />
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 mb-2">
          Línea de Engorde / Ceba
        </span>
        <h4 className="text-xl font-black text-slate-900 tracking-tight">
          Seguimiento Reproductivo No Aplicable
        </h4>
        <p className="text-sm text-slate-600 font-semibold mt-2 leading-relaxed">
          Seguimiento reproductivo no aplicable para machos en línea de producción/ceba.
        </p>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Este ejemplar pertenece a la línea comercial de engorde y levante. Su rendimiento zootécnico se evalúa mediante la curva de peso, ganancia media diaria (GMD) y eficiencia alimenticia.
        </p>
        <div className="mt-6">
          <Button
            tone="primary"
            onClick={onNavigateProduction}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md cursor-pointer"
          >
            <TrendingUp size={16} /> Ver Producción y Curva de Peso (GMD)
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  // Caso 2: Macho semental reproductor
  if (isMacho && isSemental) {
    if (coberturas.length === 0) {
      return (
        <div className="py-6">
          <EmptyState
            icon={Heart}
            title="Sin servicios o coberturas registradas"
            description="No se han registrado montas naturales ni inseminaciones artificiales para este semental en la base de datos."
            actionLabel="+ Registrar Servicio"
            onAction={onNavigateReproduction}
          />
        </div>
      );
    }

    const totalServicios = coberturas.length;
    const confirmadosCount = coberturas.filter(
      (c) => c.estado_confirmacion === "positiva"
    ).length;
    const efectividadTasa = Math.round((confirmadosCount / totalServicios) * 100);

    const rowsToShow = coberturas.map((c) => ({
      fecha_servicio: c.fecha_servicio,
      hembra: c.hembra_alias || c.hembra_arete || "Cerda Reproductora",
      metodo:
        c.tipo_servicio === "inseminacion_artificial"
          ? "Inseminación Artificial"
          : "Monta Natural",
      estado:
        c.estado_confirmacion === "positiva"
          ? "Confirmada (Positiva)"
          : c.estado_confirmacion === "negativa"
          ? "Negativa (Vacía)"
          : "Pendiente Diagnóstico",
      estado_badge:
        c.estado_confirmacion === "positiva"
          ? "bg-emerald-100 text-emerald-700"
          : c.estado_confirmacion === "negativa"
          ? "bg-rose-100 text-rose-700"
          : "bg-amber-100 text-amber-700",
    }));

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                <Award size={18} />
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Servicios y Coberturas del Semental
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Historial de montas naturales e inseminaciones asistidas por este reproductor
            </p>
          </div>
          <Button
            onClick={onNavigateReproduction}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl! px-3.5 py-2 cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Heart size={14} className="mr-1.5" /> Nuevo Servicio
          </Button>
        </div>

        {/* Tarjetas de Métricas del Semental */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-none">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Coberturas
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {totalServicios}
            </p>
            <span className="text-[11px] font-semibold text-slate-400">
              Servicios registrados
            </span>
          </Card>

          <Card className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-none">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tasa de Fertilidad / Efectividad
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {efectividadTasa}%
            </p>
            <span className="text-[11px] font-semibold text-emerald-600/80">
              Gestaciones confirmadas
            </span>
          </Card>

          <Card className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-none">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Aptitud Reproductiva
            </p>
            <p className="text-lg font-black text-indigo-700 mt-1">
              Semental Activo
            </p>
            <span className="text-[11px] font-semibold text-indigo-600">
              Apto para empadre
            </span>
          </Card>
        </div>

        {/* Tabla de Servicios y Coberturas */}
        <div className="border border-slate-100 rounded-3xl overflow-hidden">
          <Table
            columns={[
              { header: "Fecha de Servicio", key: "fecha_servicio" },
              { header: "Hembra Servida", key: "hembra" },
              { header: "Método de Servicio", key: "metodo" },
              {
                header: "Efectividad / Diagnóstico",
                key: "estado",
                render: (row) => (
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${row.estado_badge}`}
                  >
                    {row.estado}
                  </span>
                ),
              },
            ]}
            rows={rowsToShow}
          />
        </div>
      </div>
    );
  }

  // Caso 3: Hembra - Partos e Historial de Gestación
  const cols = [
    {
      header: "Fecha de Parto",
      key: "fecha_parto",
      render: (r) => (r.fecha_parto ? r.fecha_parto.split("T")[0] : "--"),
    },
    { header: "Nacidos Vivos", key: "nacidos_vivos" },
    {
      header: "Muertos / Momias",
      key: "nacidos_muertos",
      render: (r) => `${r.nacidos_muertos || 0} / ${r.momias || 0}`,
    },
    {
      header: "Peso Camada (kg)",
      key: "peso_camada_total_kg",
      render: (r) => (r.peso_camada_total_kg ? `${r.peso_camada_total_kg} kg` : "--"),
    },
    {
      header: "Observaciones",
      key: "observaciones",
      render: (r) => r.observaciones || "Parto sin incidencias",
    },
  ];

  const diasG = animal.diasGestacion ?? 0;
  const progresoG = Math.round((diasG / 114) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900">
          Historial de Partos y Ciclo de Gestación
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-500">
            Ciclos completados: {partos.length}
          </span>
          {diasG > 0 && (
            <div className="bg-fuchsia-100 text-fuchsia-700 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5">
              <Baby size={16} /> Gestación actual: Día {diasG} de 114
            </div>
          )}
        </div>
      </div>

      {diasG > 0 ? (
        <div className="mb-8">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
            <span>Servicio (Día 0)</span>
            <span>Progreso: {progresoG}%</span>
            <span>Parto (Día 114)</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-fuchsia-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, progresoG)}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-fuchsia-50/70 border border-fuchsia-200/60 rounded-2xl text-xs font-semibold text-fuchsia-900 flex items-center gap-2">
          <Heart size={16} className="text-fuchsia-600 shrink-0" />
          Hembra sin gestación activa en este momento. La barra de gestación (114 días) se activará automáticamente al registrar y confirmar un servicio.
        </div>
      )}

      {partos.length === 0 ? (
        <div className="py-6">
          <EmptyState
            icon={Baby}
            title="Sin historial de partos registrado"
            description="No se han registrado partos ni camadas para esta hembra en la base de datos de PostgreSQL."
            actionLabel="+ Registrar Parto o Servicio"
            onAction={onNavigateReproduction}
          />
        </div>
      ) : (
        <div className="border border-slate-100 rounded-4xl overflow-hidden">
          <Table columns={cols} rows={partos} />
        </div>
      )}
    </div>
  );
}
