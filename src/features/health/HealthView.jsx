"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Syringe,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Search,
  Plus,
  Activity,
  AlertTriangle,
  RefreshCw,
  Filter,
  Warehouse,
  Pill,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import ModuleHeader from "@/components/layout/ModuleHeader";
import { formatDateTime } from "@/utils/formatters";
import AddHealthRecordModal from "./components/AddHealthRecordModal";
import BiosecurityView from "./BiosecurityView";
import {
  getTreatments,
  getWithdrawalAlerts,
} from "@/services/healthService";
import { getCorrales } from "@/services/corralService";

const EVENT_TYPE_BADGES = {
  vacuna: {
    label: "Vacunación",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Syringe,
  },
  tratamiento: {
    label: "Tratamiento",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: Pill,
  },
  desparasitacion: {
    label: "Desparasitación",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    icon: ShieldAlert,
  },
};

export default function HealthView() {
  // Pestañas: 'clinical' (Tratamientos Clínicos) | 'biosecurity' (Bioseguridad)
  const [activeTab, setActiveTab] = useState("clinical");

  // Estados de datos API
  const [treatments, setTreatments] = useState([]);
  const [withdrawalAlerts, setWithdrawalAlerts] = useState([]);
  const [corrales, setCorrales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCorral, setFilterCorral] = useState("all");

  // Modal de registro
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carga concurrente inicial
  const loadHealthData = useCallback(async (showFullLoader = true) => {
    if (showFullLoader) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [treatmentsData, alertsData, corralesData] = await Promise.all([
        getTreatments({ limite: 50 }),
        getWithdrawalAlerts(),
        getCorrales(true),
      ]);

      setTreatments(Array.isArray(treatmentsData) ? treatmentsData : []);
      setWithdrawalAlerts(Array.isArray(alertsData) ? alertsData : []);
      setCorrales(Array.isArray(corralesData) ? corralesData : []);
    } catch (err) {
      console.error("Error al cargar datos sanitarios:", err);
      setError(
        err.message ||
          "No se pudieron sincronizar los datos de sanidad con el backend de FastAPI."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHealthData(true);
  }, [loadHealthData]);

  // Recarga filtrada de tratamientos
  const handleApplyFilters = useCallback(async () => {
    try {
      const params = {};
      if (filterType !== "all") params.tipo_evento = filterType;
      if (filterCorral !== "all") params.corral_id = filterCorral;

      const results = await getTreatments(params);
      let list = Array.isArray(results) ? results : [];

      // Filtrado por texto (arete, alias, diagnóstico o producto)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        list = list.filter(
          (t) =>
            (t.animal_arete && t.animal_arete.toLowerCase().includes(query)) ||
            (t.animal_alias && t.animal_alias.toLowerCase().includes(query)) ||
            (t.producto_nombre && t.producto_nombre.toLowerCase().includes(query)) ||
            (t.diagnostico && t.diagnostico.toLowerCase().includes(query))
        );
      }

      setTreatments(list);
    } catch (err) {
      console.error("Error al aplicar filtros de tratamientos:", err);
    }
  }, [filterType, filterCorral, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleApplyFilters();
    }, 250);
    return () => clearTimeout(timer);
  }, [handleApplyFilters]);

  // Columnas para la tabla clínica
  const columns = [
    {
      key: "animal",
      header: "Animal / Arete",
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg">
              {row.animal_arete || "Sin arete"}
            </span>
            {row.animal_alias && (
              <span className="font-bold text-sm text-slate-900">
                {row.animal_alias}
              </span>
            )}
          </div>
          {row.corral_codigo && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Warehouse className="h-3 w-3" />
              Corral: {row.corral_codigo}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "tipo_evento",
      header: "Evento Sanitario",
      render: (row) => {
        const badge =
          EVENT_TYPE_BADGES[row.tipo_evento] || {
            label: row.tipo_evento || "General",
            className: "bg-slate-100 text-slate-700 border-slate-200",
            icon: Activity,
          };
        const Icon = badge.icon;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.className}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {badge.label}
          </span>
        );
      },
    },
    {
      key: "producto",
      header: "Producto / Diagnóstico",
      render: (row) => (
        <div className="py-1">
          <p className="font-bold text-slate-900 text-sm">{row.producto_nombre}</p>
          <p className="text-xs text-slate-500 leading-snug mt-0.5">
            {row.diagnostico}
          </p>
        </div>
      ),
    },
    {
      key: "dosis",
      header: "Dosis y Vía",
      render: (row) => (
        <div>
          <span className="font-black text-slate-900 text-sm">
            {row.dosis} {row.unidad_dosis || "ml"}
          </span>
          <span className="block text-[11px] text-slate-400 font-semibold">
            {row.via_administracion || "Subcutánea"}
          </span>
        </div>
      ),
    },
    {
      key: "veterinario",
      header: "Responsable",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
          {row.veterinario_nombre || "Médico Veterinario"}
        </span>
      ),
    },
    {
      key: "fecha",
      header: "Fecha (COT)",
      render: (row) => (
        <div>
          <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
            {formatDateTime(row.fecha_tratamiento)}
          </span>
          {row.fecha_proxima_dosis && (
            <span className="block text-[10px] text-blue-600 font-bold mt-0.5">
              Refuerzo: {row.fecha_proxima_dosis}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "retiro",
      header: "Tiempo Retiro",
      render: (row) => {
        const retiro = Number(row.tiempo_retiro_dias) || 0;
        if (retiro > 0) {
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700 border border-rose-200">
              <Clock className="h-3 w-3" />
              {retiro} días
            </span>
          );
        }
        return (
          <span className="text-xs font-bold text-emerald-600">
            0 días (Libre)
          </span>
        );
      },
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-900">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="SANIDAD Y BIOSEGURIDAD"
        title="Gestión de Salud, Vacunación y Bioseguridad"
        description="Historial clínico de tratamientos, administración de medicamentos con descuento en bodega y monitoreo de retiros farmacológicos en PostgreSQL."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              tone="primary"
              className="flex items-center gap-2 font-black rounded-xl! shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              Registrar Evento Sanitario
            </Button>
          </div>
        }
      />

      {/* Selector de Pestañas Principales */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("clinical")}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "clinical"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Activity size={16} />
            <span>Tratamientos y Vacunas ({treatments.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("biosecurity")}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "biosecurity"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <ShieldCheck size={16} />
            <span>Bioseguridad y Normativa ICA</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => loadHealthData(false)}
          disabled={isRefreshing}
          className="text-xs font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
        >
          <RefreshCw
            size={13}
            className={isRefreshing ? "animate-spin text-emerald-600" : ""}
          />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Renderizado de BiosecurityView si la pestaña está activa */}
      {activeTab === "biosecurity" && <BiosecurityView />}

      {/* Renderizado de Vista Clínica Principal */}
      {activeTab === "clinical" && (
        <div className="space-y-6">
          {/* Banner de Error */}
          {error && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-rose-100 p-2 text-rose-600 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-900">
                    Fallo de sincronización sanitaria
                  </h4>
                  <p className="text-xs text-rose-700 mt-0.5">{error}</p>
                </div>
              </div>
              <Button
                onClick={() => loadHealthData(true)}
                tone="danger"
                className="text-xs shrink-0 self-start sm:self-center"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Reintentar
              </Button>
            </div>
          )}

          {/* SECCIÓN CRÍTICA: ANIMALES EN TIEMPO DE RETIRO FARMACOLÓGICO */}
          {withdrawalAlerts.length > 0 && (
            <Card className="rounded-3xl border border-rose-200 bg-linear-to-r from-rose-50 to-amber-50 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-md shadow-rose-500/20">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-rose-950">
                      Alerta Sanitaria: Animales bajo Tiempo de Retiro Activo ({withdrawalAlerts.length})
                    </h3>
                    <p className="text-xs text-rose-800 mt-0.5">
                      Restricción estricta de beneficio/faenado según normativa ICA. Los siguientes animales recibieron fármacos con periodo de carencia pendiente:
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-rose-200 text-rose-900 px-3 py-1 text-xs font-black shrink-0">
                  Bloqueo de Despacho
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {withdrawalAlerts.map((alert, idx) => (
                  <div
                    key={alert.id || alert.animal_id || idx}
                    className="p-3.5 bg-white/90 border border-rose-200 rounded-2xl shadow-2xs flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {alert.animal_arete || "Cerdo"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {alert.corral_codigo ? `Corral: ${alert.corral_codigo}` : ""}
                      </span>
                    </div>

                    <div className="my-2">
                      <p className="text-xs font-black text-slate-900">
                        {alert.producto_nombre || "Tratamiento farmacológico"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Retiro total: {alert.tiempo_retiro_dias} días
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                      <span className="text-slate-500">Cierre de retiro:</span>
                      <span className="text-rose-600 font-black">
                        {alert.dias_restantes !== undefined
                          ? `${alert.dias_restantes} días restantes`
                          : alert.fecha_fin_retiro || "Pendiente"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TARJETAS DE KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Retiros Activos */}
            <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Retiros Farmacológicos
                </p>
                <h4
                  className={`text-2xl font-black mt-1 ${
                    withdrawalAlerts.length > 0 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {withdrawalAlerts.length} Animales
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {withdrawalAlerts.length > 0
                    ? "Restricción de faenado activa"
                    : "Todos aptos para beneficio"}
                </p>
              </div>
              <div
                className={`p-3 rounded-2xl ${
                  withdrawalAlerts.length > 0
                    ? "bg-rose-50 text-rose-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                <Clock className="w-6 h-6" />
              </div>
            </Card>

            {/* Total Tratamientos */}
            <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Eventos Registrados
                </p>
                <h4 className="text-2xl font-black text-slate-900 mt-1">
                  {treatments.length}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Historial acumulado en granja
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                <Activity className="w-6 h-6" />
              </div>
            </Card>

            {/* Vacunaciones */}
            <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Vacunaciones
                </p>
                <h4 className="text-2xl font-black text-blue-600 mt-1">
                  {treatments.filter((t) => t.tipo_evento === "vacuna").length}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Inmunizaciones preventivas
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                <Syringe className="w-6 h-6" />
              </div>
            </Card>

            {/* Tratamientos Curativos */}
            <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tratamientos Curativos
                </p>
                <h4 className="text-2xl font-black text-emerald-600 mt-1">
                  {treatments.filter((t) => t.tipo_evento === "tratamiento").length}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Atención clínica individual
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                <Pill className="w-6 h-6" />
              </div>
            </Card>
          </div>

          {/* BARRA DE FILTROS */}
          <Card className="rounded-3xl p-5 flex flex-col md:flex-row gap-4 items-end bg-white border border-slate-100 shadow-sm">
            <div className="w-full md:w-1/2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Search size={14} className="text-emerald-500" />
                Buscar por Arete, Alias o Producto
              </label>
              <Input
                placeholder="Ej: PT-2026-001, Ivermectina, Titan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full shadow-sm text-sm"
              />
            </div>

            <div className="w-full md:w-1/4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Filter size={14} className="text-emerald-500" />
                Tipo de Evento
              </label>
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none text-sm cursor-pointer"
                >
                  <option value="all">Todos los Eventos</option>
                  <option value="vacuna">Vacunación</option>
                  <option value="tratamiento">Tratamiento Médico</option>
                  <option value="desparasitacion">Desparasitación</option>
                </select>
              </div>
            </div>

            <div className="w-full md:w-1/4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Warehouse size={14} className="text-emerald-500" />
                Corral
              </label>
              <div className="relative">
                <select
                  value={filterCorral}
                  onChange={(e) => setFilterCorral(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none text-sm cursor-pointer"
                >
                  <option value="all">Todos los Corrales</option>
                  {corrales.map((c) => (
                    <option key={c.id} value={c.id}>
                      Corral {c.codigo} ({c.fase})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* TABLA DE REGISTROS CLÍNICOS */}
          <section className="bg-white rounded-3xl shadow-sm overflow-hidden p-2 border border-slate-100">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-14 rounded-2xl bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : treatments.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="Sin registros sanitarios"
                description={
                  searchTerm || filterType !== "all" || filterCorral !== "all"
                    ? "No se encontraron tratamientos que coincidan con los filtros aplicados."
                    : "Aún no se han registrado eventos clínicos o vacunaciones en la base de datos."
                }
                actionLabel="Registrar Primer Tratamiento"
                onAction={() => setIsModalOpen(true)}
              />
            ) : (
              <Table columns={columns} rows={treatments} />
            )}
          </section>
        </div>
      )}

      {/* Modal de Registro de Tratamiento Sanitario */}
      <AddHealthRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => loadHealthData(false)}
      />
    </div>
  );
}
