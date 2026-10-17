"use client";

import React from "react";
import ModuleHeader from "@/components/layout/ModuleHeader";
import Skeleton from "@/components/ui/Skeleton";

import { useReportsData } from "./hooks/useReportsData";
import ReportConfigCard from "./components/ReportConfigCard";
import ReportsDashboard from "./components/ReportsDashboard";
import PrintableReportPreview from "./components/PrintableReportPreview";

export default function ReportsView() {
  const {
    selectedReportType,
    setSelectedReportType,
    dateRange,
    setDateRange,
    selectedBatch,
    setSelectedBatch,
    activeReport,
    isGenerating,
    isLoading,
    dbAlerts,
    corrales,
    animalsCount,
    stageDistribution,
    dynamicKpis,
    kpiCols,
    handleGenerateReport,
    handleReset,
    handlePrintPDF,
  } = useReportsData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-44 w-full rounded-4xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-72 w-full rounded-4xl" />
          <Skeleton className="h-72 w-full rounded-4xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <ModuleHeader
        title="Reportes y Analítica Zootécnica"
        description="Generación de informes de desempeño, trazabilidad sanitaria y métricas operativas."
      />

      {/* RENDERIZADO ESTÁNDAR: CONFIGURACIÓN Y DASHBOARD */}
      {!activeReport && (
        <div className="space-y-8">
          <ReportConfigCard
            selectedReportType={selectedReportType}
            setSelectedReportType={setSelectedReportType}
            dateRange={dateRange}
            setDateRange={setDateRange}
            selectedBatch={selectedBatch}
            setSelectedBatch={setSelectedBatch}
            corrales={corrales}
            isGenerating={isGenerating}
            onGenerateReport={handleGenerateReport}
          />

          <ReportsDashboard
            dbAlerts={dbAlerts}
            animalsCount={animalsCount}
            stageDistribution={stageDistribution}
            dynamicKpis={dynamicKpis}
            kpiCols={kpiCols}
          />
        </div>
      )}

      {/* RENDERIZADO ACTIVO: VISTA PREVIA IMPRIMIBLE DEL REPORTE GENERADO */}
      {activeReport && (
        <PrintableReportPreview
          activeReport={activeReport}
          kpiCols={kpiCols}
          onReset={handleReset}
          onPrintPDF={handlePrintPDF}
        />
      )}
    </div>
  );
}
