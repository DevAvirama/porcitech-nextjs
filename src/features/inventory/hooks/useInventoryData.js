"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
} from "lucide-react";
import {
  getCategories,
  getItems,
  getMovements,
} from "@/services/inventoryService";

export const CATEGORY_COLORS = {
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  orange: "bg-amber-100 text-amber-700 border-amber-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
};

export const MOVEMENT_CONFIG = {
  entrada_compra: {
    label: "Entrada Compra",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: ArrowDownLeft,
    sign: "+",
    signColor: "text-emerald-600",
  },
  salida_consumo: {
    label: "Salida Consumo",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    icon: ArrowUpRight,
    sign: "-",
    signColor: "text-blue-600",
  },
  ajuste_merma: {
    label: "Ajuste Merma",
    badgeClass: "bg-rose-100 text-rose-700 border-rose-200",
    icon: TrendingDown,
    sign: "-",
    signColor: "text-rose-600",
  },
  devolucion: {
    label: "Devolución",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    icon: ArrowDownLeft,
    sign: "+",
    signColor: "text-amber-600",
  },
};

export const STANDARD_UNITS = [
  "Bultos (40kg)",
  "Bultos (25kg)",
  "Kg",
  "Frascos (250ml)",
  "Frascos (100ml)",
  "Frascos (500ml)",
  "Litros",
  "Dosis",
  "Unidades / Cajas",
];

export function useInventoryData() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Carga inicial y concurrente
  const loadData = useCallback(async (showFullLoader = true) => {
    if (showFullLoader) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [categoriesRes, itemsRes, movementsRes] = await Promise.allSettled([
        getCategories(),
        getItems(),
        getMovements({ limite: 20 }),
      ]);

      const errors = [];

      if (categoriesRes.status === "fulfilled" && Array.isArray(categoriesRes.value)) {
        setCategories(categoriesRes.value);
      } else if (categoriesRes.status === "rejected") {
        errors.push(`Categorías: ${categoriesRes.reason?.message || "Error al cargar"}`);
      }

      if (itemsRes.status === "fulfilled" && Array.isArray(itemsRes.value)) {
        setItems(itemsRes.value);
      } else if (itemsRes.status === "rejected") {
        errors.push(`Insumos: ${itemsRes.reason?.message || "Error al cargar"}`);
      }

      if (movementsRes.status === "fulfilled" && Array.isArray(movementsRes.value)) {
        setMovements(movementsRes.value);
      } else if (movementsRes.status === "rejected") {
        errors.push(`Movimientos: ${movementsRes.reason?.message || "Error al cargar"}`);
      }

      if (errors.length > 0) {
        setError(errors.join(" | "));
      }
    } catch (err) {
      console.error("Error al cargar inventario:", err);
      setError(
        err.message ||
          "No se pudo sincronizar el inventario con el backend de FastAPI."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Recarga filtrada de items al cambiar filtros
  const handleApplyFilters = useCallback(async () => {
    try {
      const params = {};
      if (filterCategory) params.categoria_id = filterCategory;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (filterLowStockOnly) params.bajo_stock = true;

      const filtered = await getItems(params);
      setItems(Array.isArray(filtered) ? filtered : []);
    } catch (err) {
      console.error("Error al aplicar filtros:", err);
      toast.error("Error al aplicar filtros de inventario");
    }
  }, [filterCategory, searchTerm, filterLowStockOnly]);

  const isFirstFilterRender = useRef(true);

  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      handleApplyFilters();
    }, 250);
    return () => clearTimeout(timer);
  }, [handleApplyFilters]);

  // KPIs reactivos calculados
  const totalValue = useMemo(() => {
    return items.reduce(
      (acc, curr) =>
        acc +
        (Number(curr.stock_actual) || 0) * (Number(curr.costo_unitario) || 0),
      0
    );
  }, [items]);

  const lowStockCount = useMemo(() => {
    return items.filter(
      (s) => Number(s.stock_actual) <= Number(s.stock_minimo)
    ).length;
  }, [items]);

  const totalStockUnits = useMemo(() => {
    return items.reduce((acc, curr) => acc + (Number(curr.stock_actual) || 0), 0);
  }, [items]);

  // Mapeo auxiliar de categorías por id y por codigo
  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => {
      map.set(cat.id, cat);
      if (cat.codigo) map.set(cat.codigo, cat);
    });
    return map;
  }, [categories]);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setFilterCategory("");
    setFilterLowStockOnly(false);
  }, []);

  return {
    categories,
    items,
    movements,
    isLoading,
    isRefreshing,
    error,
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    filterLowStockOnly,
    setFilterLowStockOnly,
    resetFilters,
    totalValue,
    lowStockCount,
    totalStockUnits,
    categoryMap,
    loadData,
  };
}
