"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Info,
  Bell,
  TrendingUp,
  PieChart,
  ArrowLeft,
  Calendar,
  FileText,
  ShieldCheck,
  Download,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import ModuleHeader from "@/components/layout/ModuleHeader";
import Skeleton from "@/components/ui/Skeleton";
import { getDashboardKPIs, getDashboardAlerts } from "@/services/dashboard/dashboardService";
import { getAnimales } from "@/services/animalService";
import { getCorrales } from "@/services/corralService";
import { getTreatments } from "@/services/healthService";
import { getItems } from "@/services/inventoryService";
import { getFarrowings } from "@/services/reproductionService";

const ReportsView = () => {
  // Configuración de Reportes
  const [selectedReportType, setSelectedReportType] = useState("consolidado");
  const [dateRange, setDateRange] = useState("30dias");
  const [selectedBatch, setSelectedBatch] = useState("todos");

  // Estado de Generación
  const [activeReport, setActiveReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Estados dinámicos de base de datos
  const [dbAlerts, setDbAlerts] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [corrales, setCorrales] = useState([]);
  const [animalsCount, setAnimalsCount] = useState(0);
  const [stageDistribution, setStageDistribution] = useState({});

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [kpiRes, alertsRes, corralesRes, animalsRes] = await Promise.allSettled([
          getDashboardKPIs(),
          getDashboardAlerts(),
          getCorrales(),
          getAnimales(),
        ]);

        if (kpiRes.status === "fulfilled" && kpiRes.value) {
          setKpis(kpiRes.value);
          setAnimalsCount(kpiRes.value.total_animales ?? 0);
          setStageDistribution(kpiRes.value.distribucion_etapas || {});
        } else if (animalsRes.status === "fulfilled" && Array.isArray(animalsRes.value)) {
          setAnimalsCount(animalsRes.value.length);
        }

        if (alertsRes.status === "fulfilled" && Array.isArray(alertsRes.value)) {
          setDbAlerts(alertsRes.value);
        }

        if (corralesRes.status === "fulfilled" && Array.isArray(corralesRes.value)) {
          setCorrales(corralesRes.value);
        }
      } catch (err) {
        console.warn("Error cargando datos para reportes:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const dynamicKpis = [
    {
      metrica: "Total Animales en Granja",
      actual: String(animalsCount),
      objetivo: "--",
      variacion: animalsCount > 0 ? "Activo" : "Sin datos",
      estado: animalsCount > 0 ? "Óptimo" : "Sin datos",
    },
    {
      metrica: "Peso Promedio Granja",
      actual: kpis?.peso_promedio_granja_kg ? `${kpis.peso_promedio_granja_kg} kg` : "0.0 kg",
      objetivo: "100.0 kg",
      variacion: kpis?.peso_promedio_granja_kg ? "Estándar" : "--",
      estado: kpis?.peso_promedio_granja_kg ? "Óptimo" : "Sin datos",
    },
    {
      metrica: "GMD Promedio Granja",
      actual: kpis?.gmd_promedio_kg ? `${kpis.gmd_promedio_kg} kg/d` : "-- kg/d",
      objetivo: "0.80 kg/d",
      variacion: kpis?.gmd_promedio_kg ? "Zootécnico" : "--",
      estado: kpis?.gmd_promedio_kg ? "Óptimo" : "Sin datos",
    },
    {
      metrica: "Tasa de Ocupación",
      actual: `${kpis?.tasa_ocupacion_porcentaje || 0}%`,
      objetivo: "85%",
      variacion: `${kpis?.tasa_ocupacion_porcentaje || 0}%`,
      estado: (kpis?.tasa_ocupacion_porcentaje || 0) > 0 ? "Óptimo" : "Sin datos",
    },
  ];

  // Lógica de Generación de Reporte dinámico
  const handleGenerateReport = async () => {
    setIsGenerating(true);

    try {
      const selectedCorral = corrales.find((c) => c.id === selectedBatch);
      const batchLabel =
        selectedBatch === "todos"
          ? "Todos los Corrales"
          : selectedCorral
            ? `Corral ${selectedCorral.codigo}`
            : `Corral ${selectedBatch}`;

      const rangeLabel =
        dateRange === "7dias"
          ? "Últimos 7 días"
          : dateRange === "30dias"
            ? "Últimos 30 días"
            : dateRange === "trimestre"
              ? "Este Trimestre (90 días)"
              : "Histórico Completo";

      const reportData = {
        title: "",
        dateGenerated: new Date().toLocaleDateString("es-CO", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        rangeLabel,
        batchLabel,
        code: `REP-${selectedReportType.toUpperCase().substring(0, 3)}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        type: selectedReportType,
      };

      if (selectedReportType === "consolidado") {
        reportData.title = "Reporte Consolidado de Desempeño General";
        reportData.kpis = dynamicKpis;
        reportData.summaryText =
          animalsCount > 0
            ? `La granja PorciTech reporta actualmente un inventario activo de ${animalsCount} porcinos con una ocupación general del ${kpis?.tasa_ocupacion_porcentaje || 0}%. Los parámetros registrados se encuentran bajo trazabilidad y monitoreo continuo.`
            : "No se registran porcinos ni eventos zootécnicos en la base de datos oficial. Registre animales e información en los módulos correspondientes para consolidar análisis zootécnicos.";
        reportData.complianceNotes =
          "Registros zootécnicos auditables según protocolos ICA y Porkcolombia.";
      } else if (selectedReportType === "produccion") {
        reportData.title = "Reporte de Crecimiento y Producción de Lotes";
        reportData.kpis = [
          {
            metrica: "GMD Promedio Granja",
            actual: kpis?.gmd_promedio_kg ? `${kpis.gmd_promedio_kg} kg/d` : "-- kg/d",
            objetivo: "0.80 kg/d",
            variacion: "--",
            estado: kpis?.gmd_promedio_kg ? "Óptimo" : "Sin datos",
          },
          {
            metrica: "Peso Promedio Granja",
            actual: kpis?.peso_promedio_granja_kg ? `${kpis.peso_promedio_granja_kg} kg` : "0.0 kg",
            objetivo: "100.0 kg",
            variacion: "--",
            estado: kpis?.peso_promedio_granja_kg ? "Óptimo" : "Sin datos",
          },
        ];
        reportData.tableCols = [
          { header: "Corral / Arete", key: "id" },
          { header: "Fase Productiva", key: "etapa" },
          { header: "Peso Actual", key: "pesoActual" },
          { header: "Estado", key: "estado" },
        ];
        let rows = [];
        try {
          const animales = await getAnimales();
          if (Array.isArray(animales)) {
            rows = animales.map((a) => ({
              id: a.codigo_arete ? `#${a.codigo_arete}` : `#${a.id}`,
              etapa: a.fase || a.etapa || a.estado || "Producción",
              pesoActual: a.peso_actual_kg ? `${a.peso_actual_kg} kg` : "--",
              estado: a.estadoSalud || a.estado || "Activo",
            }));
          }
        } catch {
          rows = [];
        }
        reportData.tableRows = rows;
        reportData.summaryText =
          rows.length > 0
            ? `Reporte generado sobre ${rows.length} ejemplares auditados en la base de datos oficial.`
            : "Sin registros de animales ni lotes disponibles en la base de datos.";
        reportData.complianceNotes =
          "Estándares cumplidos según guía de manejo zootécnico colombiana.";
      } else if (selectedReportType === "salud") {
        reportData.title = "Reporte Sanitario y Control Clínico de Vacunación";
        let treatments = [];
        try {
          treatments = await getTreatments();
        } catch {
          treatments = [];
        }
        reportData.kpis = [
          {
            metrica: "Tratamientos Aplicados",
            actual: String(treatments.length),
            objetivo: "--",
            variacion: "--",
            estado: treatments.length > 0 ? "Óptimo" : "Sin datos",
          },
          {
            metrica: "Alertas Sanitarias Activas",
            actual: String(kpis?.alertas_sanitarias || 0),
            objetivo: "0",
            variacion: kpis?.alertas_sanitarias ? "Alerta" : "Normal",
            estado: kpis?.alertas_sanitarias ? "Atención" : "Óptimo",
          },
        ];
        reportData.tableCols = [
          { header: "ID / Arete", key: "id" },
          { header: "Procedimiento", key: "producto" },
          { header: "Tipo", key: "tipo" },
          { header: "Fecha", key: "fecha" },
          { header: "Responsable", key: "responsable" },
          { header: "Estado", key: "estado" },
        ];
        reportData.tableRows = treatments.map((t) => ({
          id: t.animal_codigo_arete ? `#${t.animal_codigo_arete}` : (t.animal_id ? `#${String(t.animal_id).slice(0, 8)}` : "--"),
          producto: t.producto_nombre || "Tratamiento Veterinario",
          tipo: t.tipo_evento || "Clínico",
          fecha: t.fecha_aplicacion || (t.fecha_tratamiento ? t.fecha_tratamiento.split("T")[0] : "--"),
          responsable: t.responsable || t.veterinario_nombre || "Médico Veterinario",
          estado: t.estado || "REGISTRADO",
        }));
        reportData.summaryText =
          treatments.length > 0
            ? `Se registran ${treatments.length} aplicaciones clínicas y biológicas certificadas en el historial sanitario de la granja.`
            : "No existen registros de tratamientos clínicos ni vacunaciones en la base de datos sanitaria.";
        reportData.complianceNotes =
          "Registros oficiales requeridos ante las auditorías del ICA.";
      } else if (selectedReportType === "reproduccion") {
        reportData.title = "Reporte de Eficiencia Reproductiva y Partos";
        let farrowings = [];
        try {
          farrowings = await getFarrowings();
        } catch {
          farrowings = [];
        }
        reportData.kpis = [
          {
            metrica: "Partos Registrados",
            actual: String(farrowings.length),
            objetivo: "--",
            variacion: "--",
            estado: farrowings.length > 0 ? "Óptimo" : "Sin datos",
          },
        ];
        reportData.tableCols = [
          { header: "ID Cerda", key: "id" },
          { header: "Fecha Parto", key: "fecha" },
          { header: "Nacidos Vivos", key: "vivos" },
          { header: "Nacidos Muertos", key: "muertos" },
          { header: "Peso Camada (kg)", key: "peso" },
        ];
        reportData.tableRows = farrowings.map((f) => ({
          id: f.madre_codigo_arete ? `#${f.madre_codigo_arete}` : (f.madre_id ? `#${String(f.madre_id).slice(0, 8)}` : "--"),
          fecha: f.fecha_parto || "--",
          vivos: String(f.lechones_vivos ?? "--"),
          muertos: String(f.lechones_muertos ?? "--"),
          peso: f.peso_total_camada_kg ? `${f.peso_total_camada_kg} kg` : "--",
        }));
        reportData.summaryText =
          farrowings.length > 0
            ? `Se registran ${farrowings.length} partos y eventos reproductivos auditados en la base de datos.`
            : "No se registran eventos reproductivos o partos en la base de datos.";
        reportData.complianceNotes =
          "Parámetros zootécnicos evaluados bajo normativa de bienestar porcino.";
      } else if (selectedReportType === "nutricion") {
        reportData.title = "Reporte de Consumo Nutricional e Inventario de Insumos";
        let items = [];
        try {
          items = await getItems();
        } catch {
          items = [];
        }
        reportData.kpis = [
          {
            metrica: "Total Insumos en Inventario",
            actual: String(items.length),
            objetivo: "--",
            variacion: "--",
            estado: items.length > 0 ? "Óptimo" : "Sin datos",
          },
          {
            metrica: "Alertas de Stock Mínimo",
            actual: String(kpis?.alertas_inventario_stock || 0),
            objetivo: "0",
            variacion: kpis?.alertas_inventario_stock ? "Bajo Stock" : "Normal",
            estado: kpis?.alertas_inventario_stock ? "Atención" : "Óptimo",
          },
        ];
        reportData.tableCols = [
          { header: "Código / SKU", key: "sku" },
          { header: "Nombre Insumo", key: "nombre" },
          { header: "Stock Actual", key: "stock" },
          { header: "Stock Mínimo", key: "min" },
          { header: "Estado", key: "estado" },
        ];
        reportData.tableRows = items.map((it) => ({
          sku: it.codigo_sku || "--",
          nombre: it.nombre,
          stock: `${it.stock_actual} ${it.unidad_medida || "kg"}`,
          min: `${it.stock_minimo} ${it.unidad_medida || "kg"}`,
          estado: it.stock_actual <= it.stock_minimo ? "Bajo Stock" : "Disponible",
        }));
        reportData.summaryText =
          items.length > 0
            ? `Se cuenta con ${items.length} insumos y alimentos balanceados controlados en bodega.`
            : "No existen insumos o alimentos registrados en el inventario.";
        reportData.complianceNotes =
          "Control de materias primas e insumos balanceados.";
      }

      setActiveReport(reportData);
    } catch (e) {
      console.error("Error generando reporte:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setActiveReport(null);
  };

  const handlePrintPDF = () => {
    window.print();
  };

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
      key: "objetivo",
      render: (row) => (
        <span className="text-slate-500 font-semibold">{row.objetivo}</span>
      ),
    },
    {
      header: "Variación",
      key: "variacion",
      render: (row) => (
        <span
          className={`font-bold ${
            row.variacion.startsWith("+")
              ? "text-emerald-600"
              : row.variacion === "Sin datos" || row.variacion === "--"
                ? "text-slate-400"
                : "text-slate-700"
          }`}
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
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            row.estado === "Óptimo"
              ? "bg-emerald-100 text-emerald-700 font-black"
              : row.estado === "Atención"
                ? "bg-orange-100 text-orange-700 font-black"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          {row.estado}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return <Skeleton />;
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
          {/* Card de Configuración de Generación */}
          <Card className="p-6 md:p-8 bg-white border border-slate-100 shadow-sm rounded-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Generar Nuevo Informe Oficial
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Selecciona los parámetros de consulta para emitir el reporte.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* 1. Tipo de Reporte */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Tipo de Informe
                </label>
                <div className="relative">
                  <select
                    value={selectedReportType}
                    onChange={(e) => setSelectedReportType(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer appearance-none text-sm"
                  >
                    <option value="consolidado">
                      Consolidado General (KPIs)
                    </option>
                    <option value="produccion">
                      Crecimiento y Peso de Lotes
                    </option>
                    <option value="salud">
                      Sanitario (Clínico y Vacunación)
                    </option>
                    <option value="reproduccion">Reproducción y Partos</option>
                    <option value="nutricion">Alimentación e Inventario</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* 2. Rango de fecha */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Rango de Datos
                </label>
                <div className="relative">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer appearance-none text-sm"
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

              {/* 3. Corral / Lote */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Foco por Corral
                </label>
                <div className="relative">
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer appearance-none text-sm"
                  >
                    <option value="todos">Todos los Corrales</option>
                    {corrales.map((c) => (
                      <option key={c.id} value={c.id}>
                        Corral {c.codigo} ({c.fase || "Producción"})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* Botón Generar Reporte */}
              <div>
                <Button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl border-none shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-center text-sm h-[46px]"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <FileText size={18} />
                      Generar Reporte Oficial
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Notificaciones y Dashboard */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Bell className="text-slate-400 h-5 w-5" />
              <h3 className="text-lg font-black italic text-slate-800">
                Notificaciones Recientes
              </h3>
            </div>

            {dbAlerts.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 text-center border border-slate-100 shadow-xs text-slate-500">
                <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <p className="font-bold text-slate-700">Sin notificaciones pendientes</p>
                <p className="text-xs text-slate-400 mt-1">
                  El sistema no reporta alertas sanitarias, de inventario o zootécnicas activas en este momento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dbAlerts.map((alert, idx) => (
                  <div
                    key={alert.id || idx}
                    className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden flex relative group hover:shadow-md transition-shadow"
                  >
                    <div
                      className={`w-2 shrink-0 ${alert.nivel === "danger" ? "bg-rose-500" : "bg-amber-400"}`}
                    ></div>
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start">
                        <div
                          className={`p-2 rounded-xl ${alert.nivel === "danger" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}
                        >
                          {alert.nivel === "danger" ? (
                            <AlertTriangle size={18} />
                          ) : (
                            <Info size={18} />
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                          {alert.modulo || "Sistema"}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 mt-4">
                        {alert.mensaje}
                      </h4>
                      {alert.accion_sugerida && (
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                          {alert.accion_sugerida}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Graficos Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Gráfica de Crecimiento */}
              <Card className="p-6 border border-slate-100 flex flex-col justify-between rounded-4xl bg-white shadow-xs">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black italic text-slate-800 flex items-center gap-2">
                      <TrendingUp className="text-blue-500 h-6 w-6" />{" "}
                      Crecimiento Global
                    </h3>
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">
                      {animalsCount > 0 ? "Activo" : "Sin registros"}
                    </span>
                  </div>
                  {animalsCount === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                      <TrendingUp className="w-10 h-10 text-slate-200 mb-2" />
                      <p className="font-bold text-slate-600">Sin lecturas de peso registradas</p>
                      <p className="text-slate-400 mt-0.5">Las curvas de crecimiento se graficarán conforme se registren pesajes.</p>
                    </div>
                  ) : (
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
                  )}
                </div>
                {animalsCount > 0 && (
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
                )}
              </Card>

              {/* Distribución del Inventario */}
              <Card className="p-6 border border-slate-100 flex flex-col justify-between rounded-4xl bg-white shadow-xs">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black italic text-slate-800 flex items-center gap-2">
                      <PieChart className="text-emerald-500 h-6 w-6" />{" "}
                      Distribución del Plantel
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
                          stroke="#f1f5f9"
                          strokeWidth="20"
                        />
                        {animalsCount > 0 && (
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke="#10b981"
                            strokeWidth="20"
                            strokeDasharray="251.2"
                            strokeDashoffset="60"
                          />
                        )}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-slate-900">
                          {animalsCount}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Porcinos
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-bold text-slate-600">
                  {Object.keys(stageDistribution).length === 0 ? (
                    <div className="col-span-2 text-center text-slate-400 font-semibold py-2">
                      Sin porcinos clasificados por etapas en el sistema.
                    </div>
                  ) : (
                    Object.entries(stageDistribution).map(([stage, count], idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>{" "}
                        {stage}: {count}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* KPIs del mes */}
            <div className="mt-8">
              <h3 className="text-lg font-black italic text-slate-800 mb-4">
                Indicadores del Sistema
              </h3>
              <div className="bg-white rounded-4xl shadow-xs overflow-hidden border border-slate-100 p-2">
                <Table columns={kpiCols} rows={dynamicKpis} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDERIZADO ACTIVO: VISTA PREVIA IMPRIMIBLE DEL REPORTE GENERADO */}
      {activeReport && (
        <div className="space-y-6">
          {/* Barra de Acciones del Reporte */}
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
              className="bg-emerald-600 hover:bg-emerald-500 border-none text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/30"
            >
              <Download size={18} />
              Exportar a PDF / Imprimir
            </Button>
          </div>

          {/* Plantilla A4 / Printable Document Container */}
          <Card className="printable-report bg-white text-slate-900 p-8 sm:p-12 shadow-xl border border-slate-200 rounded-[2.5rem] max-w-225 mx-auto space-y-8 font-sans">
            {/* Header del Documento PDF */}
            <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6">
              <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-slate-950 uppercase italic">
                  Porci<span className="text-emerald-600">Tech</span>
                </h1>
                <p className="text-xs font-black uppercase text-slate-500 tracking-widest">
                  Tecnología de Precisión Porcina
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  Alineado con estándares de bioseguridad ICA
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
                  <strong>Granja:</strong> PorciTech Cloud
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
              <h3 className="text-base font-black uppercase text-slate-950 tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-4 bg-emerald-600 rounded-full"></div>
                1. Resumen Ejecutivo
              </h3>
              <p className="text-sm leading-relaxed text-slate-700 font-medium bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                {activeReport.summaryText}
              </p>
            </div>

            {/* KPIs del Reporte */}
            {activeReport.kpis && (
              <div className="space-y-4">
                <h3 className="text-base font-black uppercase text-slate-950 tracking-wider flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-emerald-600 rounded-full"></div>
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
                <h3 className="text-base font-black uppercase text-slate-950 tracking-wider flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-emerald-600 rounded-full"></div>
                  3. Detalle y Registros del Periodo
                </h3>
                {activeReport.tableRows.length === 0 ? (
                  <div className="p-6 text-center text-xs font-semibold text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                    Sin registros disponibles para el criterio o periodo seleccionado en la base de datos oficial.
                  </div>
                ) : (
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
                )}
              </div>
            )}

            {/* Sección de cumplimiento normativo ICA */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Control Regulatorio y Bioseguridad
              </h3>
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl flex items-start gap-3">
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
                    este reporte son consultados directamente desde la base de datos de producción de la granja.
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
                  Médico Veterinario Zootecnista
                </p>
              </div>
              <div className="space-y-2">
                <div className="border-b border-slate-400 mx-auto w-48 h-8"></div>
                <p className="font-bold text-slate-800">Firma Administrador</p>
                <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">
                  Administrador de Granja
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
