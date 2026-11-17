"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  ClipboardList,
  Plus,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { createFeedingPlan, deleteFeedingPlan } from "@/services/feedingService";

const FASES_ALIMENTACION = [
  "Pre-iniciador",
  "Iniciador",
  "Levante",
  "Ceba",
  "Gestación",
  "Lactancia",
];

const FCR_BADGE_MAP = {
  "Óptimo": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Atención": "bg-amber-50 text-amber-700 border-amber-200",
  "Fuera de Estándar": "bg-rose-50 text-rose-700 border-rose-200",
};

/**
 * Sección integrada de Conversión Alimenticia FCR (HU26) y Planes de Alimentación (HU24).
 */
export default function FeedingPlansAndFCRSection({
  plans = [],
  fcrItems = [],
  corrales = [],
  feedItems = [],
  fcrFilters,
  setFcrFilters,
  onRefresh,
  isRefreshing = false,
}) {
  const [activeTab, setActiveTab] = useState("fcr");
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [planForm, setPlanForm] = useState({
    nombre: "",
    fase_alimentacion: "Levante",
    corral_id: "",
    alimento_item_id: "",
    cantidad_kg_por_animal: "1.85",
    frecuencia_diaria: "2",
    fcr_objetivo: "2.25",
    observaciones: "",
  });

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!planForm.nombre.trim() || !planForm.alimento_item_id) {
      toast.error("Indica el nombre del plan y selecciona un alimento de bodega.");
      return;
    }
    setIsSavingPlan(true);
    try {
      await createFeedingPlan({
        nombre: planForm.nombre.trim(),
        fase_alimentacion: planForm.fase_alimentacion,
        corral_id: planForm.corral_id || null,
        alimento_item_id: planForm.alimento_item_id,
        cantidad_kg_por_animal: Number(planForm.cantidad_kg_por_animal),
        frecuencia_diaria: Number(planForm.frecuencia_diaria),
        fcr_objetivo: Number(planForm.fcr_objetivo) || 2.4,
        observaciones: planForm.observaciones.trim() || null,
      });
      toast.success("Plan de alimentación registrado correctamente.");
      setShowPlanForm(false);
      setPlanForm({
        nombre: "",
        fase_alimentacion: "Levante",
        corral_id: "",
        alimento_item_id: "",
        cantidad_kg_por_animal: "1.85",
        frecuencia_diaria: "2",
        fcr_objetivo: "2.25",
        observaciones: "",
      });
      if (onRefresh) await onRefresh();
    } catch (err) {
      toast.error(err.message || "Error al guardar el plan de alimentación (requiere rol Admin/Veterinario).");
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleDeletePlan = async (plan) => {
    if (!window.confirm(`¿Eliminar el plan "${plan.nombre}"?`)) return;
    try {
      await deleteFeedingPlan(plan.id);
      toast.success(`Plan "${plan.nombre}" eliminado.`);
      if (onRefresh) await onRefresh();
    } catch (err) {
      toast.error(err.message || "No se pudo eliminar el plan.");
    }
  };

  return (
    <Card className="p-6 md:p-8 bg-white border border-slate-100 rounded-4xl shadow-sm space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("fcr")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "fcr"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Activity size={15} />
            Conversión Alimenticia (FCR)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("planes")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "planes"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <ClipboardList size={15} />
            Planes por Etapa ({plans.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === "fcr" && fcrFilters && setFcrFilters && (
            <>
              <input
                type="date"
                value={fcrFilters.fecha_inicio}
                onChange={(e) =>
                  setFcrFilters((prev) => ({ ...prev, fecha_inicio: e.target.value }))
                }
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
                title="Fecha inicio"
              />
              <input
                type="date"
                value={fcrFilters.fecha_fin}
                onChange={(e) =>
                  setFcrFilters((prev) => ({ ...prev, fecha_fin: e.target.value }))
                }
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
                title="Fecha fin"
              />
            </>
          )}

          {activeTab === "planes" && (
            <Button
              type="button"
              tone="primary"
              onClick={() => setShowPlanForm((v) => !v)}
              className="py-2 px-3.5 text-xs rounded-xl! font-black flex items-center gap-1.5"
            >
              <Plus size={15} />
              {showPlanForm ? "Cancelar" : "Nuevo Plan"}
            </Button>
          )}

          <Button
            type="button"
            tone="soft"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="py-2 px-3 text-xs rounded-xl! font-bold flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* TAB 1: CONVERSIÓN ALIMENTICIA (HU26) */}
      {activeTab === "fcr" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="px-4 py-2">Corral / Fase</th>
                <th className="px-4 py-2 text-right">Alimento (kg)</th>
                <th className="px-4 py-2 text-right">Ganancia Lote (kg)</th>
                <th className="px-4 py-2 text-center">FCR Real</th>
                <th className="px-4 py-2 text-center">Meta Porkcolombia</th>
                <th className="px-4 py-2 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {fcrItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-sm text-slate-400 font-semibold">
                    Sin datos de conversión en el rango seleccionado.
                  </td>
                </tr>
              ) : (
                fcrItems.map((item) => {
                  const badgeCls =
                    FCR_BADGE_MAP[item.estado_fcr] ||
                    "bg-slate-100 text-slate-600 border-slate-200";
                  return (
                    <tr
                      key={item.corral_id}
                      className="bg-slate-50/80 hover:bg-slate-100/80 transition-colors"
                    >
                      <td className="px-4 py-3 rounded-l-2xl">
                        <div className="font-black text-slate-900 text-sm">
                          {item.corral_codigo}
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold capitalize">
                          {item.fase} • {item.animales_activos} animales
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800 text-sm">
                        {item.alimento_suministrado_kg.toLocaleString("es-CO")} kg
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800 text-sm">
                        {item.ganancia_total_estimada_kg.toLocaleString("es-CO")} kg
                      </td>
                      <td className="px-4 py-3 text-center font-black text-slate-950 text-base">
                        {item.fcr_real !== null ? item.fcr_real.toFixed(2) : "--"}
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-bold text-slate-600">
                        {item.fcr_objetivo_estandar.toFixed(2)}
                        {item.desviacion_porcentual !== null && (
                          <span className="block text-[10px] text-slate-400">
                            ({item.desviacion_porcentual > 0 ? "+" : ""}
                            {item.desviacion_porcentual}%)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 rounded-r-2xl text-center">
                        <span
                          title={item.observacion_zootecnica}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badgeCls}`}
                        >
                          {item.estado_fcr === "Óptimo" ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <AlertTriangle size={12} />
                          )}
                          {item.estado_fcr}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: PLANES DE ALIMENTACIÓN (HU24) */}
      {activeTab === "planes" && (
        <div className="space-y-4">
          {showPlanForm && (
            <form
              onSubmit={handleCreatePlan}
              className="p-5 rounded-3xl border border-emerald-200 bg-emerald-50/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
            >
              <input
                type="text"
                placeholder="Nombre del plan (Ej: Plan Levante Intensivo)"
                value={planForm.nombre}
                onChange={(e) => setPlanForm({ ...planForm, nombre: e.target.value })}
                className="sm:col-span-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                required
              />
              <select
                value={planForm.fase_alimentacion}
                onChange={(e) => setPlanForm({ ...planForm, fase_alimentacion: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
              >
                {FASES_ALIMENTACION.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <select
                value={planForm.corral_id}
                onChange={(e) => setPlanForm({ ...planForm, corral_id: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
              >
                <option value="">General por Etapa (Todos)</option>
                {corrales.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo} ({c.fase})
                  </option>
                ))}
              </select>
              <select
                value={planForm.alimento_item_id}
                onChange={(e) => setPlanForm({ ...planForm, alimento_item_id: e.target.value })}
                className="sm:col-span-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                required
              >
                <option value="">Seleccionar alimento de bodega...</option>
                {feedItems.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.nombre}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.05"
                min="0.1"
                placeholder="kg/animal/día"
                value={planForm.cantidad_kg_por_animal}
                onChange={(e) =>
                  setPlanForm({ ...planForm, cantidad_kg_por_animal: e.target.value })
                }
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                required
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.05"
                  min="1.0"
                  placeholder="Meta FCR"
                  value={planForm.fcr_objetivo}
                  onChange={(e) => setPlanForm({ ...planForm, fcr_objetivo: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                />
                <Button type="submit" tone="primary" disabled={isSavingPlan} className="rounded-xl! text-xs font-black px-4">
                  {isSavingPlan ? "..." : "Guardar"}
                </Button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.length === 0 ? (
              <div className="md:col-span-2 text-center py-8 text-sm text-slate-400 font-semibold">
                No hay planes alimenticios registrados.
              </div>
            ) : (
              plans.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-3xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 mb-1.5">
                        {p.fase_alimentacion} • {p.corral_codigo || "Estándar Etapa"}
                      </span>
                      <h4 className="font-black text-slate-900 text-sm">{p.nombre}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {p.alimento_nombre}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(p)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Eliminar plan"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/70 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Ración/Día
                      </span>
                      <span className="font-black text-slate-900 text-sm">
                        {p.cantidad_kg_por_animal} kg
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Frecuencia
                      </span>
                      <span className="font-black text-slate-900 text-sm">
                        {p.frecuencia_diaria}x/día
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Meta FCR
                      </span>
                      <span className="font-black text-emerald-700 text-sm">
                        {p.fcr_objetivo ?? "--"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
