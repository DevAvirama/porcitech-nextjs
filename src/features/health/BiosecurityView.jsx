"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ShieldCheck,
  UserCheck,
  Truck,
  Bug,
  Trash2,
  Droplets,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Activity,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ModuleHeader from "@/components/layout/ModuleHeader";
import EmptyState from "@/components/ui/EmptyState";
import {
  getProtocols,
  getDailyExecutions,
  toggleProtocolExecution,
} from "@/services/healthService";

const ICON_MAP = {
  ShieldCheck,
  UserCheck,
  Truck,
  Bug,
  Trash2,
  Droplets,
  Activity,
  Layers,
};

export default function BiosecurityView() {
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [protocols, setProtocols] = useState([]);
  const [executionsMap, setExecutionsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Carga de protocolos y ejecuciones para la fecha seleccionada
  const loadBiosecurityData = useCallback(
    async (showFullLoader = true) => {
      if (showFullLoader) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      try {
        const [protocolsData, executionsData] = await Promise.all([
          getProtocols(true),
          getDailyExecutions(selectedDate),
        ]);

        const rawProtocols = Array.isArray(protocolsData) ? protocolsData : [];
        const rawExecutions = Array.isArray(executionsData) ? executionsData : [];

        setProtocols(rawProtocols);

        // Mapear ejecuciones por protocolo_id
        const map = {};
        rawExecutions.forEach((exec) => {
          if (exec.protocolo_id) {
            map[exec.protocolo_id] = !!exec.cumplido;
          }
        });
        setExecutionsMap(map);
      } catch (err) {
        console.error("Error al cargar protocolos de bioseguridad:", err);
        setError(
          err.message ||
            "No se pudieron sincronizar los protocolos de bioseguridad con el servidor."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedDate]
  );

  useEffect(() => {
    loadBiosecurityData(true);
  }, [loadBiosecurityData]);

  // Cálculo de progreso porcentual
  const totalItems = protocols.length;
  const completedCount = useMemo(() => {
    return protocols.filter((p) => !!executionsMap[p.id]).length;
  }, [protocols, executionsMap]);

  const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // Manejo optimista de check / uncheck
  const handleToggleProtocol = async (protocol) => {
    const prevStatus = !!executionsMap[protocol.id];
    const newStatus = !prevStatus;

    // Actualización optimista de estado local
    setExecutionsMap((prev) => ({ ...prev, [protocol.id]: newStatus }));

    try {
      await toggleProtocolExecution({
        protocolo_id: protocol.id,
        cumplido: newStatus,
        observaciones: `Auditoría del ${selectedDate}`,
      });
      toast.success(
        newStatus
          ? `✓ Protocolo "${protocol.tarea}" verificado`
          : `Protocolo "${protocol.tarea}" desmarcado`
      );
    } catch (err) {
      // Revertir en caso de fallo
      setExecutionsMap((prev) => ({ ...prev, [protocol.id]: prevStatus }));
      toast.error(err.message || "Error al actualizar el protocolo de bioseguridad");
    }
  };

  // Separación por tipo_protocolo
  const structuralProtocols = useMemo(
    () => protocols.filter((p) => p.tipo_protocolo === "estructural"),
    [protocols]
  );

  const operationalProtocols = useMemo(
    () =>
      protocols.filter(
        (p) => p.tipo_protocolo === "operacional" || p.tipo_protocolo !== "estructural"
      ),
    [protocols]
  );

  const renderProtocolCard = (item) => {
    const IconComponent = ICON_MAP[item.icono] || ShieldCheck;
    const isChecked = !!executionsMap[item.id];

    return (
      <div
        key={item.id}
        onClick={() => handleToggleProtocol(item)}
        className={`flex items-start gap-4 p-5 border rounded-2xl cursor-pointer transition-all ${
          isChecked
            ? "bg-emerald-50/60 border-emerald-300 shadow-sm shadow-emerald-100"
            : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md"
        }`}
      >
        <div className="mt-1">
          <input
            type="checkbox"
            className="w-5 h-5 rounded border-slate-300 text-emerald-600 accent-emerald-600 cursor-pointer"
            checked={isChecked}
            onChange={() => {}} // Manejado por el contenedor onClick
          />
        </div>
        <div
          className={`p-2.5 rounded-xl transition-colors ${
            isChecked ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4
              className={`font-black text-sm transition-colors ${
                isChecked ? "text-emerald-950" : "text-slate-900"
              }`}
            >
              {item.tarea}
            </h4>
            {item.frecuencia && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {item.frecuencia}
              </span>
            )}
          </div>
          <p
            className={`text-xs mt-1 leading-relaxed transition-colors ${
              isChecked ? "text-emerald-800/80 font-medium" : "text-slate-500"
            }`}
          >
            {item.descripcion}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-900">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="SANIDAD Y BIOSEGURIDAD"
        title="Control de Bioseguridad y Normativa ICA"
        description="Auditoría y lista de verificación diaria de protocolos estructurales y operacionales de la granja."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* Selector de Fecha */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs">
              <Calendar size={16} className="text-emerald-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-bold text-slate-700 outline-none cursor-pointer bg-transparent"
              />
            </div>

            {/* Contador de Progreso */}
            <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xs">
              <span className="text-xs text-slate-300 font-semibold">
                Cumplimiento Hoy:
              </span>
              <span className="text-base font-black text-emerald-400">
                {progress}%
              </span>
              <span className="text-xs text-slate-400">
                ({completedCount}/{totalItems})
              </span>
            </div>
          </div>
        }
      />

      {/* Banner de Error */}
      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-rose-100 p-2 text-rose-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Fallo de sincronización con bioseguridad
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <Button
            onClick={() => loadBiosecurityData(true)}
            tone="danger"
            className="text-xs shrink-0 self-start sm:self-center"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reintentar
          </Button>
        </div>
      )}

      {/* Indicador visual de cumplimiento de bioseguridad */}
      <Card className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                progress >= 85
                  ? "bg-emerald-100 text-emerald-700"
                  : progress >= 50
                  ? "bg-amber-100 text-amber-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {progress === 100
                  ? "Todos los Protocolos Verificados"
                  : progress >= 85
                  ? "Nivel de Bioseguridad Óptimo"
                  : "Atención: Protocolos Sanitarios Pendientes"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {completedCount} de {totalItems} tareas auditadas para el día {selectedDate}.
              </p>
            </div>
          </div>

          <div className="w-full md:w-64">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-400 uppercase tracking-wider">
                Auditoría ICA
              </span>
              <span className="text-emerald-600">{progress}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  progress >= 85
                    ? "bg-emerald-500"
                    : progress >= 50
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Contenido en 2 columnas: Estructurales vs Operacionales */}
      {isLoading ? (
        <div className="grid lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <Card key={i} className="rounded-4xl p-6 bg-white border border-slate-100 shadow-sm">
              <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : protocols.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No hay protocolos registrados"
          description="No se encontraron protocolos maestros de bioseguridad activos en la base de datos."
        />
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Protocolos Estructurales */}
          <Card className="rounded-4xl! p-6 bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                Protocolos Estructurales
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {structuralProtocols.filter((p) => !!executionsMap[p.id]).length} /{" "}
                {structuralProtocols.length}
              </span>
            </div>
            <div className="space-y-3">
              {structuralProtocols.map(renderProtocolCard)}
            </div>
          </Card>

          {/* Protocolos Operacionales */}
          <Card className="rounded-4xl! p-6 bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                Protocolos Operacionales
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {operationalProtocols.filter((p) => !!executionsMap[p.id]).length} /{" "}
                {operationalProtocols.length}
              </span>
            </div>
            <div className="space-y-3">
              {operationalProtocols.map(renderProtocolCard)}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
