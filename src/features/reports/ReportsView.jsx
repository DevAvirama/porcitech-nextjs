"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Info,
  Bell,
  TrendingUp,
  PieChart,
  BarChart2,
  ArrowLeft,
  Calendar,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Download,
  Filter,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import ModuleHeader from "@/components/layout/ModuleHeader";

const ReportsView = () => {
  // Configuración de Reportes
  const [selectedReportType, setSelectedReportType] = useState("consolidado");
  const [dateRange, setDateRange] = useState("30dias");
  const [selectedBatch, setSelectedBatch] = useState("todos");

  // Estado de Generación
  const [activeReport, setActiveReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mocks de Base de Datos para simular reportes reales
  const dbAlerts = [
    {
      id: 1,
      type: "critical",
      title: "Caída de Consumo",
      desc: "El Lote #42 redujo su consumo diario en un 15%.",
      time: "Hace 2 horas",
    },
    {
      id: 2,
      type: "preventive",
      title: "Vacunación Próxima",
      desc: "14 hembras gestantes requieren vacuna contra Parvovirus.",
      time: "Hoy",
    },
    {
      id: 3,
      type: "preventive",
      title: "Revisión de Inventario",
      desc: "El alimento Pre-iniciador está por debajo del 20%.",
      time: "Ayer",
    },
  ];

  const dbKpiData = [
    {
      metrica: "Conversión Alimenticia",
      actual: "2.4",
      objetivo: "2.3",
      variacion: "+4.3%",
      estado: "Regular",
    },
    {
      metrica: "Tasa de Mortalidad",
      actual: "1.2%",
      objetivo: "< 2.0%",
      variacion: "-0.5%",
      estado: "Óptimo",
    },
    {
      metrica: "Total Nacimientos",
      actual: "142",
      objetivo: "135",
      variacion: "+5.1%",
      estado: "Óptimo",
    },
    {
      metrica: "GDP Promedio (Ceba)",
      actual: "910 g/d",
      objetivo: "900 g/d",
      variacion: "+1.1%",
      estado: "Óptimo",
    },
  ];

  const dbInventoryData = [
    {
      type: "Pre-iniciador",
      stock: "450 kg",
      capacity: "500 kg",
      state: "Óptimo",
    },
    {
      type: "Iniciador",
      stock: "800 kg",
      capacity: "1000 kg",
      state: "Óptimo",
    },
    {
      type: "Levante",
      stock: "1200 kg",
      capacity: "2000 kg",
      state: "Estable",
    },
    { type: "Ceba", stock: "300 kg", capacity: "2000 kg", state: "Crítico" },
  ];

  const dbVaccinationRecords = [
    {
      id: "2026-X1",
      type: "Vacuna",
      producto: "Peste Porcina Clásica",
      lote: "Lote B-24 / Corral 01",
      fecha: "2026-04-20",
      estado: "APLICADA",
      responsable: "Dr. Ricardo Gómez",
    },
    {
      id: "2026-X8",
      type: "Tratamiento",
      producto: "Complejo B Forte",
      lote: "Lote A-12 / Corral 05",
      fecha: "2026-04-22",
      estado: "EN CURSO",
      responsable: "Dra. Elena Martínez",
    },
    {
      id: "2026-Y4",
      type: "Vacuna",
      producto: "Circovirus Porcino",
      lote: "Lote C-02 / Corral 02",
      fecha: "2026-04-28",
      estado: "PENDIENTE",
      responsable: "Dr. Carlos Ruiz",
    },
  ];

  const dbReproductionEvents = [
    {
      id: "H-001",
      servicio: "2026-01-15",
      tipo: "Inseminación",
      partoEst: "2026-05-09",
      estado: "Gestante",
      dias: 108,
    },
    {
      id: "H-045",
      servicio: "2026-02-02",
      tipo: "Monta Natural",
      partoEst: "2026-05-27",
      estado: "Gestante",
      dias: 90,
    },
    {
      id: "H-112",
      servicio: "2026-04-10",
      tipo: "Inseminación",
      partoEst: "2026-08-02",
      estado: "Servida",
      dias: 15,
    },
    {
      id: "H-089",
      servicio: "2025-12-20",
      tipo: "Monta Natural",
      partoEst: "2026-04-12",
      estado: "Lactante",
      dias: null,
    },
  ];

  const dbWeightData = [
    {
      id: "L-001",
      etapa: "Pre-ceba",
      pesoInicial: "15.0 kg",
      pesoActual: "24.0 kg",
      gdp: "400 g/día",
      estado: "Óptimo",
    },
    {
      id: "L-002",
      etapa: "Levante",
      pesoInicial: "50.0 kg",
      pesoActual: "68.0 kg",
      gdp: "900 g/día",
      estado: "Excelente",
    },
    {
      id: "L-003",
      etapa: "Ceba",
      pesoInicial: "90.0 kg",
      pesoActual: "115.0 kg",
      gdp: "833 g/día",
      estado: "Óptimo",
    },
    {
      id: "L-004",
      etapa: "Pre-ceba",
      pesoInicial: "12.0 kg",
      pesoActual: "19.5 kg",
      gdp: "375 g/día",
      estado: "Regular",
    },
  ];

  // Lógica de Generación de Reporte
  const handleGenerateReport = () => {
    setIsGenerating(true);

    // Simulamos un delay de procesamiento de base de datos
    setTimeout(() => {
      let reportData = {
        title: "",
        dateGenerated: new Date().toLocaleDateString("es-CO", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        rangeLabel:
          dateRange === "7dias"
            ? "Últimos 7 días"
            : dateRange === "30dias"
              ? "Últimos 30 días"
              : dateRange === "trimestre"
                ? "Este Trimestre (90 días)"
                : "Histórico Completo",
        batchLabel:
          selectedBatch === "todos"
            ? "Todos los Lotes"
            : `Lote ${selectedBatch.toUpperCase()}`,
        generatedBy: "Dr. Alejandro Ruiz (Administrador de Granja)",
        code: `REP-${selectedReportType.toUpperCase().substring(0, 3)}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        type: selectedReportType,
      };

      switch (selectedReportType) {
        case "consolidado":
          reportData.title = "Reporte Consolidado de Desempeño General";
          reportData.kpis = dbKpiData;
          reportData.summaryText =
            "La granja opera bajo estándares de conversión óptimos (2.4 de promedio). Se reporta un incremento en la tasa de nacimientos con una mortalidad estable del 1.2%, cumpliendo las metas biológicas de Porkcolombia.";
          reportData.complianceNotes =
            "Se recomienda revisar el nivel del silo de Ceba para evitar interrupciones de suministro.";
          break;
        case "produccion":
          reportData.title = "Reporte de Crecimiento y Producción de Lotes";
          reportData.kpis = [
            {
              metrica: "GDP Promedio",
              actual: "627 g/día",
              objetivo: "650 g/día",
              variacion: "-3.5%",
              estado: "Regular",
            },
            {
              metrica: "Peso Promedio Final",
              actual: "115.0 kg",
              objetivo: "110.0 kg",
              variacion: "+4.5%",
              estado: "Óptimo",
            },
          ];
          reportData.tableCols = [
            { header: "ID Corral/Lote", key: "id" },
            { header: "Etapa Productiva", key: "etapa" },
            { header: "Peso Inicial", key: "pesoInicial" },
            { header: "Peso Actual", key: "pesoActual" },
            { header: "Ganancia Diaria (GDP)", key: "gdp" },
            { header: "Desempeño", key: "estado" },
          ];
          reportData.tableRows = dbWeightData;
          reportData.summaryText =
            "La velocidad de crecimiento en Levante se mantiene en niveles excelentes de 900 g/día. Sin embargo, en el Lote L-004 de Pre-ceba se observa una tasa regular de 375 g/día que requiere monitoreo nutricional.";
          reportData.complianceNotes =
            "Estándares cumplidos según guía de manejo zootécnico colombiana.";
          break;
        case "salud":
          reportData.title =
            "Reporte Sanitario y Control Clínico de Vacunación";
          reportData.kpis = [
            {
              metrica: "Eficacia Sanitaria",
              actual: "98.2%",
              objetivo: "95.0%",
              variacion: "+3.2%",
              estado: "Óptimo",
            },
            {
              metrica: "Dosis Aplicadas",
              actual: "18",
              objetivo: "20",
              variacion: "90%",
              estado: "Estable",
            },
          ];
          reportData.tableCols = [
            { header: "ID Registro", key: "id" },
            { header: "Procedimiento", key: "producto" },
            { header: "Lote / Destino", key: "lote" },
            { header: "Fecha Programada", key: "fecha" },
            { header: "Responsable", key: "responsable" },
            { header: "Estado", key: "estado" },
          ];
          reportData.tableRows = dbVaccinationRecords;
          reportData.summaryText =
            "El plan de inmunidad preventiva se está ejecutando conforme a la resolución ICA 50092. Se aplicó exitosamente la dosis contra Peste Porcina Clásica (PPC) en el corral 01.";
          reportData.complianceNotes =
            "Registros oficiales requeridos ante las auditorías del ICA.";
          break;
        case "reproduccion":
          reportData.title = "Reporte de Eficiencia Reproductiva y Farrowing";
          reportData.kpis = [
            {
              metrica: "Tasa de Parición",
              actual: "91.8%",
              objetivo: "90.0%",
              variacion: "+1.8%",
              estado: "Óptimo",
            },
            {
              metrica: "Tasa de Destete",
              actual: "92.0%",
              objetivo: "93.0%",
              variacion: "-1.0%",
              estado: "Regular",
            },
          ];
          reportData.tableCols = [
            { header: "ID Hembra", key: "id" },
            { header: "Fecha Servicio", key: "servicio" },
            { header: "Vía Reproductiva", key: "tipo" },
            { header: "Parto Estimado", key: "partoEst" },
            { header: "Gestation Days", key: "dias" },
            { header: "Estado Actual", key: "estado" },
          ];
          reportData.tableRows = dbReproductionEvents.map((row) => ({
            ...row,
            dias: row.dias ? `${row.dias} días` : "N/A",
          }));
          reportData.summaryText =
            "Se reportan 42 hembras en gestación confirmada. La hembra H-001 se encuentra en día 108 de gestación (parto inminente dentro de la ventana de alerta sanitaria de 7 días).";
          reportData.complianceNotes =
            "Ventana de aclimatación de parideras programada al 100%.";
          break;
        case "nutricion":
          reportData.title =
            "Reporte de Consumo Nutricional e Inventario de Silos";
          reportData.kpis = [
            {
              metrica: "Eficiencia de Conversión",
              actual: "2.40",
              objetivo: "2.30",
              variacion: "+4.3%",
              estado: "Regular",
            },
            {
              metrica: "Autonomía en Silos",
              actual: "12 días",
              objetivo: "15 días",
              variacion: "-3 días",
              estado: "Alerta",
            },
          ];
          reportData.tableCols = [
            { header: "Tipo de Alimento", key: "type" },
            { header: "Stock Físico", key: "stock" },
            { header: "Capacidad de Silo", key: "capacity" },
            { header: "Estado Crítico", key: "state" },
          ];
          reportData.tableRows = dbInventoryData;
          reportData.summaryText =
            "El silo de alimento 'Ceba' se encuentra en stock crítico (300 kg / 15% de capacidad). Se requiere reabastecimiento urgente de premezclas de engorde antes del fin de semana.";
          reportData.complianceNotes =
            "Consumo promedio diario registrado de 455 kg en total de la granja.";
          break;
        default:
          break;
      }

      setActiveReport(reportData);
      setIsGenerating(false);
    }, 850);
  };

  // Función para volver a la configuración
  const handleReset = () => {
    setActiveReport(null);
  };

  // Función nativa para imprimir / Exportar PDF
  const handlePrintPDF = () => {
    window.print();
  };

  // Renderizadores de columnas de tablas
  const kpiCols = [
    {
      header: "Métrica Clave",
      key: "metrica",
      render: (row) => (
        <span className="font-bold text-slate-800">{row.metrica}</span>
      ),
    },
    {
      header: "Valor Actual",
      key: "actual",
      render: (row) => (
        <span className="font-black text-slate-900">{row.actual}</span>
      ),
    },
    {
      header: "Objetivo",
      key: "objective",
      render: (row) => (
        <span className="text-slate-505 text-slate-500 font-semibold">
          {row.objetivo}
        </span>
      ),
    },
    {
      header: "Variación",
      key: "variacion",
      render: (row) => (
        <span
          className={`font-bold ${row.variacion.startsWith("+") && row.metrica !== "Conversión Alimenticia" ? "text-emerald-600" : row.metrica === "Conversión Alimenticia" && row.variacion.startsWith("+") ? "text-rose-600" : "text-emerald-600"}`}
        >
          {row.variacion}
        </span>
      ),
    },
    {
      header: "Estado",
      key: "estado",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${row.estado === "Óptimo" || row.estado === "Excelente" ? "bg-emerald-100 text-emerald-700 font-black" : "bg-orange-100 text-orange-700"}`}
        >
          {row.estado}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* HEADER DEL MÓDULO */}
      {!activeReport && (
        <ModuleHeader
          category="REPORTES Y ALERTAS"
          title="Alertas y Reportes"
          description="Centro de control y análisis de rendimiento de la granja."
          actions={
            <Button
              onClick={handlePrintPDF}
              tone="primary"
              className="flex items-center gap-2 font-bold rounded-xl! no-print"
            >
              <Download size={18} />
              Exportar PDF
            </Button>
          }
        />
      )}

      {/* RENDERIZADO DORMANT: CONFIGURADOR Y DASHBOARD */}
      {!activeReport && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de Configuración */}
          <Card className="lg:col-span-1 border border-slate-100 p-6 flex flex-col justify-between rounded-3xl bg-white shadow-sm no-print">
            <div className="space-y-6">
              <h3 className="text-lg font-black italic text-slate-800 flex items-center gap-2 border-b pb-3 border-slate-100">
                <Filter size={18} className="text-indigo-500" />
                Filtros del Reporte
              </h3>

              {/* 1. Tipo de reporte */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-505 text-slate-500 uppercase tracking-wider block">
                  Tipo de Reporte Técnico
                </label>
                <div className="relative">
                  <select
                    value={selectedReportType}
                    onChange={(e) => setSelectedReportType(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer appearance-none"
                  >
                    <option value="consolidado">Consolidado General</option>
                    <option value="produccion">
                      Crecimiento y Peso de Lotes
                    </option>
                    <option value="salud">
                      Sanitario (Clínico y Vacunación)
                    </option>
                    <option value="reproduccion">Reproducción y Partos</option>
                    <option value="nutricion">Alimentación y Silos</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* 2. Rango de fecha */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-505 text-slate-500 uppercase tracking-wider block">
                  Rango de Datos
                </label>
                <div className="relative">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer appearance-none"
                  >
                    <option value="7dias">Últimos 7 días</option>
                    <option value="30dias">Últimos 30 días</option>
                    <option value="trimestre">Este Trimestre (90 días)</option>
                    <option value="historico">Histórico Completo</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* 3. Lote */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-550 bg-transparent text-slate-500 uppercase tracking-wider block">
                  Foco por Lote
                </label>
                <div className="relative">
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer appearance-none"
                  >
                    <option value="todos">Todos los Lotes</option>
                    <option value="42">Lote #42 (Ceba)</option>
                    <option value="15">Lote #15 (Levante)</option>
                    <option value="12">Sector A-12</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl border-none shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer w-full text-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Procesando Datos...
                </>
              ) : (
                <>
                  <FileText size={18} />
                  Generar Reporte Oficial
                </>
              )}
            </Button>
          </Card>

          {/* Notificaciones y Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Bell className="text-slate-400 h-5 w-5" />
              <h3 className="text-lg font-black italic text-slate-800">
                Notificaciones Recientes
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dbAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex relative group hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-2 shrink-0 ${alert.type === "critical" ? "bg-rose-500" : "bg-amber-400"}`}
                  ></div>
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start">
                      <div
                        className={`p-2 rounded-xl ${alert.type === "critical" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}
                      >
                        {alert.type === "critical" ? (
                          <AlertTriangle size={18} />
                        ) : (
                          <Info size={18} />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {alert.time}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 mt-4">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {alert.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Graficos Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Gráfica de Crecimiento */}
              <Card className="p-6 border border-slate-100 flex flex-col justify-between rounded-4xl bg-white shadow-sm">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black italic text-slate-800 flex items-center gap-2">
                      <TrendingUp className="text-blue-500 h-6 w-6" />{" "}
                      Crecimiento Global
                    </h3>
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">
                      Últimos 6 meses
                    </span>
                  </div>
                  {/* Placeholder SVG para Gráfica de Líneas */}
                  <div className="h-64 w-full relative">
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="border-t border-slate-100 w-full h-0"
                        ></div>
                      ))}
                    </div>
                    <svg
                      className="w-full h-full relative z-10"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <polyline
                        points="0,80 20,65 40,55 60,35 80,25 100,10"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points="0,85 20,70 40,60 60,45 80,30 100,20"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="opacity-50"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex gap-4 mt-4 justify-center text-sm font-bold text-slate-500">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>{" "}
                    Real
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-50"></div>{" "}
                    Ideal
                  </span>
                </div>
              </Card>

              {/* Distribución de Lotes */}
              <Card className="p-6 border border-slate-100 flex flex-col justify-between rounded-4xl bg-white shadow-sm">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black italic text-slate-800 flex items-center gap-2">
                      <PieChart className="text-fuchsia-500 h-6 w-6" />{" "}
                      Distribución del Inventario
                    </h3>
                  </div>
                  <div className="flex justify-center items-center h-64">
                    <div className="relative w-48 h-48">
                      <svg
                        viewBox="0 0 100 100"
                        className="transform -rotate-90 w-full h-full"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#e2e8f0"
                          strokeWidth="20"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#10b981"
                          strokeWidth="20"
                          strokeDasharray="251.2"
                          strokeDashoffset="138.16"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#f59e0b"
                          strokeWidth="20"
                          strokeDasharray="251.2"
                          strokeDashoffset="175.84"
                          className="origin-center rotate-162"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#3b82f6"
                          strokeWidth="20"
                          strokeDasharray="251.2"
                          strokeDashoffset="213.52"
                          className="origin-center rotate-270"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#8b5cf6"
                          strokeWidth="20"
                          strokeDasharray="251.2"
                          strokeDashoffset="226.08"
                          className="origin-center rotate-324"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-slate-900">
                          1.5k
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Cerdos
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>{" "}
                    Ceba (45%)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>{" "}
                    Levante (30%)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>{" "}
                    Pre-cebo (15%)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>{" "}
                    Lactancia (10%)
                  </div>
                </div>
              </Card>
            </div>

            {/* KPIs del mes */}
            <div className="mt-8">
              <h3 className="text-lg font-black italic text-slate-800 mb-4">
                KPIs del Mes
              </h3>
              <div className="bg-white rounded-4xl shadow-sm overflow-hidden border border-slate-100 p-2">
                <Table columns={kpiCols} rows={dbKpiData} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDERIZADO ACTIVO: VISTA PREVIA IMPRIMIBLE DEL REPORTE GENERADO */}
      {activeReport && (
        <div className="space-y-6">
          {/* Barra de Acciones del Reporte (Oculta al imprimir) */}
          <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl shadow-md no-print">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors cursor-pointer bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700"
            >
              <ArrowLeft size={16} />
              Volver a Configuración
            </button>
            <Button
              onClick={handlePrintPDF}
              className="bg-sena-green hover:bg-sena-green/80 border-none text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-sena-green/30"
            >
              <Download size={18} />
              Exportar a PDF / Imprimir
            </Button>
          </div>

          {/* Plantilla A4 / Printable Document Container */}
          <Card className="printable-report bg-white text-slate-900 p-12 shadow-xl border border-slate-200 rounded-[2.5rem] max-w-225 mx-auto space-y-8 font-sans">
            {/* Header del Documento PDF */}
            <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6">
              <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-slate-955 uppercase italic">
                  Porci<span className="text-sena-green">Tech</span>
                </h1>
                <p className="text-xs font-black uppercase text-slate-500 tracking-widest">
                  Tecnología de Precisión Porcina
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  Alineado con estándares Porkcolombia e ICA
                </p>
              </div>
              <div className="text-right space-y-1 text-xs">
                <div className="bg-slate-100 text-slate-800 px-3 py-1 rounded-md font-bold inline-block">
                  CÓDIGO: {activeReport.code}
                </div>
                <p className="text-slate-500 font-medium mt-2">
                  <strong>Emisión:</strong> {activeReport.dateGenerated}
                </p>
                <p className="text-slate-500 font-medium">
                  <strong>Autor:</strong> Alejandro Ruiz
                </p>
              </div>
            </div>

            {/* Título de Reporte */}
            <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">
                {activeReport.title}
              </h2>
              <div className="flex justify-center gap-6 mt-2 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> <strong>Rango:</strong>{" "}
                  {activeReport.rangeLabel}
                </span>
                <span>•</span>
                <span>
                  <strong>Foco:</strong> {activeReport.batchLabel}
                </span>
              </div>
            </div>

            {/* Texto de Resumen Ejecutivo */}
            <div className="space-y-3">
              <h3 className="text-base font-black uppercase text-slate-955 tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-4 bg-sena-green rounded-full"></div>
                1. Resumen Ejecutivo
              </h3>
              <p className="text-sm leading-relaxed text-slate-700 font-medium bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                {activeReport.summaryText}
              </p>
            </div>

            {/* KPIs del Reporte */}
            {activeReport.kpis && (
              <div className="space-y-4">
                <h3 className="text-base font-black uppercase text-slate-955 tracking-wider flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-sena-green rounded-full"></div>
                  2. Indicadores Clave de Desempeño (KPIs)
                </h3>
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white p-1">
                  <Table columns={kpiCols} rows={activeReport.kpis} />
                </div>
              </div>
            )}

            {/* Detalle de Datos en Tabla si Aplica */}
            {activeReport.tableRows && (
              <div className="space-y-4">
                <h3 className="text-base font-black uppercase text-slate-955 tracking-wider flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-sena-green rounded-full"></div>
                  3. Detalle y Registros del Periodo
                </h3>
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white p-1">
                  <table className="w-full text-left border-collapse text-xs font-medium">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-black uppercase tracking-wider border-b border-slate-200 text-[10px]">
                        {activeReport.tableCols.map((col, idx) => (
                          <th
                            key={idx}
                            className="p-3.5 border-r border-slate-100 last:border-0"
                          >
                            {col.header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {activeReport.tableRows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          {activeReport.tableCols.map((col, cIdx) => (
                            <td
                              key={cIdx}
                              className="p-3.5 border-r border-slate-100 last:border-0 text-slate-700"
                            >
                              {row[col.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Gráfica de Líneas si es Reporte Consolidado o Producción */}
            {(activeReport.type === "consolidado" ||
              activeReport.type === "produccion") && (
              <div className="space-y-4">
                <h3 className="text-base font-black uppercase text-slate-955 tracking-wider flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-sena-green rounded-full"></div>
                  4. Curva Comparativa de Rendimiento y Conversión
                </h3>
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/20">
                  <div className="h-44 w-full relative">
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <polyline
                        points="0,80 20,65 40,55 60,35 80,25 100,10"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                      />
                      <polyline
                        points="0,85 20,70 40,60 60,45 80,30 100,20"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="opacity-50"
                      />
                    </svg>
                  </div>
                  <div className="flex gap-6 mt-4 justify-center text-xs font-black text-slate-500">
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-blue-500 rounded-full"></div>{" "}
                      Curva Real Obtenida
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-emerald-500 opacity-50 rounded-full border border-dashed border-emerald-500"></div>{" "}
                      Estándar Ideal Porkcolombia
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Sección de cumplimiento normativo ICA */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Control Regulatorio y Bioseguridad
              </h3>
              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <ShieldCheck
                  size={20}
                  className="text-emerald-600 shrink-0 mt-0.5"
                />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-800">
                    Verificación Zootécnica de Granja Biosegura
                  </p>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {activeReport.complianceNotes} Todos los datos contenidos en
                    este reporte han sido calculados de acuerdo a las variables
                    directas de pesaje, control clínico y consumo de alimento
                    balanceado diario. Granja registrada ante el ICA.
                  </p>
                </div>
              </div>
            </div>

            {/* Bloque de Firmas PDF */}
            <div className="grid grid-cols-2 gap-12 pt-16 text-center text-xs">
              <div className="space-y-2">
                <div className="border-b border-slate-400 mx-auto w-48 h-8"></div>
                <p className="font-bold text-slate-800">
                  Firma Responsable Técnico
                </p>
                <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">
                  Dr. Ricardo Gómez (MVZ)
                </p>
              </div>
              <div className="space-y-2">
                <div className="border-b border-slate-400 mx-auto w-48 h-8"></div>
                <p className="font-bold text-slate-800">Firma Administrador</p>
                <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">
                  Dr. Alejandro Ruiz
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
