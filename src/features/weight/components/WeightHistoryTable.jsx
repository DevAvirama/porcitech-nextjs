"use client";

import React, { useState, useEffect, useCallback } from "react";
import { History, Scale, Sparkles, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { getAnimalDisplayName, UUID_REGEX } from "@/utils/formatters";
import { getAnimalWeightHistory, deletePesaje } from "@/services/weightService";

export default function WeightHistoryTable({
  animals,
  recentLogs,
  onNavigateToIA,
  onPesajeDeleted,
}) {
  const [historyAnimalId, setHistoryAnimalId] = useState("");
  const [dbHistoryLogs, setDbHistoryLogs] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAnimalHistory = useCallback(async (animalId) => {
    if (!animalId) {
      setDbHistoryLogs([]);
      return;
    }
    setIsLoadingHistory(true);
    try {
      const res = await getAnimalWeightHistory(animalId);
      const list = Array.isArray(res) ? res : [];
      const chosen = animals.find((a) => a.id === animalId);
      const mapped = list.map((reg) => ({
        id: reg.id_registro || reg.id,
        id_registro: reg.id_registro || reg.id,
        animalCode:
          reg.cerdo_arete ||
          (chosen?.codigo_arete && !UUID_REGEX.test(chosen.codigo_arete)
            ? chosen.codigo_arete
            : null),
        animalDisplayName: chosen
          ? getAnimalDisplayName(chosen)
          : reg.cerdo_alias || "Ejemplar",
        animalAlias: reg.cerdo_alias || chosen?.nombre_alias,
        corralCodigo: reg.corral_codigo || "N/A",
        peso: reg.peso_kg,
        metodo: reg.metodo === "vision_ai" ? "ia_vision" : reg.metodo,
        confianza: reg.confianza_ia,
        fecha: reg.tiempo || reg.created_at,
      }));
      setDbHistoryLogs(mapped);
    } catch (err) {
      console.warn("Aviso al obtener historial del animal:", err.message);
      setDbHistoryLogs([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [animals]);

  useEffect(() => {
    fetchAnimalHistory(historyAnimalId);
  }, [historyAnimalId, fetchAnimalHistory]);

  const handleDelete = async (log) => {
    const targetId = log?.id_registro || log?.id;
    if (!targetId || !UUID_REGEX.test(targetId)) {
      setDbHistoryLogs((prev) => prev.filter((l) => (l.id_registro || l.id) !== targetId));
      if (onPesajeDeleted) onPesajeDeleted(targetId, true);
      toast.info("Registro local retirado del historial.");
      return;
    }

    setDeletingId(targetId);
    try {
      const res = await deletePesaje(targetId);
      setDbHistoryLogs((prev) => prev.filter((l) => (l.id_registro || l.id) !== targetId));
      if (onPesajeDeleted) onPesajeDeleted(targetId, false);
      toast.success(
        res?.mensaje ||
          `Pesaje anulado. Peso actual recalculado: ${Number(
            res?.peso_actual_kg ?? 0,
          ).toFixed(2)} kg`,
      );
      if (historyAnimalId) {
        await fetchAnimalHistory(historyAnimalId);
      }
    } catch (err) {
      console.error("Error al anular pesaje:", err);
      toast.error(err.message || "No se pudo anular el pesaje.");
    } finally {
      setDeletingId(null);
    }
  };

  const currentDisplayLogs = historyAnimalId ? dbHistoryLogs : recentLogs;

  return (
    <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <History size={18} className="text-slate-700" />
            Historial de Pesajes
          </h3>
          <p className="text-xs text-slate-500">
            Registros emitidos en la hipertabla de pesajes en TimescaleDB.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={historyAnimalId}
            onChange={(e) => setHistoryAnimalId(e.target.value)}
            className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">-- Ver tomas de la sesión --</option>
            {animals.map((a) => (
              <option key={a.id} value={a.id}>
                {getAnimalDisplayName(a)} ({a.peso_actual_kg || 0} kg)
              </option>
            ))}
          </select>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
            {currentDisplayLogs.length} tomas
          </span>
        </div>
      </div>

      {isLoadingHistory ? (
        <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <RefreshCw size={22} className="animate-spin text-indigo-600" />
          <p className="text-xs font-bold text-slate-600">
            Consultando historial en TimescaleDB...
          </p>
        </div>
      ) : currentDisplayLogs.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="Sin lecturas de peso registradas"
          description="Comienza registrando el primer pesaje físico en báscula o mediante visión artificial."
          actionLabel="Registrar Primer Pesaje"
          onAction={onNavigateToIA}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Cerdo</th>
                <th className="py-3 px-3">Corral</th>
                <th className="py-3 px-3">Método</th>
                <th className="py-3 px-3">Peso</th>
                <th className="py-3 px-3">Fecha y Hora</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentDisplayLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {log.animalCode
                      ? `#${log.animalCode}`
                      : log.animalDisplayName || "Ejemplar"}
                    {log.animalCode && log.animalAlias && (
                      <span className="text-slate-500 italic block text-[11px]">
                        {log.animalAlias}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">
                    {log.corralCodigo}
                  </td>
                  <td className="py-3 px-3">
                    {log.metodo === "ia_vision" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                        <Sparkles size={11} /> Visión IA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        <Scale size={11} /> Báscula
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-slate-900 text-sm">
                    {log.peso?.toFixed(2)} kg
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono">
                    {new Date(log.fecha).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      id={`delete-pesaje-${log.id}`}
                      onClick={() => handleDelete(log)}
                      disabled={deletingId === log.id}
                      title="Anular pesaje"
                      aria-label="Anular pesaje"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {deletingId === log.id ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
