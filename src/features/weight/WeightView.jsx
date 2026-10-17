"use client";

import React, { useState, useCallback } from "react";
import {
  Scale,
  TrendingUp,
  Activity,
  Sparkles,
  Cpu,
  History,
  CheckCircle2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ModuleHeader from "@/components/layout/ModuleHeader";
import { useWeightData } from "./hooks/useWeightData";
import WeightAICard from "./components/WeightAICard";
import WeightManualForm from "./components/WeightManualForm";
import WeightGMDChart from "./components/WeightGMDChart";
import WeightHistoryTable from "./components/WeightHistoryTable";

export default function WeightView() {
  // Pestaña activa: 'ia_vision' | 'manual' | 'analytics' | 'history'
  const [activeTab, setActiveTab] = useState("ia_vision");
  const [recentLogs, setRecentLogs] = useState([]);

  // Hook desacoplado de datos maestros
  const {
    animals,
    corrales,
    isLoadingMasterData,
    refreshAnimals,
    averageWeight,
  } = useWeightData();

  const handleWeightEstimated = useCallback(
    (newLog, isPersisted) => {
      setRecentLogs((prev) => [newLog, ...prev]);
      if (isPersisted) {
        refreshAnimals();
      }
    },
    [refreshAnimals],
  );

  const handleManualWeightRegistered = useCallback(
    (newLog) => {
      setRecentLogs((prev) => [newLog, ...prev]);
      refreshAnimals();
    },
    [refreshAnimals],
  );

  const handlePesajeDeleted = useCallback(
    (targetId) => {
      setRecentLogs((prev) =>
        prev.filter((l) => (l.id_registro || l.id) !== targetId),
      );
      refreshAnimals();
    },
    [refreshAnimals],
  );

  return (
    <div className="w-full flex flex-col gap-6 text-slate-900">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="BIOMETRÍA Y VISIÓN COMPUTACIONAL"
        title="Pesaje Inteligente y Estimación por Visión Artificial"
        description="Inferencia biométrica dorsal mediante modelo YOLO + OpenCV en contenedor Docker y registro analítico en series temporales de TimescaleDB."
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setActiveTab("ia_vision")}
              tone={activeTab === "ia_vision" ? "primary" : "soft"}
              className="text-xs font-black rounded-xl! cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={16} />
              Visión Artificial IA
            </Button>
            <Button
              onClick={() => setActiveTab("manual")}
              tone={activeTab === "manual" ? "primary" : "soft"}
              className="text-xs font-black rounded-xl! cursor-pointer flex items-center gap-1.5"
            >
              <Scale size={16} />
              Báscula Manual
            </Button>
          </div>
        }
      />

      {/* TARJETAS KPI DE RENDIMIENTO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Modelo de Visión
              </p>
              <h4 className="text-xl font-black text-slate-900 mt-2 flex items-center gap-2">
                YOLOv8 + OpenCV
              </h4>
              <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 size={13} /> Microservicio Docker Activo
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Peso Promedio del Hato
              </p>
              <h4 className="text-2xl font-black text-slate-900 mt-2">
                {averageWeight} <span className="text-sm text-slate-500">kg</span>
              </h4>
              <p className="text-[11px] text-slate-500 font-bold mt-1">
                Base censal de {animals.length} ejemplares
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Scale size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Lecturas en la Sesión
              </p>
              <h4 className="text-2xl font-black text-slate-900 mt-2">
                {recentLogs.length}
              </h4>
              <p className="text-[11px] text-indigo-600 font-bold mt-1">
                Última actividad en tiempo real
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Base de Datos Temporal
              </p>
              <h4 className="text-xl font-black text-slate-900 mt-2">
                TimescaleDB
              </h4>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">
                Hipertabla registro_pesos
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("ia_vision")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "ia_vision"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles size={16} />
          Visión Artificial IA
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "manual"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Scale size={16} />
          Báscula Manual
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "analytics"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <TrendingUp size={16} />
          Analítica GMD (TimescaleDB)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "history"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <History size={16} />
          Historial de Pesajes
        </button>
      </div>

      {/* PESTAÑA 1: INFERENCIA DE VISIÓN ARTIFICIAL (YOLO + OPENCV) */}
      {activeTab === "ia_vision" && (
        <WeightAICard
          animals={animals}
          corrales={corrales}
          isLoadingMasterData={isLoadingMasterData}
          onWeightEstimated={handleWeightEstimated}
        />
      )}

      {/* PESTAÑA 2: PESAJE MANUAL (BÁSCULA) */}
      {activeTab === "manual" && (
        <WeightManualForm
          animals={animals}
          corrales={corrales}
          onManualWeightRegistered={handleManualWeightRegistered}
        />
      )}

      {/* PESTAÑA 3: ANALÍTICA DE SERIES TEMPORALES GMD (TIMESCALE) */}
      {activeTab === "analytics" && (
        <WeightGMDChart
          corrales={corrales}
          onNavigateToIA={() => setActiveTab("ia_vision")}
        />
      )}

      {/* PESTAÑA 4: HISTORIAL DE REGISTROS (TIMESCALE) */}
      {activeTab === "history" && (
        <WeightHistoryTable
          animals={animals}
          recentLogs={recentLogs}
          onNavigateToIA={() => setActiveTab("ia_vision")}
          onPesajeDeleted={handlePesajeDeleted}
        />
      )}
    </div>
  );
}
