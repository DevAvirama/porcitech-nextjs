"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";
import Button from "@/components/ui/Button";
import {
  getSanitaryRestAudit,
  createCorralCycle,
  updateCorralCycle,
} from "@/services/corralService";
import { downloadOfficialReport } from "@/services/reportService";

const AUDIT_BADGE = {
  cumple_protocolo: {
    label: "Cumple Protocolo",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  alerta_vacio_insuficiente: {
    label: "Vacío Insuficiente",
    cls: "bg-rose-50 text-rose-700 border-rose-200",
  },
  pendiente_desinfeccion: {
    label: "Pendiente Desinfección",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },
  primer_ciclo: {
    label: "Ciclo Base",
    cls: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

/**
 * Pestaña de Auditoría de Vacíos Sanitarios Todo Adentro / Todo Afuera (HU38).
 */
export default function CorralSanitaryAuditTab({ corrales = [] }) {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlyAlerts, setOnlyAlerts] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    corral_id: corrales[0]?.id || "",
    codigo_lote: "",
    fecha_entrada: todayStr,
    cantidad_animales: 10,
    dias_vacio_requerido: 7,
    desinfeccion_verificada: true,
    observaciones: "",
  });

  const loadAudit = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSanitaryRestAudit({ solo_alertas: onlyAlerts });
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Error al consultar auditoría sanitaria.");
    } finally {
      setIsLoading(false);
    }
  }, [onlyAlerts]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  const handleCreateCycle = async (e) => {
    e.preventDefault();
    if (!form.corral_id || !form.codigo_lote.trim()) {
      toast.error("Selecciona un corral e ingresa el código de lote.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createCorralCycle(form.corral_id, {
        codigo_lote: form.codigo_lote.trim().toUpperCase(),
        fecha_entrada: form.fecha_entrada,
        cantidad_animales: Number(form.cantidad_animales) || 0,
        dias_vacio_requerido: Number(form.dias_vacio_requerido) || 7,
        desinfeccion_verificada: Boolean(form.desinfeccion_verificada),
        observaciones: form.observaciones.trim() || null,
      });
      toast.success("Ciclo sanitario registrado.");
      setShowForm(false);
      setForm((prev) => ({ ...prev, codigo_lote: "", observaciones: "" }));
      await loadAudit();
    } catch (err) {
      toast.error(err.message || "No se pudo registrar el ciclo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyDisinfection = async (row) => {
    try {
      await updateCorralCycle(row.id, { desinfeccion_verificada: true });
      toast.success(`Desinfección verificada para lote ${row.codigo_lote}.`);
      await loadAudit();
    } catch (err) {
      toast.error(err.message || "No se pudo verificar la desinfección.");
    }
  };

  const handleCloseCycleToday = async (row) => {
    try {
      await updateCorralCycle(row.id, { fecha_salida: todayStr });
      toast.success(`Salida registrada para lote ${row.codigo_lote}.`);
      await loadAudit();
    } catch (err) {
      toast.error(err.message || "No se pudo cerrar el ciclo.");
    }
  };

  const handleExportExcel = async () => {
    try {
      await downloadOfficialReport({ formato: "xlsx", tipo: "vacios" });
      toast.success("Auditoría exportada en Excel (.xlsx).");
    } catch (err) {
      toast.error(err.message || "Error al exportar auditoría.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl cursor-pointer">
          <input
            type="checkbox"
            checked={onlyAlerts}
            onChange={(e) => setOnlyAlerts(e.target.checked)}
            className="rounded text-rose-600"
          />
          Solo incumplimientos / alertas
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            tone="soft"
            onClick={handleExportExcel}
            className="py-2 px-3 text-xs rounded-xl! font-bold flex items-center gap-1.5"
          >
            <FileSpreadsheet size={14} />
            Exportar .xlsx
          </Button>
          <Button
            type="button"
            tone="soft"
            onClick={loadAudit}
            className="py-2 px-3 text-xs rounded-xl! font-bold flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Refrescar
          </Button>
          <Button
            type="button"
            tone="primary"
            onClick={() => setShowForm((v) => !v)}
            className="py-2 px-3.5 text-xs rounded-xl! font-black flex items-center gap-1.5"
          >
            <Plus size={14} />
            {showForm ? "Cancelar" : "Registrar Ciclo"}
          </Button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateCycle}
          className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <select
            value={form.corral_id}
            onChange={(e) => setForm({ ...form, corral_id: e.target.value })}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
            required
          >
            <option value="">Seleccionar corral...</option>
            {corrales.map((c) => (
              <option key={c.id} value={c.id}>
                {c.codigo} ({c.fase})
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Código Lote (Ej: CEB-2026-03)"
            value={form.codigo_lote}
            onChange={(e) => setForm({ ...form, codigo_lote: e.target.value })}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
            required
          />
          <input
            type="date"
            value={form.fecha_entrada}
            onChange={(e) => setForm({ ...form, fecha_entrada: e.target.value })}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
            required
          />
          <input
            type="number"
            min="0"
            placeholder="Animales"
            value={form.cantidad_animales}
            onChange={(e) => setForm({ ...form, cantidad_animales: e.target.value })}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
          />
          <input
            type="number"
            min="0"
            placeholder="Días vacío mín."
            value={form.dias_vacio_requerido}
            onChange={(e) => setForm({ ...form, dias_vacio_requerido: e.target.value })}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
          />
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={form.desinfeccion_verificada}
                onChange={(e) =>
                  setForm({ ...form, desinfeccion_verificada: e.target.checked })
                }
              />
              Desinfección OK
            </label>
            <Button type="submit" tone="primary" disabled={isSubmitting} className="text-xs py-2 px-3 rounded-xl! font-black">
              {isSubmitting ? "..." : "Guardar"}
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              <th className="px-4 py-2">Corral / Lote</th>
              <th className="px-4 py-2">Entrada / Salida</th>
              <th className="px-4 py-2 text-center">Vacío Sanitario</th>
              <th className="px-4 py-2 text-center">Estado</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-xs font-semibold text-slate-400">
                  {isLoading ? "Cargando auditoría..." : "Sin ciclos sanitarios registrados."}
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const badge = AUDIT_BADGE[r.estado_auditoria] || AUDIT_BADGE.primer_ciclo;
                return (
                  <tr key={r.id} className="bg-slate-50/80 text-xs">
                    <td className="px-4 py-3 rounded-l-2xl">
                      <div className="font-black text-slate-900">
                        {r.corral_codigo} • <span className="text-emerald-700">{r.codigo_lote}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Anterior: {r.lote_anterior || "Primer registro"}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      <div>In: {r.fecha_entrada}</div>
                      <div className="text-[11px] text-slate-400">
                        Out: {r.fecha_salida || "En ocupación"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-black text-slate-800">
                      {r.dias_vacio_sanitario !== null ? `${r.dias_vacio_sanitario} d` : "--"}
                      <span className="block text-[10px] font-semibold text-slate-400">
                        Mín: {r.dias_vacio_requerido} d
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.cls}`}
                      >
                        {r.estado_auditoria === "cumple_protocolo" ? (
                          <ShieldCheck size={12} />
                        ) : (
                          <ShieldAlert size={12} />
                        )}
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 rounded-r-2xl text-right space-x-1.5">
                      {!r.desinfeccion_verificada && (
                        <button
                          type="button"
                          onClick={() => handleVerifyDisinfection(r)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold hover:bg-emerald-200 cursor-pointer"
                          title="Confirmar desinfección"
                        >
                          <CheckCircle2 size={12} className="inline mr-1" />
                          Desinfección
                        </button>
                      )}
                      {!r.fecha_salida && (
                        <button
                          type="button"
                          onClick={() => handleCloseCycleToday(r)}
                          className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-bold hover:bg-slate-300 cursor-pointer"
                        >
                          Cerrar Lote
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
