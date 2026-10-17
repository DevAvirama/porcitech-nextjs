"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Syringe,
  Pill,
  ShieldAlert,
  Activity,
  Warehouse,
  Clock,
} from "lucide-react";
import { formatDateTime, UUID_REGEX } from "@/utils/formatters";
import { getTreatments, getWithdrawalAlerts } from "@/services/healthService";
import { getCorrales } from "@/services/corralService";

export const EVENT_TYPE_BADGES = {
  vacuna: {
    label: "Vacunación",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Syringe,
  },
  tratamiento: {
    label: "Tratamiento",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: Pill,
  },
  desparasitacion: {
    label: "Desparasitación",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    icon: ShieldAlert,
  },
};

export function useHealthData() {
  const [activeTab, setActiveTab] = useState("clinical");

  // Estados de datos API
  const [treatments, setTreatments] = useState([]);
  const [withdrawalAlerts, setWithdrawalAlerts] = useState([]);
  const [corrales, setCorrales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCorral, setFilterCorral] = useState("all");

  // Modal de registro
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carga concurrente inicial
  const loadHealthData = useCallback(async (showFullLoader = true) => {
    if (showFullLoader) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [treatmentsData, alertsData, corralesData] = await Promise.all([
        getTreatments({ limite: 50 }),
        getWithdrawalAlerts(),
        getCorrales(true),
      ]);

      setTreatments(Array.isArray(treatmentsData) ? treatmentsData : []);
      setWithdrawalAlerts(Array.isArray(alertsData) ? alertsData : []);
      setCorrales(Array.isArray(corralesData) ? corralesData : []);
    } catch (err) {
      console.error("Error al cargar datos sanitarios:", err);
      setError(
        err.message ||
          "No se pudieron sincronizar los datos de sanidad con el backend de FastAPI."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHealthData(true);
  }, [loadHealthData]);

  // Recarga filtrada de tratamientos
  const handleApplyFilters = useCallback(async () => {
    try {
      const params = { limite: 50 };
      if (filterType !== "all") params.tipo_evento = filterType;
      if (filterCorral !== "all") params.corral_id = filterCorral;

      const results = await getTreatments(params);
      let list = Array.isArray(results) ? results : [];

      // Filtrado por texto (arete, alias, diagnóstico o producto)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        list = list.filter(
          (t) =>
            (t.animal_arete && t.animal_arete.toLowerCase().includes(query)) ||
            (t.animal_alias && t.animal_alias.toLowerCase().includes(query)) ||
            (t.producto_nombre && t.producto_nombre.toLowerCase().includes(query)) ||
            (t.diagnostico && t.diagnostico.toLowerCase().includes(query))
        );
      }

      setTreatments(list);
    } catch (err) {
      console.error("Error al aplicar filtros de tratamientos:", err);
    }
  }, [filterType, filterCorral, searchTerm]);

  const isFirstFilterRender = useMemo(() => ({ current: true }), []);

  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      handleApplyFilters();
    }, 250);
    return () => clearTimeout(timer);
  }, [handleApplyFilters, isFirstFilterRender]);

  // Columnas para la tabla clínica
  const columns = useMemo(
    () => [
      {
        key: "animal",
        header: "Animal / Arete",
        render: (row) => {
          const rawArete = row.animal_arete;
          const hasValidArete =
            rawArete && !UUID_REGEX.test(String(rawArete).trim());
          const displayName =
            row.animal_alias ||
            (hasValidArete ? `#${String(rawArete).trim()}` : "Porcino");

          return (
            <div>
              <div className="flex items-center gap-1.5">
                {hasValidArete && (
                  <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg">
                    #{String(rawArete).trim()}
                  </span>
                )}
                <span className="font-bold text-sm text-slate-900">
                  {displayName}
                </span>
              </div>
              {row.corral_codigo && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Warehouse className="h-3 w-3" />
                  Corral: {row.corral_codigo}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "tipo_evento",
        header: "Evento Sanitario",
        render: (row) => {
          const badge =
            EVENT_TYPE_BADGES[row.tipo_evento] || {
              label: row.tipo_evento || "General",
              className: "bg-slate-100 text-slate-700 border-slate-200",
              icon: Activity,
            };
          const Icon = badge.icon;
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.className}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {badge.label}
            </span>
          );
        },
      },
      {
        key: "producto",
        header: "Producto / Diagnóstico",
        render: (row) => (
          <div className="py-1">
            <p className="font-bold text-slate-900 text-sm">{row.producto_nombre}</p>
            <p className="text-xs text-slate-500 leading-snug mt-0.5">
              {row.diagnostico}
            </p>
          </div>
        ),
      },
      {
        key: "dosis",
        header: "Dosis y Vía",
        render: (row) => (
          <div>
            <span className="font-black text-slate-900 text-sm">
              {row.dosis} {row.unidad_dosis || "ml"}
            </span>
            <span className="block text-[11px] text-slate-400 font-semibold">
              {row.via_administracion || "Subcutánea"}
            </span>
          </div>
        ),
      },
      {
        key: "veterinario",
        header: "Responsable",
        render: (row) => (
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
            {row.veterinario_nombre || "Médico Veterinario"}
          </span>
        ),
      },
      {
        key: "fecha",
        header: "Fecha (COT)",
        render: (row) => (
          <div>
            <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
              {formatDateTime(row.fecha_tratamiento)}
            </span>
            {row.fecha_proxima_dosis && (
              <span className="block text-[10px] text-blue-600 font-bold mt-0.5">
                Refuerzo: {row.fecha_proxima_dosis}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "retiro",
        header: "Tiempo Retiro",
        render: (row) => {
          const retiro = Number(row.tiempo_retiro_dias) || 0;
          if (retiro > 0) {
            return (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700 border border-rose-200">
                <Clock className="h-3 w-3" />
                {retiro} días
              </span>
            );
          }
          return (
            <span className="text-xs font-bold text-emerald-600">
              0 días (Libre)
            </span>
          );
        },
      },
    ],
    []
  );

  return {
    activeTab,
    setActiveTab,
    treatments,
    withdrawalAlerts,
    corrales,
    isLoading,
    isRefreshing,
    error,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterCorral,
    setFilterCorral,
    isModalOpen,
    setIsModalOpen,
    loadHealthData,
    columns,
  };
}
