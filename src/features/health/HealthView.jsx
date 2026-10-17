"use client";

import React, { useMemo } from "react";
import { Plus, Activity, ShieldCheck, RefreshCw, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import ModuleHeader from "@/components/layout/ModuleHeader";
import { useHealthData } from "./hooks/useHealthData";
import BiosecurityView from "./BiosecurityView";
import WithdrawalAlertsBanner from "./components/WithdrawalAlertsBanner";
import HealthKPIs from "./components/HealthKPIs";
import HealthFiltersCard from "./components/HealthFiltersCard";
import HealthTreatmentsTable from "./components/HealthTreatmentsTable";
import AddHealthRecordModal from "./components/AddHealthRecordModal";

export default function HealthView() {
  const {
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
  } = useHealthData();

  const vaccinesCount = useMemo(
    () => treatments.filter((t) => t.tipo_evento === "vacuna").length,
    [treatments]
  );

  const curativeCount = useMemo(
    () => treatments.filter((t) => t.tipo_evento === "tratamiento").length,
    [treatments]
  );

  const hasActiveFilters = Boolean(
    searchTerm.trim() || filterType !== "all" || filterCorral !== "all"
  );

  return (
    <div className="w-full flex flex-col gap-6 text-slate-900">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="SANIDAD Y BIOSEGURIDAD"
        title="Gestión de Salud, Vacunación y Bioseguridad"
        description="Historial clínico de tratamientos, administración de medicamentos con descuento en bodega y monitoreo de retiros farmacológicos en PostgreSQL."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              tone="primary"
              className="flex items-center gap-2 font-black rounded-xl! shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              Registrar Evento Sanitario
            </Button>
          </div>
        }
      />

      {/* Selector de Pestañas Principales */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("clinical")}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "clinical"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Activity size={16} />
            <span>Tratamientos y Vacunas ({treatments.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("biosecurity")}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "biosecurity"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <ShieldCheck size={16} />
            <span>Bioseguridad y Normativa ICA</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => loadHealthData(false)}
          disabled={isRefreshing}
          className="text-xs font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
        >
          <RefreshCw
            size={13}
            className={isRefreshing ? "animate-spin text-emerald-600" : ""}
          />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Renderizado de BiosecurityView si la pestaña está activa */}
      {activeTab === "biosecurity" && <BiosecurityView />}

      {/* Renderizado de Vista Clínica Principal */}
      {activeTab === "clinical" && (
        <div className="space-y-6">
          {/* Banner de Error */}
          {error && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-rose-100 p-2 text-rose-600 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-900">
                    Fallo de sincronización sanitaria
                  </h4>
                  <p className="text-xs text-rose-700 mt-0.5">{error}</p>
                </div>
              </div>
              <Button
                onClick={() => loadHealthData(true)}
                tone="danger"
                className="text-xs shrink-0 self-start sm:self-center"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Reintentar
              </Button>
            </div>
          )}

          {/* Sección Crítica: Retiros Farmacológicos */}
          <WithdrawalAlertsBanner withdrawalAlerts={withdrawalAlerts} />

          {/* Tarjetas de KPI */}
          <HealthKPIs
            withdrawalCount={withdrawalAlerts.length}
            totalTreatments={treatments.length}
            vaccinesCount={vaccinesCount}
            curativeCount={curativeCount}
          />

          {/* Barra de Filtros */}
          <HealthFiltersCard
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            filterCorral={filterCorral}
            setFilterCorral={setFilterCorral}
            corrales={corrales}
          />

          {/* Tabla de Registros Clínicos */}
          <HealthTreatmentsTable
            isLoading={isLoading}
            treatments={treatments}
            columns={columns}
            hasActiveFilters={hasActiveFilters}
            onRegisterClick={() => setIsModalOpen(true)}
          />
        </div>
      )}

      {/* Modal de Registro de Tratamiento Sanitario */}
      <AddHealthRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => loadHealthData(false)}
      />
    </div>
  );
}
