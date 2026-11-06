"use client";

import React, { useMemo } from "react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { TrendingUp, Scale } from "lucide-react";
import { formatDateTime } from "@/utils/formatters";

export default function ProfileProduccionTab({
  pesajes = [],
  onNavigateWeight,
}) {
  // Ordenar cronológicamente (más antiguo -> más reciente) para la gráfica
  const chartData = useMemo(() => {
    if (!pesajes || pesajes.length === 0) return null;
    const sorted = [...pesajes].sort(
      (a, b) => new Date(a.tiempo).getTime() - new Date(b.tiempo).getTime()
    );

    const weights = sorted.map((p) => Number(p.peso_kg) || 0);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const span = Math.max(maxW - minW, 4);
    const yMin = Math.max(0, Math.floor(minW - span * 0.2));
    const yMax = Math.ceil(maxW + span * 0.25);
    const yRange = Math.max(yMax - yMin, 1);

    const width = 680;
    const height = 210;
    const padLeft = 48;
    const padRight = 28;
    const padTop = 28;
    const padBottom = 34;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const points = sorted.map((pt, i) => {
      const w = Number(pt.peso_kg) || 0;
      const x =
        sorted.length === 1
          ? padLeft + plotW / 2
          : padLeft + (i / (sorted.length - 1)) * plotW;
      const y = padTop + plotH - ((w - yMin) / yRange) * plotH;
      const dateLabel = new Date(pt.tiempo).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
      });
      return { ...pt, w, x, y, dateLabel };
    });

    const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
    const area =
      points.length > 1
        ? `${points[0].x},${padTop + plotH} ${polyline} ${points[points.length - 1].x},${padTop + plotH}`
        : "";

    const yTicks = [0, 0.5, 1].map((t) => ({
      value: (yMin + t * yRange).toFixed(1),
      y: padTop + plotH - t * plotH,
    }));

    const totalGain =
      points.length > 1 ? (points[points.length - 1].w - points[0].w).toFixed(1) : "0.0";

    return {
      width,
      height,
      padLeft,
      padRight,
      padTop,
      padBottom,
      plotH,
      points,
      polyline,
      area,
      yTicks,
      totalGain,
    };
  }, [pesajes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <TrendingUp className="text-blue-500" /> Curva de Crecimiento y Pesajes del Ejemplar
        </h3>
        {chartData && (
          <div className="flex items-center gap-2 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl">
            <span>{pesajes.length} controles</span>
            <span>•</span>
            <span>Ganancia acumulada: +{chartData.totalGain} kg</span>
          </div>
        )}
      </div>

      {pesajes.length === 0 ? (
        <div className="py-6">
          <EmptyState
            icon={Scale}
            title="Sin lecturas de peso registradas"
            description="Aún no se han registrado lecturas de peso (manuales o por visión artificial) para este ejemplar en la base de datos."
            actionLabel="+ Registrar Pesaje"
            onAction={onNavigateWeight}
          />
        </div>
      ) : (
        <>
          <Card className="bg-slate-50/70 border border-slate-100 shadow-none p-4 rounded-2xl">
            <svg
              className="w-full h-52 overflow-visible"
              viewBox={`0 0 ${chartData.width} ${chartData.height}`}
            >
              <defs>
                <linearGradient id="animalWeightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {chartData.yTicks.map((t, idx) => (
                <g key={idx}>
                  <line
                    x1={chartData.padLeft}
                    y1={t.y}
                    x2={chartData.width - chartData.padRight}
                    y2={t.y}
                    stroke="#e2e8f0"
                    strokeDasharray={idx === 0 ? "none" : "4 4"}
                  />
                  <text
                    x={chartData.padLeft - 6}
                    y={t.y + 3}
                    textAnchor="end"
                    className="fill-slate-400 text-[9px] font-mono font-semibold"
                  >
                    {t.value}kg
                  </text>
                </g>
              ))}

              {chartData.area && (
                <polygon points={chartData.area} fill="url(#animalWeightGrad)" />
              )}

              <polyline
                points={chartData.polyline}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {chartData.points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <rect
                    x={pt.x - 22}
                    y={pt.y - 22}
                    width="44"
                    height="15"
                    rx="4"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 11.5}
                    textAnchor="middle"
                    className="fill-slate-800 text-[9px] font-bold"
                  >
                    {pt.w.toFixed(1)}kg
                  </text>
                  <text
                    x={pt.x}
                    y={chartData.padTop + chartData.plotH + 18}
                    textAnchor="middle"
                    className="fill-slate-500 text-[10px] font-bold"
                  >
                    {pt.dateLabel}
                  </text>
                </g>
              ))}
            </svg>
          </Card>

          <div className="border border-slate-100 rounded-3xl overflow-hidden mt-6">
            <Table
              columns={[
                {
                  header: "Fecha de Pesaje",
                  key: "tiempo",
                  render: (r) => formatDateTime(r.tiempo),
                },
                {
                  header: "Peso Registrado",
                  key: "peso_kg",
                  render: (r) => (
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {r.peso_kg} kg
                    </span>
                  ),
                },
                {
                  header: "Método",
                  key: "metodo",
                  render: (r) => (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {r.metodo === "ia_vision" ? "Visión IA" : "Báscula Manual"}
                    </span>
                  ),
                },
                {
                  header: "Observaciones",
                  key: "observaciones",
                  render: (r) => r.observaciones || "Control periódico",
                },
              ]}
              rows={pesajes}
            />
          </div>
        </>
      )}
    </div>
  );
}
