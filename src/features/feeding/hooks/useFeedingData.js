"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Warehouse } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/utils/formatters";
import { getRations, registerRation } from "@/services/feedingService";
import { getCorrales } from "@/services/corralService";
import { getItems } from "@/services/inventoryService";

export const FASE_COLORS = {
  "Pre-iniciador": "bg-orange-100 text-orange-700 border-orange-200",
  Iniciador: "bg-amber-100 text-amber-700 border-amber-200",
  Levante: "bg-blue-100 text-blue-700 border-blue-200",
  Ceba: "bg-purple-100 text-purple-700 border-purple-200",
};

export function useFeedingData() {
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
        (i) =>
          i.categoria_codigo === "alimento" ||
          i.unidad_medida?.toLowerCase().includes("bulto") ||
          i.unidad_medida?.toLowerCase().includes("kg")
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
    if (e && e.preventDefault) e.preventDefault();

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

  const columns = useMemo(
    () => [
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
    ],
    []
  );

  return {
    rations,
    corrales,
    feedItems,
    isLoading,
    isRefreshing,
    error,
    filterCorral,
    setFilterCorral,
    filteredRations,
    totalKgServidos,
    corralesAlimentados,
    totalStockAlimento,
    isModalOpen,
    setIsModalOpen,
    isSubmitting,
    form,
    setForm,
    loadFeedingData,
    handleSubmitSupply,
    columns,
  };
}
