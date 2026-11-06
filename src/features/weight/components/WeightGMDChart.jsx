"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Activity,
  RefreshCw,
  Scale,
  ArrowUpRight,
  Award,
  Calendar,
  Layers,
} from "lucide-react";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { getCorralGMD } from "@/services/weightService";

// Metas de Ganancia Media Diaria (g/día) según referencia Porkcolombia por etapa
const PORKCOLOMBIA_GMD_TARGETS = {
  precebo: { min: 320, target: 400, max: 450, label: "Precebo (320–450 g/d)" },
  levante: { min: 750, target: 850, max: 950, label: "Levante (800–950 g/d)" },
  ceba: { min: 800, target: 900, max: 1000, label: "Ceba / Finalización (800–950 g/d)" },
  engorde: { min: 800, target: 900, max: 1000, label: "Engorde (800–950 g/d)" },
  gestacion: { min: 350, target: 450, max: 550, label: "Gestación / Pie de Cría" },
  maternidad: { min: 0, target: 300, max: 500, label: "Maternidad / Lactancia" },
  cuarentena: { min: 400, target: 600, max: 800, label: "Observación / Cuarentena" },
};

export default function WeightGMDChart({ corrales, onNavigateToIA }) {
  const [analyticsCorralId, setAnalyticsCorralId] = useState("");
  const [gmdData, setGmdData] = useState([]);
  const [isLoadingGMD, setIsLoadingGMD] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Seleccionar por defecto el primer corral productivo (Ceba o Levante si existe)
  useEffect(() => {
    if (corrales.length > 0 && !analyticsCorralId) {
      const preferred =
        corrales.find((c) => ["ceba", "engorde", "levante"].includes((c.fase || "").toLowerCase())) ||
        corrales[0];
      setAnalyticsCorralId(preferred.id);
    }
  }, [corrales, analyticsCorralId]);

  useEffect(() => {
    if (analyticsCorralId) {
      setIsLoadingGMD(true);
      setHoveredIdx(null);
      getCorralGMD(analyticsCorralId, 30)
        .then((data) => {
          setGmdData(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.warn("Aviso al obtener GMD de TimescaleDB:", err.message);
          setGmdData([]);
        })
        .finally(() => {
          setIsLoadingGMD(false);
        });
    }
  }, [analyticsCorralId]);

  const selectedCorral = useMemo(
    () => corrales.find((c) => c.id === analyticsCorralId) || null,
    [corrales, analyticsCorralId],
  );

  const faseKey = (selectedCorral?.fase || "levante").toLowerCase();
  const benchmark = PORKCOLOMBIA_GMD_TARGETS[faseKey] || PORKCOLOMBIA_GMD_TARGETS.levante;

  // Ordenar cronológicamente de más antiguo (izquierda) a más reciente (derecha)
  const chronologicalData = useMemo(() => {
    if (!Array.isArray(gmdData) || gmdData.length === 0) return [];
    return [...gmdData].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, [gmdData]);

  // Métricas consolidadas del periodo para tarjetas superiores
  const metrics = useMemo(() => {
    if (chronologicalData.length === 0) {
      return {
        initialWeight: 0,
        currentWeight: 0,
        totalGainKg: 0,
        totalGainPct: 0,
        avgGmdGrams: 0,
        totalReadings: 0,
      };
    }
    const first = chronologicalData[0];
    const last = chronologicalData[chronologicalData.length - 1];
    const initialWeight = Number(first.peso_promedio_kg || 0);
    const currentWeight = Number(last.peso_promedio_kg || 0);
    const totalGainKg = currentWeight - initialWeight;
    const totalGainPct =
      initialWeight > 0 ? ((totalGainKg / initialWeight) * 100).toFixed(1) : "0.0";

    const validGmds = chronologicalData
      .map((d) => Number(d.gmd_kg))
      .filter((v) => !isNaN(v) && v > 0);

    let avgGmdGrams = 0;
    if (validGmds.length > 0) {
      const avgKg = validGmds.reduce((a, b) => a + b, 0) / validGmds.length;
      avgGmdGrams = Math.round(avgKg * 1000);
    } else if (chronologicalData.length >= 2) {
      const daysDiff = Math.max(
        1,
        (new Date(last.fecha) - new Date(first.fecha)) / (1000 * 60 * 60 * 24),
      );
      avgGmdGrams = Math.round((totalGainKg / daysDiff) * 1000);
    }

    const totalReadings = chronologicalData.reduce(
      (acc, d) => acc + Number(d.total_pesajes || 0),
      0,
    );

    return {
      initialWeight,
      currentWeight,
      totalGainKg,
      totalGainPct,
      avgGmdGrams,
      totalReadings,
    };
  }, [chronologicalData]);

  // Geometría SVG con sistema de coordenadas fijo (860 x 320)
  const chartGeometry = useMemo(() => {
    if (chronologicalData.length === 0) return null;

    const width = 860;
    const height = 310;
    const padLeft = 68;
    const padRight = 36;
    const padTop = 34;
    const padBottom = 52;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const weights = chronologicalData.map((d) => Number(d.peso_promedio_kg || 0));
    const minValues = chronologicalData.map((d) =>
      Number(d.peso_minimo_kg || d.peso_promedio_kg || 0),
    );
    const maxValues = chronologicalData.map((d) =>
      Number(d.peso_maximo_kg || d.peso_promedio_kg || 0),
    );

    const rawMin = Math.min(...minValues, ...weights);
    const rawMax = Math.max(...maxValues, ...weights);
    const spread = Math.max(rawMax - rawMin, 6);
    const yMin = Math.max(0, Math.floor((rawMin - spread * 0.22) / 2) * 2);
    const yMax = Math.ceil((rawMax + spread * 0.22) / 2) * 2;
    const yRange = Math.max(yMax - yMin, 1);

    const getX = (idx) => {
      if (chronologicalData.length === 1) return padLeft + plotW / 2;
      return padLeft + (idx / (chronologicalData.length - 1)) * plotW;
    };

    const getY = (val) => {
      return padTop + plotH - ((val - yMin) / yRange) * plotH;
    };

    const points = chronologicalData.map((pt, idx) => {
      const avg = Number(pt.peso_promedio_kg || 0);
      const minW = Number(pt.peso_minimo_kg || avg);
      const maxW = Number(pt.peso_maximo_kg || avg);
      const gmdGrams =
        pt.gmd_kg !== null && pt.gmd_kg !== undefined
          ? Math.round(Number(pt.gmd_kg) * 1000)
          : null;
      const dateObj = new Date(pt.fecha);
      const shortDate = dateObj.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
      });
      const fullDate = dateObj.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      return {
        idx,
        x: getX(idx),
        y: getY(avg),
        yMinBand: getY(minW),
        yMaxBand: getY(maxW),
        avg,
        minW,
        maxW,
        gmdGrams,
        variacion: Number(pt.variacion_porcentual || 0),
        totalPesajes: Number(pt.total_pesajes || 1),
        shortDate,
        fullDate,
      };
    });

    // Curva principal y área sombreada bajo la curva
    const linePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    const areaPath =
      points.length > 1
        ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(
            padTop + plotH
          ).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + plotH).toFixed(
            1,
          )} Z`
        : "";

    // Banda de dispersión (Peso Mínimo a Peso Máximo del corral en cada fecha)
    const rangeBandPath =
      points.length > 1
        ? [
            ...points.map(
              (p, i) =>
                `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.yMaxBand.toFixed(1)}`,
            ),
            ...[...points]
              .reverse()
              .map((p) => `L ${p.x.toFixed(1)} ${p.yMinBand.toFixed(1)}`),
            "Z",
          ].join(" ")
        : "";

    // 5 líneas horizontales de referencia en el eje Y
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const value = yMin + ratio * yRange;
      return {
        value: value.toFixed(1),
        y: getY(value),
      };
    });

    return {
      width,
      height,
      padLeft,
      padRight,
      padTop,
      padBottom,
      plotW,
      plotH,
      points,
      linePath,
      areaPath,
      rangeBandPath,
      yTicks,
    };
  }, [chronologicalData]);

  const activePoint =
    chartGeometry && chartGeometry.points.length > 0
      ? chartGeometry.points[
          hoveredIdx !== null ? hoveredIdx : chartGeometry.points.length - 1
        ]
      : null;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. CABECERA Y SELECTOR DE CORRAL */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={20} />
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Curva de Crecimiento y Ganancia Media Diaria (GMD)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Serie temporal cronológica calculada por la vista continua{" "}
            <code className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
              vista_gmd_diaria_corral
            </code>{" "}
            en TimescaleDB.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Corral:
          </span>
          <select
            value={analyticsCorralId}
            onChange={(e) => setAnalyticsCorralId(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 outline-none focus:border-blue-500 cursor-pointer shadow-xs"
          >
            {corrales.map((c) => (
              <option key={c.id} value={c.id}>
                {c.codigo} — Etapa: {c.fase?.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. ESTADO DE CARGA O VACÍO */}
      {isLoadingGMD ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100 flex flex-col items-center justify-center gap-2">
          <RefreshCw size={24} className="animate-spin text-blue-500" />
          <p className="text-xs font-bold text-slate-600">
            Consultando hipertabla y agregados continuos en TimescaleDB...
          </p>
        </div>
      ) : chronologicalData.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Sin lecturas de peso registradas en este corral"
          description="Aún no se han acumulado lecturas de peso en TimescaleDB para calcular la curva de Ganancia Media Diaria en este corral."
          actionLabel="Registrar Primer Pesaje"
          onAction={onNavigateToIA}
        />
      ) : (
        <>
          {/* 3. RESUMEN EJECUTIVO DEL CORRAL SELECCIONADO (4 KPIs intuitivos) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Scale size={14} className="text-slate-400" />
                Peso Inicial del Lote
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800">
                  {metrics.initialWeight.toFixed(1)} kg
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  ({chartGeometry?.points[0]?.shortDate})
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Primer corte registrado en el periodo
              </p>
            </Card>

            <Card className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-blue-600" />
                Peso Promedio Actual
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-600">
                  {metrics.currentWeight.toFixed(1)} kg
                </span>
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    metrics.totalGainKg >= 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {metrics.totalGainKg >= 0 ? "+" : ""}
                  {metrics.totalGainKg.toFixed(1)} kg ({metrics.totalGainPct}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Ganancia acumulada en {chronologicalData.length} controles
              </p>
            </Card>

            <Card className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ArrowUpRight size={14} className="text-emerald-600" />
                Ganancia Media Diaria (GMD)
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600">
                  +{metrics.avgGmdGrams} g/día
                </span>
                <span className="text-xs font-bold text-slate-400">
                  ({(metrics.avgGmdGrams / 1000).toFixed(2)} kg/d)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Velocidad de engorde diario del corral
              </p>
            </Card>

            <Card className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award size={14} className="text-indigo-600" />
                Estándar Porkcolombia
              </span>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-black text-slate-900">
                  Meta: {benchmark.target} g/d
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                    metrics.avgGmdGrams >= benchmark.min
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-amber-100 text-amber-800 border-amber-200"
                  }`}
                >
                  {metrics.avgGmdGrams >= benchmark.min ? "Cumple Meta" : "En Ajuste"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{benchmark.label}</p>
            </Card>
          </div>

          {/* 4. LIENZO PRINCIPAL DE LA GRÁFICA INTERACTIVA */}
          <Card className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            {/* Barra de leyenda e inspección interactiva */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-block ring-4 ring-blue-100" />
                  <span>Peso Promedio del Corral (kg)</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-slate-500">
                  <span className="w-4 h-2.5 rounded bg-blue-500/15 border border-blue-300 inline-block" />
                  <span>Banda Mín / Máx del Lote</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-emerald-700">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-black">
                    +g/d
                  </span>
                  <span>Ganancia Media Diaria entre pesajes</span>
                </div>
              </div>

              {/* Panel de detalle del punto activo (hover o último control) */}
              {activePoint && (
                <div className="flex flex-wrap items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-2xl text-xs shadow-xs">
                  <span className="font-mono text-slate-300 flex items-center gap-1">
                    <Calendar size={13} className="text-blue-400" />
                    {activePoint.fullDate}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span>
                    Promedio:{" "}
                    <strong className="text-blue-400 font-black">
                      {activePoint.avg.toFixed(1)} kg
                    </strong>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-300">
                    Rango: {activePoint.minW.toFixed(1)}–{activePoint.maxW.toFixed(1)} kg
                  </span>
                  {activePoint.gmdGrams !== null && (
                    <>
                      <span className="text-slate-600">|</span>
                      <span className="text-emerald-400 font-black">
                        GMD: +{activePoint.gmdGrams} g/d
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Gráfica SVG con viewBox proporcional y ejes rotulados */}
            {chartGeometry && (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[640px]">
                  <svg
                    viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
                    className="w-full h-auto select-none overflow-visible"
                  >
                    <defs>
                      <linearGradient id="gmdAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.24" />
                        <stop offset="85%" stopColor="#2563eb" stopOpacity="0.02" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Líneas horizontales de la cuadrícula y etiquetas del Eje Y (kg) */}
                    {chartGeometry.yTicks.map((t, i) => (
                      <g key={i}>
                        <line
                          x1={chartGeometry.padLeft}
                          y1={t.y}
                          x2={chartGeometry.width - chartGeometry.padRight}
                          y2={t.y}
                          stroke="#e2e8f0"
                          strokeDasharray={i === 0 ? "none" : "4 4"}
                          strokeWidth={i === 0 ? "1.5" : "1"}
                        />
                        <text
                          x={chartGeometry.padLeft - 12}
                          y={t.y + 4}
                          textAnchor="end"
                          className="fill-slate-400 font-mono text-[11px] font-bold"
                        >
                          {t.value} kg
                        </text>
                      </g>
                    ))}

                    {/* Banda de dispersión entre el cerdo más liviano y el más pesado del corral */}
                    {chartGeometry.rangeBandPath && (
                      <path
                        d={chartGeometry.rangeBandPath}
                        fill="#3b82f6"
                        fillOpacity="0.10"
                      />
                    )}

                    {/* Área sombreada bajo la curva de crecimiento promedio */}
                    {chartGeometry.areaPath && (
                      <path d={chartGeometry.areaPath} fill="url(#gmdAreaGrad)" />
                    )}

                    {/* Línea principal de evolución de peso */}
                    {chartGeometry.linePath && (
                      <path
                        d={chartGeometry.linePath}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Puntos interactivos, etiquetas de peso y píldoras de GMD */}
                    {chartGeometry.points.map((pt, idx) => {
                      const isSelected =
                        hoveredIdx === idx ||
                        (hoveredIdx === null &&
                          idx === chartGeometry.points.length - 1);

                      return (
                        <g
                          key={idx}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredIdx(idx)}
                          onClick={() => setHoveredIdx(idx)}
                        >
                          {/* Guía vertical punteada hacia el eje X */}
                          <line
                            x1={pt.x}
                            y1={pt.y}
                            x2={pt.x}
                            y2={chartGeometry.padTop + chartGeometry.plotH}
                            stroke={isSelected ? "#3b82f6" : "#cbd5e1"}
                            strokeDasharray="3 3"
                            strokeWidth={isSelected ? "1.5" : "1"}
                          />

                          {/* Fecha en el Eje X */}
                          <text
                            x={pt.x}
                            y={chartGeometry.height - 20}
                            textAnchor="middle"
                            className={`font-mono text-[11px] ${
                              isSelected
                                ? "fill-blue-700 font-black"
                                : "fill-slate-500 font-semibold"
                            }`}
                          >
                            {pt.shortDate}
                          </text>
                          <text
                            x={pt.x}
                            y={chartGeometry.height - 6}
                            textAnchor="middle"
                            className="fill-slate-400 font-sans text-[9px] font-bold"
                          >
                            ({pt.totalPesajes} {pt.totalPesajes === 1 ? "toma" : "tomas"})
                          </text>

                          {/* Etiqueta superior con el peso exacto (kg) */}
                          <rect
                            x={pt.x - 28}
                            y={pt.y - 30}
                            width="56"
                            height="20"
                            rx="6"
                            fill={isSelected ? "#1e293b" : "#ffffff"}
                            stroke={isSelected ? "#0f172a" : "#cbd5e1"}
                            strokeWidth="1.2"
                          />
                          <text
                            x={pt.x}
                            y={pt.y - 16}
                            textAnchor="middle"
                            className={`font-mono text-[11px] font-black ${
                              isSelected ? "fill-white" : "fill-slate-800"
                            }`}
                          >
                            {pt.avg.toFixed(1)} kg
                          </text>

                          {/* Píldora de GMD debajo del nodo (si existe tasa respecto al corte previo) */}
                          {pt.gmdGrams !== null && pt.gmdGrams > 0 && (
                            <g>
                              <rect
                                x={pt.x - 29}
                                y={pt.y + 10}
                                width="58"
                                height="17"
                                rx="8"
                                fill="#ecfdf5"
                                stroke="#6ee7b7"
                                strokeWidth="1"
                              />
                              <text
                                x={pt.x}
                                y={pt.y + 21}
                                textAnchor="middle"
                                className="fill-emerald-700 font-mono text-[9.5px] font-black"
                              >
                                +{pt.gmdGrams} g/d
                              </text>
                            </g>
                          )}

                          {/* Halo exterior si está activo */}
                          {isSelected && (
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="11"
                              fill="#3b82f6"
                              fillOpacity="0.2"
                            />
                          )}

                          {/* Círculo del punto de medición */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isSelected ? "6.5" : "5"}
                            fill={isSelected ? "#1d4ed8" : "#3b82f6"}
                            stroke="#ffffff"
                            strokeWidth="2.5"
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}

            {/* 5. TABLA / TARJETAS CRONOLÓGICAS DE CONTROLES DE PESAJE */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers size={14} className="text-blue-600" />
                  Desglose Cronológico de Cortes en TimescaleDB (Izquierda: Inicio → Derecha: Actual)
                </h4>
                <span className="text-[11px] text-slate-400 font-semibold">
                  Haz clic o pasa el cursor sobre cualquier corte para inspeccionarlo
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {chartGeometry?.points.map((pt, i) => {
                  const isSelected =
                    hoveredIdx === i ||
                    (hoveredIdx === null && i === chartGeometry.points.length - 1);

                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setHoveredIdx(i)}
                      onClick={() => setHoveredIdx(i)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-50/70 border-blue-400 shadow-xs"
                          : "bg-slate-50/80 border-slate-200/80 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          {pt.shortDate}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                          Control #{i + 1}
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-baseline justify-between">
                        <span className="font-black text-slate-900 text-base">
                          {pt.avg.toFixed(1)} kg
                        </span>
                        {pt.variacion > 0 && (
                          <span className="text-[10px] font-bold text-blue-600">
                            +{pt.variacion.toFixed(1)}%
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span
                          className={`font-black ${
                            pt.gmdGrams && pt.gmdGrams > 0
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        >
                          {pt.gmdGrams && pt.gmdGrams > 0
                            ? `GMD: +${pt.gmdGrams} g/d`
                            : "Peso Base Inicial"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
