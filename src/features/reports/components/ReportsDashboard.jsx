"use client";

import React, { useState, useMemo } from "react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import {
  Bell,
  ShieldCheck,
  AlertTriangle,
  Info,
  TrendingUp,
  PieChart,
  CheckCircle2,
  Calendar,
} from "lucide-react";

const STAGE_META = {
  engorde: { label: "Engorde / Ceba", color: "#10b981", bg: "bg-emerald-500", lightBg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ceba: { label: "Ceba", color: "#10b981", bg: "bg-emerald-500", lightBg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  levante: { label: "Levante", color: "#3b82f6", bg: "bg-blue-500", lightBg: "bg-blue-50 text-blue-700 border-blue-200" },
  precebo: { label: "Precebo", color: "#06b6d4", bg: "bg-cyan-500", lightBg: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  activo: { label: "Reproductores", color: "#6366f1", bg: "bg-indigo-500", lightBg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  gestacion: { label: "Gestación", color: "#8b5cf6", bg: "bg-violet-500", lightBg: "bg-violet-50 text-violet-700 border-violet-200" },
  maternidad: { label: "Maternidad / Lact.", color: "#ec4899", bg: "bg-pink-500", lightBg: "bg-pink-50 text-pink-700 border-pink-200" },
  lactancia: { label: "Lactancia", color: "#ec4899", bg: "bg-pink-500", lightBg: "bg-pink-50 text-pink-700 border-pink-200" },
  cuarentena: { label: "Cuarentena / Retiro", color: "#f59e0b", bg: "bg-amber-500", lightBg: "bg-amber-50 text-amber-700 border-amber-200" },
};

const fallbackColors = ["#10b981", "#3b82f6", "#06b6d4", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"];

function getTargetGmdByStage(tipo = "") {
  const t = String(tipo).toLowerCase();
  if (t.includes("precebo")) return { gmdIdealKg: 0.38, label: "Meta Precebo (380 g/d)" };
  if (t.includes("levante")) return { gmdIdealKg: 0.78, label: "Meta Levante (780 g/d)" };
  if (t.includes("ceba") || t.includes("engorde")) return { gmdIdealKg: 0.88, label: "Meta Ceba (880 g/d)" };
  if (t.includes("gestacion")) return { gmdIdealKg: 0.38, label: "Meta Gestación (380 g/d)" };
  if (t.includes("maternidad")) return { gmdIdealKg: 0.22, label: "Mant. Maternidad (220 g/d)" };
  if (t.includes("cuarentena")) return { gmdIdealKg: 0.50, label: "Meta Recuperación (500 g/d)" };
  return { gmdIdealKg: 0.68, label: "Meta Consolidada (680 g/d)" };
}

function formatShortDate(iso) {
  if (!iso) return "--";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    });
  } catch {
    return String(iso).slice(0, 10);
  }
}

export default function ReportsDashboard({
  dbAlerts = [],
  animalsCount = 0,
  stageDistribution = {},
  corrales = [],
  corralGrowthById = {},
  globalGrowthSeries = [],
  selectedBatch = "todos",
  setSelectedBatch,
  dynamicKpis = [],
  kpiCols = [],
}) {
  const [hoveredPointIdx, setHoveredPointIdx] = useState(null);
  const [hoveredStageKey, setHoveredStageKey] = useState(null);

  // Corral activo para la gráfica de Crecimiento Global
  const selectedCorralObj = useMemo(
    () => corrales.find((c) => c.id === selectedBatch) || null,
    [corrales, selectedBatch]
  );

  const activeSeriesRaw = useMemo(() => {
    if (selectedBatch !== "todos" && corralGrowthById[selectedBatch]?.length > 0) {
      return corralGrowthById[selectedBatch];
    }
    if (globalGrowthSeries.length > 0) {
      return globalGrowthSeries;
    }
    // Fallback al primer corral con datos si el consolidado está vacío
    const firstWithData = Object.values(corralGrowthById).find((arr) => arr && arr.length > 0);
    return firstWithData || [];
  }, [selectedBatch, corralGrowthById, globalGrowthSeries]);

  const targetMeta = useMemo(
    () => getTargetGmdByStage(selectedCorralObj?.tipo || "consolidado"),
    [selectedCorralObj]
  );

  // Construir puntos Real vs Ideal basados en días transcurridos reales desde el primer control
  const growthChart = useMemo(() => {
    if (!activeSeriesRaw || activeSeriesRaw.length === 0) return null;

    const firstDateMs = new Date(activeSeriesRaw[0].fecha).getTime();
    const initialWeight = Number(activeSeriesRaw[0].peso_promedio_kg) || 0;

    const enriched = activeSeriesRaw.map((pt, idx) => {
      const currMs = new Date(pt.fecha).getTime();
      const elapsedDays = Math.max(0, (currMs - firstDateMs) / (1000 * 60 * 60 * 24));
      const realKg = Number(pt.peso_promedio_kg) || 0;
      const idealKg = Number((initialWeight + elapsedDays * targetMeta.gmdIdealKg).toFixed(2));
      const diffKg = Number((realKg - idealKg).toFixed(2));

      return {
        ...pt,
        idx,
        shortDate: formatShortDate(pt.fecha),
        elapsedDays: Math.round(elapsedDays),
        realKg,
        idealKg,
        diffKg,
        gmdKg: pt.gmd_kg !== null && pt.gmd_kg !== undefined ? Number(pt.gmd_kg) : null,
      };
    });

    const allValues = enriched.flatMap((p) => [p.realKg, p.idealKg]);
    const rawMin = Math.min(...allValues);
    const rawMax = Math.max(...allValues);
    const span = Math.max(rawMax - rawMin, 4);
    const yMin = Math.max(0, Math.floor(rawMin - span * 0.22));
    const yMax = Math.ceil(rawMax + span * 0.25);
    const yRange = Math.max(yMax - yMin, 1);

    const width = 620;
    const height = 215;
    const padLeft = 48;
    const padRight = 24;
    const padTop = 26;
    const padBottom = 36;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const points = enriched.map((p, i) => {
      const x =
        enriched.length === 1
          ? padLeft + plotW / 2
          : padLeft + (i / (enriched.length - 1)) * plotW;
      const yReal = padTop + plotH - ((p.realKg - yMin) / yRange) * plotH;
      const yIdeal = padTop + plotH - ((p.idealKg - yMin) / yRange) * plotH;
      return {
        ...p,
        x,
        yReal,
        yIdeal,
      };
    });

    const realPolyline = points.map((p) => `${p.x},${p.yReal}`).join(" ");
    const idealPolyline = points.map((p) => `${p.x},${p.yIdeal}`).join(" ");
    const realArea =
      points.length > 1
        ? `${points[0].x},${padTop + plotH} ${realPolyline} ${points[points.length - 1].x},${padTop + plotH}`
        : "";

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
      const val = yMin + t * yRange;
      const y = padTop + plotH - t * plotH;
      return { value: val.toFixed(1), y };
    });

    const firstPt = points[0];
    const lastPt = points[points.length - 1];
    const totalGainReal = Number((lastPt.realKg - firstPt.realKg).toFixed(2));
    const totalDays = Math.max(1, lastPt.elapsedDays);
    const avgGmdRealKg =
      points.length > 1 ? Number((totalGainReal / totalDays).toFixed(3)) : lastPt.gmdKg || 0;

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
      realPolyline,
      idealPolyline,
      realArea,
      yTicks,
      firstPt,
      lastPt,
      totalGainReal,
      avgGmdRealKg,
    };
  }, [activeSeriesRaw, targetMeta]);

  const activePoint = useMemo(() => {
    if (!growthChart || growthChart.points.length === 0) return null;
    if (hoveredPointIdx !== null && growthChart.points[hoveredPointIdx]) {
      return growthChart.points[hoveredPointIdx];
    }
    return growthChart.points[growthChart.points.length - 1];
  }, [growthChart, hoveredPointIdx]);

  // Construir segmentos reales del Donut para Distribución del Plantel
  const donutData = useMemo(() => {
    const entries = Object.entries(stageDistribution).filter(([, count]) => Number(count) > 0);
    const total = entries.reduce((acc, [, count]) => acc + Number(count), 0) || animalsCount || 1;
    const radius = 40;
    const circumference = 2 * Math.PI * radius; // ~251.327

    let cumulativeRatio = 0;
    const segments = entries.map(([key, rawCount], idx) => {
      const count = Number(rawCount) || 0;
      const ratio = count / total;
      const percentage = (ratio * 100).toFixed(1);
      const dashLength = ratio * circumference;
      const dashOffset = -cumulativeRatio * circumference;
      cumulativeRatio += ratio;

      const meta = STAGE_META[String(key).toLowerCase()] || {
        label: String(key).charAt(0).toUpperCase() + String(key).slice(1),
        color: fallbackColors[idx % fallbackColors.length],
        bg: "bg-emerald-500",
        lightBg: "bg-slate-50 text-slate-700 border-slate-200",
      };

      return {
        key,
        label: meta.label,
        count,
        percentage,
        color: meta.color,
        lightBg: meta.lightBg,
        strokeDasharray: `${Math.max(0, dashLength - 1.5)} ${circumference}`,
        strokeDashoffset: dashOffset,
      };
    });

    return {
      radius,
      circumference,
      total,
      segments,
    };
  }, [stageDistribution, animalsCount]);

  const activeStage = useMemo(() => {
    if (!hoveredStageKey) return null;
    return donutData.segments.find((s) => s.key === hoveredStageKey) || null;
  }, [hoveredStageKey, donutData]);

  return (
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

      {/* Gráficos Interactivos Conectados a TimescaleDB y PostgreSQL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Gráfica de Crecimiento Global (Real vs Ideal) */}
        <Card className="p-6 border border-slate-100 flex flex-col justify-between rounded-4xl bg-white shadow-xs">
          <div>
            <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
              <div>
                <h3 className="text-xl font-black italic text-slate-800 flex items-center gap-2">
                  <TrendingUp className="text-blue-500 h-6 w-6" />{" "}
                  Crecimiento Global
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Curva real TimescaleDB vs. proyección zootécnica ideal
                </p>
              </div>

              <div className="flex items-center gap-2">
                {corrales.length > 0 && setSelectedBatch && (
                  <select
                    value={selectedBatch}
                    onChange={(e) => {
                      setSelectedBatch(e.target.value);
                      setHoveredPointIdx(null);
                    }}
                    className="text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="todos">Consolidado Producción</option>
                    {corrales.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.codigo} ({c.tipo})
                      </option>
                    ))}
                  </select>
                )}
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {growthChart ? "En Vivo" : "Sin registros"}
                </span>
              </div>
            </div>

            {!growthChart ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                <TrendingUp className="w-10 h-10 text-slate-200 mb-2" />
                <p className="font-bold text-slate-600">Sin lecturas de peso registradas</p>
                <p className="text-slate-400 mt-0.5">
                  Las curvas de crecimiento se graficarán conforme se registren pesajes.
                </p>
              </div>
            ) : (
              <>
                {/* Mini KPIs Superiores de la Curva */}
                <div className="grid grid-cols-3 gap-2.5 mb-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Peso Prom. Actual
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-base font-black text-slate-900">
                        {growthChart.lastPt.realKg.toFixed(1)} kg
                      </span>
                      <span className="text-[11px] font-bold text-blue-600">
                        +{growthChart.totalGainReal.toFixed(1)} kg
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Proyección Ideal
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-base font-black text-slate-700">
                        {growthChart.lastPt.idealKg.toFixed(1)} kg
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        ({Math.round(targetMeta.gmdIdealKg * 1000)}g/d)
                      </span>
                    </div>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Balance vs. Meta
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span
                        className={`text-base font-black ${
                          growthChart.lastPt.diffKg >= 0 ? "text-emerald-700" : "text-amber-600"
                        }`}
                      >
                        {growthChart.lastPt.diffKg >= 0 ? "+" : ""}
                        {growthChart.lastPt.diffKg.toFixed(1)} kg
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        ({Math.round(growthChart.avgGmdRealKg * 1000)}g/d)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lienzo SVG Proporcional con Ejes y Puntos Interactivos */}
                <div className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-2">
                  <svg
                    className="w-full h-52 overflow-visible"
                    viewBox={`0 0 ${growthChart.width} ${growthChart.height}`}
                  >
                    <defs>
                      <linearGradient id="globalRealGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Líneas guía horizontales y escala Y (kg) */}
                    {growthChart.yTicks.map((t, idx) => (
                      <g key={idx}>
                        <line
                          x1={growthChart.padLeft}
                          y1={t.y}
                          x2={growthChart.width - growthChart.padRight}
                          y2={t.y}
                          stroke="#e2e8f0"
                          strokeDasharray={idx === 0 ? "none" : "4 4"}
                          strokeWidth="1"
                        />
                        <text
                          x={growthChart.padLeft - 6}
                          y={t.y + 3}
                          textAnchor="end"
                          className="fill-slate-400 text-[9px] font-mono font-semibold"
                        >
                          {t.value}kg
                        </text>
                      </g>
                    ))}

                    {/* Área sombreada bajo la curva Real */}
                    {growthChart.realArea && (
                      <polygon points={growthChart.realArea} fill="url(#globalRealGrad)" />
                    )}

                    {/* Línea Ideal (Verde Punteada) */}
                    <polyline
                      points={growthChart.idealPolyline}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Línea Real (Azul Sólida) */}
                    <polyline
                      points={growthChart.realPolyline}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Nodos y etiquetas por fecha de control */}
                    {growthChart.points.map((pt, idx) => {
                      const isSelected = activePoint?.idx === idx;
                      return (
                        <g
                          key={idx}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPointIdx(idx)}
                          onClick={() => setHoveredPointIdx(idx)}
                        >
                          {/* Guía vertical al seleccionar */}
                          {isSelected && (
                            <line
                              x1={pt.x}
                              y1={growthChart.padTop}
                              x2={pt.x}
                              y2={growthChart.padTop + growthChart.plotH}
                              stroke="#93c5fd"
                              strokeDasharray="3 3"
                              strokeWidth="1.5"
                            />
                          )}

                          {/* Punto Ideal */}
                          <circle
                            cx={pt.x}
                            cy={pt.yIdeal}
                            r={isSelected ? "4.5" : "3"}
                            fill="#ffffff"
                            stroke="#10b981"
                            strokeWidth="2"
                          />

                          {/* Punto Real */}
                          <circle
                            cx={pt.x}
                            cy={pt.yReal}
                            r={isSelected ? "6.5" : "4.5"}
                            fill={isSelected ? "#1d4ed8" : "#3b82f6"}
                            stroke="#ffffff"
                            strokeWidth="2"
                          />

                          {/* Etiqueta de peso real sobre el nodo */}
                          <rect
                            x={pt.x - 22}
                            y={pt.yReal - 22}
                            width="44"
                            height="15"
                            rx="4"
                            fill={isSelected ? "#1e293b" : "#ffffff"}
                            stroke={isSelected ? "#1e293b" : "#cbd5e1"}
                            strokeWidth="1"
                          />
                          <text
                            x={pt.x}
                            y={pt.yReal - 11.5}
                            textAnchor="middle"
                            className={`text-[9px] font-bold ${
                              isSelected ? "fill-white" : "fill-slate-700"
                            }`}
                          >
                            {pt.realKg.toFixed(1)}kg
                          </text>

                          {/* Fecha en el Eje X */}
                          <text
                            x={pt.x}
                            y={growthChart.padTop + growthChart.plotH + 16}
                            textAnchor="middle"
                            className={`text-[10px] font-bold ${
                              isSelected ? "fill-blue-600" : "fill-slate-500"
                            }`}
                          >
                            {pt.shortDate}
                          </text>
                          <text
                            x={pt.x}
                            y={growthChart.padTop + growthChart.plotH + 27}
                            textAnchor="middle"
                            className="fill-slate-400 text-[8px] font-semibold"
                          >
                            Día {pt.elapsedDays}
                          </text>

                          {/* Área táctil amplia para facilitar el hover */}
                          <rect
                            x={pt.x - 24}
                            y={growthChart.padTop}
                            width="48"
                            height={growthChart.plotH}
                            fill="transparent"
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </>
            )}
          </div>

          {/* Barra inferior interactiva y leyenda */}
          {growthChart && activePoint && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-bold text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
                  Real ({activePoint.realKg.toFixed(1)} kg)
                </span>
                <span className="flex items-center gap-1.5 font-bold text-slate-600">
                  <span className="w-3 h-1 bg-emerald-500 inline-block rounded-full"></span>
                  Ideal ({activePoint.idealKg.toFixed(1)} kg)
                </span>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-bold text-slate-700">{activePoint.shortDate}:</span>
                <span className="text-slate-600">
                  {activePoint.total_pesajes || 1} lecturas
                </span>
                {activePoint.gmdKg !== null && (
                  <span className="font-bold text-emerald-600">
                    • +{Math.round(activePoint.gmdKg * 1000)} g/día
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Distribución del Plantel (Donut Multietapa Interactivo) */}
        <Card className="p-6 border border-slate-100 flex flex-col justify-between rounded-4xl bg-white shadow-xs">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black italic text-slate-800 flex items-center gap-2">
                  <PieChart className="text-emerald-500 h-6 w-6" />{" "}
                  Distribución del Plantel
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Estructura poblacional activa por etapa zootécnica (pasa el cursor para inspeccionar)
                </p>
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                {donutData.segments.length} Etapas
              </span>
            </div>

            <div className="flex justify-center items-center h-56">
              <div className="relative w-48 h-48">
                <svg
                  viewBox="0 0 100 100"
                  className="transform -rotate-90 w-full h-full overflow-visible"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r={donutData.radius}
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="18"
                  />
                  {donutData.segments.map((seg) => {
                    const isHovered = hoveredStageKey === seg.key;
                    return (
                      <circle
                        key={seg.key}
                        cx="50"
                        cy="50"
                        r={donutData.radius}
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth={isHovered ? "21" : "18"}
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={seg.strokeDashoffset}
                        className="transition-all duration-200 cursor-pointer"
                        style={{
                          opacity: hoveredStageKey && !isHovered ? 0.35 : 1,
                        }}
                        onMouseEnter={() => setHoveredStageKey(seg.key)}
                        onMouseLeave={() => setHoveredStageKey(null)}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
                  <span className="text-3xl font-black text-slate-900 leading-none">
                    {activeStage ? activeStage.count : animalsCount}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                    {activeStage ? activeStage.label : "Porcinos"}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-600 mt-0.5">
                    {activeStage ? `${activeStage.percentage}% del plantel` : "100% Activo"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4 text-xs font-bold text-slate-600">
            {donutData.segments.length === 0 ? (
              <div className="col-span-3 text-center text-slate-400 font-semibold py-2">
                Sin porcinos clasificados por etapas en el sistema.
              </div>
            ) : (
              donutData.segments.map((seg) => {
                const isSelected = hoveredStageKey === seg.key;
                return (
                  <div
                    key={seg.key}
                    onMouseEnter={() => setHoveredStageKey(seg.key)}
                    onMouseLeave={() => setHoveredStageKey(null)}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50/80 text-slate-700 border-slate-100 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: seg.color }}
                      ></span>
                      <span className="truncate text-[11px]">{seg.label}</span>
                    </div>
                    <span
                      className={`text-[11px] font-black ml-1 ${
                        isSelected ? "text-emerald-300" : "text-slate-900"
                      }`}
                    >
                      {seg.count} ({seg.percentage}%)
                    </span>
                  </div>
                );
              })
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
  );
}
