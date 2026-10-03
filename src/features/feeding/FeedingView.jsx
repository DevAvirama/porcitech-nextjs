"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Utensils,
  Database,
  Plus,
  TrendingDown,
  Warehouse,
  Clock,
  Layers,
  RefreshCw,
  AlertTriangle,
  User,
  Scale,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import ModuleHeader from "@/components/layout/ModuleHeader";
import { formatDateTime } from "@/utils/formatters";
import { getRations, registerRation } from "@/services/feedingService";
import { getCorrales } from "@/services/corralService";
import { getItems } from "@/services/inventoryService";

const FASE_COLORS = {
  "Pre-iniciador": "bg-orange-100 text-orange-700 border-orange-200",
  Iniciador: "bg-amber-100 text-amber-700 border-amber-200",
  Levante: "bg-blue-100 text-blue-700 border-blue-200",
  Ceba: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function FeedingView() {
  const [rations, setRations] = useState([]);
  const [corrales, setCorrales] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filtros
  const [filterCorral, setFilterCorral] = useState("all");

  // Modal de suministro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulario de suministro
  const [form, setForm] = useState({
    corral_id: "",
    alimento_item_id: "",
    fase_alimentacion: "Levante",
    cantidad_kg: "",
    observaciones: "",
  });

  // Carga concurrente inicial
  const loadFeedingData = useCallback(async (showFullLoader = true) => {
    if (showFullLoader) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [rationsData, corralesData, inventoryData] = await Promise.all([
        getRations({ limite: 50 }),
        getCorrales(true),
        getItems({ search: "" }),
      ]);

      setRations(Array.isArray(rationsData) ? rationsData : []);
      setCorrales(Array.isArray(corralesData) ? corralesData : []);

      // Filtrar items de categoría alimento o insumos disponibles
      const allItems = Array.isArray(inventoryData) ? inventoryData : [];
      const foodItems = allItems.filter(
        (i) => i.categoria_codigo === "alimento" || i.unidad_medida?.toLowerCase().includes("bulto") || i.unidad_medida?.toLowerCase().includes("kg")
      );
      const availableFeeds = foodItems.length > 0 ? foodItems : allItems;
      setFeedItems(availableFeeds);

      // Auto-asignar primer alimento y corral si existen
      if (corralesData?.length > 0 && !form.corral_id) {
        setForm((prev) => ({ ...prev, corral_id: corralesData[0].id }));
      }
      if (availableFeeds.length > 0 && !form.alimento_item_id) {
        setForm((prev) => ({ ...prev, alimento_item_id: availableFeeds[0].id }));
      }
    } catch (err) {
      console.error("Error al cargar datos de alimentación:", err);
      setError(
        err.message ||
          "No se pudieron sincronizar los datos de nutrición con el backend de FastAPI."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [form.alimento_item_id, form.corral_id]);

  useEffect(() => {
    loadFeedingData(true);
  }, [loadFeedingData]);

  // Filtrado de raciones por corral
  const filteredRations = useMemo(() => {
    if (filterCorral === "all") return rations;
    return rations.filter((r) => r.corral_id === filterCorral);
  }, [rations, filterCorral]);

  // KPIs reactivos calculados
  const totalKgServidos = useMemo(() => {
    return rations.reduce((acc, curr) => acc + (Number(curr.cantidad_kg) || 0), 0);
  }, [rations]);

  const corralesAlimentados = useMemo(() => {
    const uniqueIds = new Set(rations.map((r) => r.corral_id).filter(Boolean));
    return uniqueIds.size;
  }, [rations]);

  const totalStockAlimento = useMemo(() => {
    return feedItems.reduce(
      (acc, curr) => acc + (Number(curr.stock_actual) || 0),
      0
    );
  }, [feedItems]);

  const handleSubmitSupply = async (e) => {
    e.preventDefault();

    if (!form.corral_id) {
      toast.error("Seleccione un corral de destino");
      return;
    }
    if (!form.alimento_item_id) {
      toast.error("Seleccione el alimento a suministrar");
      return;
    }
    const qty = parseFloat(form.cantidad_kg);
    if (isNaN(qty) || qty <= 0) {
      toast.error("La cantidad suministrada debe ser mayor a 0 kg");
      return;
    }

    // Validar si el alimento seleccionado tiene stock suficiente en inventario
    const selectedItem = feedItems.find((i) => i.id === form.alimento_item_id);
    if (selectedItem && selectedItem.stock_actual < qty) {
      toast.error(
        `Stock insuficiente en bodega para ${selectedItem.nombre}. Stock actual: ${selectedItem.stock_actual} ${selectedItem.unidad_medida}`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await registerRation({
        corral_id: form.corral_id,
        alimento_item_id: form.alimento_item_id,
        fase_alimentacion: form.fase_alimentacion,
        cantidad_kg: qty,
        observaciones: form.observaciones.trim() || undefined,
      });

      toast.success("Ración suministrada y stock descontado exitosamente");
      setIsModalOpen(false);
      setForm((prev) => ({
        ...prev,
        cantidad_kg: "",
        observaciones: "",
      }));
      await loadFeedingData(false);
    } catch (err) {
      console.error("Error al registrar ración:", err);
      toast.error(err.message || "Fallo al registrar el suministro de alimento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: "fecha",
      header: "Fecha / Momento (COT)",
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
          {formatDateTime(row.fecha_suministro)}
        </span>
      ),
    },
    {
      key: "corral",
      header: "Corral Destino",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Warehouse className="h-4 w-4 text-slate-400" />
          <span className="font-bold text-slate-900 text-sm">
            {row.corral_codigo || "Corral"}
          </span>
        </div>
      ),
    },
    {
      key: "alimento",
      header: "Alimento Suministrado",
      render: (row) => (
        <span className="font-bold text-slate-800 text-sm">
          {row.alimento_nombre || "Alimento Balanceado"}
        </span>
      ),
    },
    {
      key: "fase",
      header: "Fase Nutricional",
      render: (row) => {
        const colorClass =
          FASE_COLORS[row.fase_alimentacion] ||
          "bg-slate-100 text-slate-700 border-slate-200";
        return (
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${colorClass}`}
          >
            {row.fase_alimentacion || "General"}
          </span>
        );
      },
    },
    {
      key: "cantidad",
      header: "Cantidad Servida",
      render: (row) => (
        <span className="font-black text-slate-950 text-sm">
          {Number(row.cantidad_kg).toLocaleString("es-CO")} kg
        </span>
      ),
    },
    {
      key: "operario",
      header: "Responsable",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
          {row.operario_nombre || "Operario de Granja"}
        </span>
      ),
    },
    {
      key: "observaciones",
      header: "Observaciones",
      render: (row) => (
        <span className="text-xs text-slate-500 line-clamp-1">
          {row.observaciones || "Suministro normal"}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-900">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="NUTRICIÓN Y PLAN ALIMENTARIO"
        title="Alimentación y Suministro de Raciones"
        description="Control de raciones servidas por corral y fase nutricional, con afectación automática del stock en inventario y PostgreSQL."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              tone="primary"
              className="flex items-center gap-2 font-black rounded-xl! shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              Registrar Ración
            </Button>
          </div>
        }
      />

      {/* Banner de Error */}
      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-rose-100 p-2 text-rose-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Fallo de sincronización nutricional
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <Button
            onClick={() => loadFeedingData(true)}
            tone="danger"
            className="text-xs shrink-0 self-start sm:self-center"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reintentar
          </Button>
        </div>
      )}

      {/* TARJETAS DE KPI SUPERIORES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Alimento Servido
            </p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">
              {totalKgServidos.toLocaleString("es-CO")}{" "}
              <span className="text-sm font-bold text-slate-500">kg</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Consumo acumulado registrado
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-orange-50 text-orange-600">
            <Scale className="w-6 h-6" />
          </div>
        </Card>

        <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Raciones Suministradas
            </p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">
              {rations.length} Entregas
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Eventos nutricionales en granja
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <Utensils className="w-6 h-6" />
          </div>
        </Card>

        <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Corrales Atendidos
            </p>
            <h4 className="text-2xl font-black text-emerald-600 mt-1">
              {corralesAlimentados} Corrales
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Con raciones asignadas
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <Warehouse className="w-6 h-6" />
          </div>
        </Card>

        <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Stock en Bodega / Silos
            </p>
            <h4 className="text-2xl font-black text-purple-600 mt-1">
              {totalStockAlimento.toLocaleString("es-CO")} Unds
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {feedItems.length} referencias de alimento
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <Database className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* ESTADO DE SILOS / INVENTARIO DE ALIMENTO EN TIEMPO REAL */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Database className="text-blue-500 w-5 h-5" />
            Disponibilidad en Almacén y Silos
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            Sincronizado con inventario PostgreSQL
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {feedItems.slice(0, 4).map((feed) => {
            const actual = Number(feed.stock_actual) || 0;
            const minimo = Number(feed.stock_minimo) || 0;
            const isLow = actual <= minimo;

            return (
              <Card
                key={feed.id}
                className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {feed.codigo_sku}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isLow
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {isLow ? "Bajo Stock" : "Disponible"}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-2 line-clamp-1">
                    {feed.nombre}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Ubicación: {feed.ubicacion_bodega || "Bodega Central"}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-900">
                      {actual.toLocaleString("es-CO")}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold ml-1">
                      {feed.unidad_medida}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Mín: {minimo}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FILTROS Y HISTORIAL DE SUMINISTROS */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Historial de Raciones Servidas
            </h3>
            <p className="text-xs text-slate-500">
              Trazabilidad de alimentación por corral y turno operativo
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={filterCorral}
                onChange={(e) => setFilterCorral(e.target.value)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-xs outline-none cursor-pointer pr-8 shadow-xs"
              >
                <option value="all">Todos los Corrales</option>
                {corrales.map((c) => (
                  <option key={c.id} value={c.id}>
                    Corral {c.codigo} ({c.fase})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => loadFeedingData(false)}
              disabled={isRefreshing}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw
                size={13}
                className={isRefreshing ? "animate-spin text-emerald-600" : ""}
              />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-2">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-2xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : filteredRations.length === 0 ? (
            <EmptyState
              icon={Utensils}
              title="Sin suministros registrados"
              description={
                filterCorral !== "all"
                  ? "No hay raciones servidas para el corral seleccionado."
                  : "Aún no se han registrado entregas de alimento en la base de datos."
              }
              actionLabel="Registrar Primera Ración"
              onAction={() => setIsModalOpen(true)}
            />
          ) : (
            <Table columns={columns} rows={filteredRations} />
          )}
        </div>
      </section>

      {/* MODAL DE REGISTRO DE SUMINISTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <Card
            as="form"
            onSubmit={handleSubmitSupply}
            className="w-full max-w-lg p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-2xl font-black mb-1 text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                <Utensils className="w-5 h-5" />
              </div>
              Registrar Ración de Alimento
            </h2>
            <p className="text-xs text-slate-500 font-semibold mb-6">
              El suministro descontará automáticamente el stock del insumo en inventario
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Corral Destino *
                </label>
                <select
                  value={form.corral_id}
                  onChange={(e) =>
                    setForm({ ...form, corral_id: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none text-sm cursor-pointer"
                  required
                >
                  <option value="">Seleccione corral...</option>
                  {corrales.map((c) => (
                    <option key={c.id} value={c.id}>
                      Corral {c.codigo} ({c.fase}) - Capacidad: {c.capacidad_maxima}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Alimento de Bodega *
                </label>
                <select
                  value={form.alimento_item_id}
                  onChange={(e) =>
                    setForm({ ...form, alimento_item_id: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none text-sm cursor-pointer"
                  required
                >
                  <option value="">Seleccione alimento...</option>
                  {feedItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.codigo_sku}] {item.nombre} (Stock actual: {item.stock_actual} {item.unidad_medida})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Fase Nutricional *
                  </label>
                  <select
                    value={form.fase_alimentacion}
                    onChange={(e) =>
                      setForm({ ...form, fase_alimentacion: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none text-sm cursor-pointer"
                  >
                    <option value="Pre-iniciador">Pre-iniciador</option>
                    <option value="Iniciador">Iniciador</option>
                    <option value="Levante">Levante</option>
                    <option value="Ceba">Ceba</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Cantidad Servida (kg) *
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    placeholder="Ej: 40"
                    value={form.cantidad_kg}
                    onChange={(e) =>
                      setForm({ ...form, cantidad_kg: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Observaciones / Novedad
                </label>
                <Input
                  placeholder="Ej: Ración matutina, apetito normal, comedero limpio"
                  value={form.observaciones}
                  onChange={(e) =>
                    setForm({ ...form, observaciones: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                tone="soft"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 font-bold rounded-xl!"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                tone="primary"
                className="flex-1 font-black rounded-xl!"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Suministrando..." : "Confirmar Entrega"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
