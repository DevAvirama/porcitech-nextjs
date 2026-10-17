"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Activity, RefreshCw } from "lucide-react";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { getCorralGMD } from "@/services/weightService";

export default function WeightGMDChart({
  corrales,
  onNavigateToIA,
}) {
  const [analyticsCorralId, setAnalyticsCorralId] = useState("");
  const [gmdData, setGmdData] = useState([]);
  const [isLoadingGMD, setIsLoadingGMD] = useState(false);

  useEffect(() => {
    if (corrales.length > 0 && !analyticsCorralId) {
      setAnalyticsCorralId(corrales[0].id);
    }
  }, [corrales, analyticsCorralId]);

  useEffect(() => {
    if (analyticsCorralId) {
      setIsLoadingGMD(true);
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

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de Filtro de Corral */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={18} />
            Evolución de Ganancia Media Diaria (GMD)
          </h3>
          <p className="text-xs text-slate-500">
            Hipertabla de series temporales agregada por corral (TimescaleDB).
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase">
            Corral:
          </span>
          <select
            value={analyticsCorralId}
            onChange={(e) => setAnalyticsCorralId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 cursor-pointer"
          >
            {corrales.map((c) => (
              <option key={c.id} value={c.id}>
                {c.codigo} - {c.fase}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gráfica Temporal o Estado Vacío */}
      {isLoadingGMD ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100 flex flex-col items-center justify-center gap-2">
          <RefreshCw size={24} className="animate-spin text-blue-500" />
          <p className="text-xs font-bold text-slate-600">
            Consultando hipertabla TimescaleDB...
          </p>
        </div>
      ) : gmdData.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Sin lecturas de peso registradas"
          description="Aún no se han acumulado lecturas de peso en TimescaleDB para calcular la curva de Ganancia Media Diaria en este corral."
          actionLabel="Registrar Primer Pesaje"
          onAction={onNavigateToIA}
        />
      ) : (
        <Card className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative w-full h-72 bg-slate-50/50 rounded-2xl border border-slate-200/60 p-6">
            {/* Gráfica SVG interactiva de GMD */}
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              {gmdData.map((pt, idx) => {
                const x = (idx / Math.max(1, gmdData.length - 1)) * 100;
                const maxWeight = Math.max(
                  ...gmdData.map((d) => d.peso_promedio_kg || 120),
                  100,
                );
                const y = 100 - ((pt.peso_promedio_kg || 50) / maxWeight) * 100;
                return (
                  <circle
                    key={idx}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="5"
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                );
              })}
              <polyline
                points={gmdData
                  .map((pt, idx) => {
                    const x = (idx / Math.max(1, gmdData.length - 1)) * 100;
                    const maxWeight = Math.max(
                      ...gmdData.map((d) => d.peso_promedio_kg || 120),
                      100,
                    );
                    const y = 100 - ((pt.peso_promedio_kg || 50) / maxWeight) * 100;
                    return `${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Lista resumida de puntos temporales */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {gmdData.slice(0, 4).map((pt, i) => (
              <div
                key={i}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <span className="text-[10px] text-slate-400 font-mono block">
                  {new Date(pt.fecha).toLocaleDateString()}
                </span>
                <span className="font-extrabold text-slate-800 text-sm">
                  {pt.peso_promedio_kg?.toFixed(1)} kg
                </span>
                <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                  GMD: {(pt.gmd_kg * 1000)?.toFixed(0) || "N/A"} g/d
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
