"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertTriangle, Activity } from "lucide-react";
import {
  getDashboardKPIs,
  getRecentActivity,
  getDashboardAlerts,
} from "@/services/dashboard/dashboardService";
import StatsGrid from "@/features/dashboard/components/StatsGrid";
import QuickActions from "@/features/dashboard/components/QuickActions";
import RecentActivityTable from "@/features/dashboard/components/RecentActivityTable";
import SystemSuggestion from "@/features/dashboard/components/SystemSuggestion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const QUICK_ACTIONS = [
  { label: "Registrar nuevo animal", path: "/dashboard/animals" },
  { label: "Control de pesaje con IA", path: "/dashboard/weight" },
  { label: "Ver inventario de insumos", path: "/dashboard/inventory" },
  { label: "Plan sanitario y tratamientos", path: "/dashboard/health" },
];

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [kpisData, activityData, alertsData] = await Promise.all([
        getDashboardKPIs(),
        getRecentActivity(10),
        getDashboardAlerts(),
      ]);
      setKpis(kpisData);
      setRecentActivity(Array.isArray(activityData) ? activityData : []);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
      setError(
        err.message ||
          "No fue posible conectar con el servidor analítico de PorciTech. Verifique que la API de FastAPI esté activa."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className="space-y-6">
      <Card
        as="header"
        className="flex flex-col gap-4 mb-6 rounded-4xl lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Dashboard Analítico en Vivo
            </p>
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-slate-950">
            Resumen Operativo de Granja
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Métricas analíticas consolidadas con TimescaleDB y visión artificial
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadDashboardData}
            tone="soft"
            disabled={isLoading}
            className="text-xs py-2 px-3 border border-slate-200 hover:bg-slate-100"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
          <div className="rounded-2xl bg-slate-950 px-5 py-3 text-white">
            <p className="text-xs text-slate-400">Motor analítico</p>
            <p className="text-sm font-black flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-emerald-400" />
              TimescaleDB + AI
            </p>
          </div>
        </div>
      </Card>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-5 text-rose-900 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-rose-100 p-2 text-rose-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Fallo de sincronización con la API
              </h4>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                {error}
              </p>
            </div>
          </div>
          <Button
            onClick={loadDashboardData}
            tone="danger"
            className="text-xs shrink-0 self-start sm:self-center"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reintentar Conexión
          </Button>
        </div>
      )}

      <StatsGrid kpis={kpis} isLoading={isLoading} />

      <QuickActions actions={QUICK_ACTIONS} />

      <section className="mt-6 grid gap-6 2xl:grid-cols-[1.25fr_0.75fr]">
        <RecentActivityTable
          rows={recentActivity}
          isLoading={isLoading}
        />
        <SystemSuggestion
          alerts={alerts}
          isLoading={isLoading}
        />
      </section>
    </div>
  );
}
