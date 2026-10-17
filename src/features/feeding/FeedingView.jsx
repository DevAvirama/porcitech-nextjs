"use client";

import React from "react";
import { Plus, AlertTriangle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import ModuleHeader from "@/components/layout/ModuleHeader";

import { useFeedingData } from "./hooks/useFeedingData";
import FeedingKPIs from "./components/FeedingKPIs";
import SilosInventorySection from "./components/SilosInventorySection";
import FeedingHistorySection from "./components/FeedingHistorySection";
import SupplyRationModal from "./components/SupplyRationModal";

export default function FeedingView() {
  const {
    rations,
    corrales,
    feedItems,
    isLoading,
    isRefreshing,
    error,
    filterCorral,
    setFilterCorral,
    filteredRations,
    totalKgServidos,
    corralesAlimentados,
    totalStockAlimento,
    isModalOpen,
    setIsModalOpen,
    isSubmitting,
    form,
    setForm,
    loadFeedingData,
    handleSubmitSupply,
    columns,
  } = useFeedingData();

  return (
    <div className="w-full flex flex-col gap-6 text-slate-900">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="NUTRICIÓN Y PLAN ALIMENTARIO"
        title="Alimentación y Suministro de Raciones"
        description="Control de raciones servidas por corral y fase nutricional, con afectación automática del stock en inventario y PostgreSQL."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              tone="primary"
              className="flex items-center gap-2 font-black rounded-xl! shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              Registrar Ración
            </Button>
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
                Fallo de sincronización nutricional
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <Button
            onClick={() => loadFeedingData(true)}
            tone="danger"
            className="text-xs shrink-0 self-start sm:self-center"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reintentar
          </Button>
        </div>
      )}

      {/* TARJETAS DE KPI SUPERIORES */}
      <FeedingKPIs
        totalKgServidos={totalKgServidos}
        rationsCount={rations.length}
        corralesAlimentados={corralesAlimentados}
        totalStockAlimento={totalStockAlimento}
        feedItemsCount={feedItems.length}
      />

      {/* ESTADO DE SILOS / INVENTARIO DE ALIMENTO EN TIEMPO REAL */}
      <SilosInventorySection feedItems={feedItems} />

      {/* FILTROS Y HISTORIAL DE SUMINISTROS */}
      <FeedingHistorySection
        filteredRations={filteredRations}
        columns={columns}
        corrales={corrales}
        filterCorral={filterCorral}
        setFilterCorral={setFilterCorral}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={() => loadFeedingData(false)}
        onOpenModal={() => setIsModalOpen(true)}
      />

      {/* MODAL DE REGISTRO DE SUMINISTRO */}
      <SupplyRationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
        setForm={setForm}
        corrales={corrales}
        feedItems={feedItems}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitSupply}
      />
    </div>
  );
}
