"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getDashboardKPIs, getDashboardAlerts } from "@/services/dashboard/dashboardService";
import { getAnimales } from "@/services/animalService";
import { getCorrales } from "@/services/corralService";
import { getTreatments } from "@/services/healthService";
import { getItems } from "@/services/inventoryService";
import { getFarrowings } from "@/services/reproductionService";

export function useReportsData() {
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

  const dynamicKpis = useMemo(() => [
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
  ], [animalsCount, kpis]);

  const kpiCols = useMemo(() => [
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
  ], []);

  // Lógica de Generación de Reporte dinámico
  const handleGenerateReport = useCallback(async () => {
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
        reportData.tableRows = treatments.map((t) => {
          const arete = t.animal_arete || t.animal_codigo_arete;
          return {
            id: arete ? `#${arete}` : (t.animal_id ? `#${String(t.animal_id).slice(0, 8)}` : "--"),
            producto: t.producto_nombre || "Tratamiento Veterinario",
            tipo: t.tipo_evento || "Clínico",
            fecha: t.fecha_aplicacion || (t.fecha_tratamiento ? t.fecha_tratamiento.split("T")[0] : "--"),
            responsable: t.responsable || t.veterinario_nombre || "Médico Veterinario",
            estado: t.estado || "REGISTRADO",
          };
        });
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
        reportData.tableRows = farrowings.map((f) => {
          const madreArete = f.hembra_arete || f.madre_codigo_arete;
          const madreId = f.hembra_id || f.madre_id;
          const vivos = f.nacidos_vivos ?? f.lechones_vivos;
          const muertos = f.nacidos_muertos ?? f.lechones_muertos;
          const pesoCamada = f.peso_camada_total_kg ?? f.peso_total_camada_kg;
          return {
            id: madreArete ? `#${madreArete}` : (madreId ? `#${String(madreId).slice(0, 8)}` : "--"),
            fecha: f.fecha_parto ? String(f.fecha_parto).split("T")[0] : "--",
            vivos: String(vivos ?? "--"),
            muertos: String(muertos ?? "--"),
            peso: pesoCamada != null ? `${pesoCamada} kg` : "--",
          };
        });
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
  }, [corrales, dateRange, dynamicKpis, kpis, selectedBatch, selectedReportType, animalsCount]);

  const handleReset = useCallback(() => {
    setActiveReport(null);
  }, []);

  const handlePrintPDF = useCallback(() => {
    window.print();
  }, []);

  return {
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
    kpis,
    corrales,
    animalsCount,
    stageDistribution,
    dynamicKpis,
    kpiCols,
    handleGenerateReport,
    handleReset,
    handlePrintPDF,
  };
}
