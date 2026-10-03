"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Clock,
  DollarSign,
  Layers,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  Warehouse,
  ExternalLink,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import ModuleHeader from "@/components/layout/ModuleHeader";
import { formatDateTime } from "@/utils/formatters";
import {
  getCategories,
  getItems,
  createItem,
  getMovements,
  registerMovement,
} from "@/services/inventoryService";

const CATEGORY_COLORS = {
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  orange: "bg-amber-100 text-amber-700 border-amber-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
};

const MOVEMENT_CONFIG = {
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

const STANDARD_UNITS = [
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

export default function InventoryView() {
  const router = useRouter();

  // Estados de datos API
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Pestaña activa: 'items' | 'movements'
  const [activeTab, setActiveTab] = useState("items");

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulario nuevo insumo
  const [newSupply, setNewSupply] = useState({
    categoria_id: "",
    codigo_sku: "",
    nombre: "",
    unidad_medida: "Bultos (40kg)",
    stock_minimo: "",
    costo_unitario: "",
    ubicacion_bodega: "",
  });

  // Formulario movimiento Kardex
  const [movementForm, setMovementForm] = useState({
    item_id: "",
    tipo_movimiento: "entrada_compra",
    cantidad: "",
    costo_unitario: "",
    motivo: "",
  });

  // Carga inicial y concurrente de datos
  const loadData = useCallback(async (showFullLoader = true) => {
    if (showFullLoader) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [categoriesData, itemsData, movementsData] = await Promise.all([
        getCategories(),
        getItems(),
        getMovements({ limite: 20 }),
      ]);

      const cats = Array.isArray(categoriesData) ? categoriesData : [];
      setCategories(cats);
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setMovements(Array.isArray(movementsData) ? movementsData : []);

      // Si el form de nuevo insumo no tiene categoría asignada por defecto, usar la primera
      if (cats.length > 0 && !newSupply.categoria_id) {
        setNewSupply((prev) => ({
          ...prev,
          categoria_id: prev.categoria_id || cats[0].id,
        }));
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
  }, [newSupply.categoria_id]);

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

  useEffect(() => {
    // Debounce leve para búsqueda de texto
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

  // Manejo de registro de nuevo insumo
  const handleCreateSupply = async (e) => {
    e.preventDefault();

    if (!newSupply.nombre.trim()) {
      toast.error("El nombre del insumo es obligatorio");
      return;
    }
    if (!newSupply.categoria_id) {
      toast.error("Seleccione una categoría válida");
      return;
    }
    const minStock = parseFloat(newSupply.stock_minimo);
    if (isNaN(minStock) || minStock < 0) {
      toast.error("El stock mínimo debe ser un número positivo");
      return;
    }
    const unitCost = parseFloat(newSupply.costo_unitario);
    if (isNaN(unitCost) || unitCost < 0) {
      toast.error("El costo unitario debe ser mayor o igual a 0");
      return;
    }

    setIsSubmitting(true);
    try {
      await createItem({
        categoria_id: newSupply.categoria_id,
        codigo_sku: newSupply.codigo_sku.trim() || `INS-${Math.floor(100 + Math.random() * 900)}`,
        nombre: newSupply.nombre.trim(),
        unidad_medida: newSupply.unidad_medida,
        stock_minimo: minStock,
        costo_unitario: unitCost,
        ubicacion_bodega: newSupply.ubicacion_bodega.trim() || "Bodega General",
      });

      toast.success("Insumo registrado exitosamente en PostgreSQL");
      setIsAddModalOpen(false);
      setNewSupply({
        categoria_id: categories[0]?.id || "",
        codigo_sku: "",
        nombre: "",
        unidad_medida: "Bultos (40kg)",
        stock_minimo: "",
        costo_unitario: "",
        ubicacion_bodega: "",
      });
      await loadData(false);
    } catch (err) {
      console.error("Error al crear insumo:", err);
      toast.error(err.message || "No se pudo registrar el insumo");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejo de registro de movimiento en Kardex
  const handleRegisterMovementSubmit = async (e) => {
    e.preventDefault();

    if (!movementForm.item_id) {
      toast.error("Seleccione un insumo para el movimiento");
      return;
    }
    const qty = parseFloat(movementForm.cantidad);
    if (isNaN(qty) || qty <= 0) {
      toast.error("La cantidad debe ser un número positivo mayor a 0");
      return;
    }
    if (!movementForm.motivo.trim()) {
      toast.error("Debe ingresar un motivo o justificación");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        item_id: movementForm.item_id,
        tipo_movimiento: movementForm.tipo_movimiento,
        cantidad: qty,
        motivo: movementForm.motivo.trim(),
      };
      if (movementForm.costo_unitario) {
        payload.costo_unitario = parseFloat(movementForm.costo_unitario);
      }

      await registerMovement(payload);
      toast.success("Movimiento registrado en Kardex correctamente");
      setIsMovementModalOpen(false);
      setSelectedItemForMovement(null);
      setMovementForm({
        item_id: "",
        tipo_movimiento: "entrada_compra",
        cantidad: "",
        costo_unitario: "",
        motivo: "",
      });
      await loadData(false);
    } catch (err) {
      console.error("Error al registrar movimiento:", err);
      toast.error(err.message || "Fallo al registrar el movimiento en Kardex");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir modal de movimiento preseleccionando un item
  const openMovementForSupply = (item) => {
    setSelectedItemForMovement(item);
    setMovementForm({
      item_id: item.id,
      tipo_movimiento: "salida_consumo",
      cantidad: "",
      costo_unitario: item.costo_unitario ? String(item.costo_unitario) : "",
      motivo: "",
    });
    setIsMovementModalOpen(true);
  };

  // Columnas para componente Table (Artículos)
  const itemColumns = [
    {
      key: "sku",
      header: "SKU / Código",
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
          {row.codigo_sku || "N/A"}
        </span>
      ),
    },
    {
      key: "nombre",
      header: "Insumo / Referencia",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block text-sm">
            {row.nombre}
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
            <Warehouse className="h-3 w-3" />
            {row.ubicacion_bodega || "Bodega Central"}
          </span>
        </div>
      ),
    },
    {
      key: "categoria",
      header: "Categoría",
      render: (row) => {
        const cat =
          categoryMap.get(row.categoria_id) ||
          categoryMap.get(row.categoria_codigo) || {
            nombre: row.categoria_codigo || "General",
            color: "slate",
          };
        const colorClass = CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.slate;

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}
          >
            {cat.nombre}
          </span>
        );
      },
    },
    {
      key: "stock",
      header: "Stock Actual vs Mínimo",
      render: (row) => {
        const actual = Number(row.stock_actual) || 0;
        const minimo = Number(row.stock_minimo) || 0;
        const isCritical = actual <= minimo;

        return (
          <div>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-base font-black ${
                  isCritical ? "text-rose-600" : "text-slate-900"
                }`}
              >
                {actual.toLocaleString("es-CO")}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {row.unidad_medida}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
              <span>Mínimo: {minimo}</span>
              {isCritical && (
                <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[10px] font-black text-rose-700">
                  ¡Bajo Stock!
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "costo",
      header: "Costo Unitario",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-sm">
            ${Number(row.costo_unitario || 0).toLocaleString("es-CO")}
          </span>
          <span className="block text-[11px] text-slate-400">
            Total: $
            {(
              (Number(row.stock_actual) || 0) * (Number(row.costo_unitario) || 0)
            ).toLocaleString("es-CO")}
          </span>
        </div>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openMovementForSupply(row)}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            title="Registrar entrada o salida"
          >
            <RefreshCw size={13} />
            <span>Kardex</span>
          </button>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/inventory/profile?id=${row.id}`)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
            title="Ver ficha técnica del insumo"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      ),
    },
  ];

  // Columnas para componente Table (Movimientos Kardex)
  const movementColumns = [
    {
      key: "fecha",
      header: "Fecha / Momento (COT)",
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
          {formatDateTime(row.fecha_movimiento)}
        </span>
      ),
    },
    {
      key: "tipo",
      header: "Operación",
      render: (row) => {
        const config =
          MOVEMENT_CONFIG[row.tipo_movimiento] || {
            label: row.tipo_movimiento || "Movimiento",
            badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
            icon: RefreshCw,
            sign: "",
            signColor: "text-slate-600",
          };
        const Icon = config.icon;

        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${config.badgeClass}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </span>
        );
      },
    },
    {
      key: "item",
      header: "Insumo Afectado",
      render: (row) => (
        <span className="font-bold text-slate-900 text-sm">
          {row.item_nombre || "Insumo"}
        </span>
      ),
    },
    {
      key: "cantidad",
      header: "Cantidad",
      render: (row) => {
        const config = MOVEMENT_CONFIG[row.tipo_movimiento] || {
          sign: "",
          signColor: "text-slate-900",
        };
        return (
          <span className={`font-black text-sm ${config.signColor}`}>
            {config.sign}
            {Number(row.cantidad).toLocaleString("es-CO")}
          </span>
        );
      },
    },
    {
      key: "motivo",
      header: "Motivo / Justificación",
      render: (row) => (
        <span className="text-xs text-slate-600 line-clamp-2">
          {row.motivo || "Sin justificación"}
        </span>
      ),
    },
    {
      key: "usuario",
      header: "Responsable",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
          {row.usuario_nombre || "Sistema"}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-900">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="BODEGA Y LOGÍSTICA"
        title="Inventario de Insumos y Almacén"
        description="Gestión física y analítica de existencias de alimentos balanceados, medicamentos, vacunas y material sanitario en PostgreSQL."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                setSelectedItemForMovement(null);
                setMovementForm({
                  item_id: items[0]?.id || "",
                  tipo_movimiento: "entrada_compra",
                  cantidad: "",
                  costo_unitario: "",
                  motivo: "",
                });
                setIsMovementModalOpen(true);
              }}
              tone="soft"
              className="flex items-center gap-2 font-bold rounded-xl! shadow-xs border border-slate-200 hover:bg-slate-100"
            >
              <RefreshCw size={16} />
              Movimiento Kardex
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              tone="primary"
              className="flex items-center gap-2 font-black rounded-xl! shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              Nuevo Insumo
            </Button>
          </div>
        }
      />

      {/* Banner de Error en caso de falla de sincronización */}
      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-rose-100 p-2 text-rose-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Fallo de sincronización de inventario
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <Button
            onClick={() => loadData(true)}
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
        {/* Valor Total en Bodega */}
        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Valor Total en Bodega
              </p>
              {isLoading ? (
                <div className="h-8 w-32 bg-slate-200 rounded animate-pulse mt-2" />
              ) : (
                <h4 className="text-2xl font-black text-slate-900 mt-2">
                  ${totalValue.toLocaleString("es-CO")}
                </h4>
              )}
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Estimado en inventario físico
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
        </Card>

        {/* Total de Referencias */}
        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total de Referencias
              </p>
              {isLoading ? (
                <div className="h-8 w-24 bg-slate-200 rounded animate-pulse mt-2" />
              ) : (
                <h4 className="text-2xl font-black text-slate-900 mt-2">
                  {items.length} Insumos
                </h4>
              )}
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                {categories.length} categorías activas
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={24} />
            </div>
          </div>
        </Card>

        {/* Alertas de Bajo Stock */}
        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Stock Bajo / Crítico
              </p>
              {isLoading ? (
                <div className="h-8 w-24 bg-slate-200 rounded animate-pulse mt-2" />
              ) : (
                <h4
                  className={`text-2xl font-black mt-2 ${
                    lowStockCount > 0 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {lowStockCount} Insumos
                </h4>
              )}
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                {lowStockCount > 0
                  ? "Requieren orden de compra"
                  : "Nivel óptimo en bodega"}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                lowStockCount > 0
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <AlertTriangle size={24} />
            </div>
          </div>
        </Card>

        {/* Movimientos Kardex */}
        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Movimientos Kardex
              </p>
              {isLoading ? (
                <div className="h-8 w-24 bg-slate-200 rounded animate-pulse mt-2" />
              ) : (
                <h4 className="text-2xl font-black text-purple-600 mt-2">
                  {movements.length} Registros
                </h4>
              )}
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Entradas, consumos y mermas
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* CONTROL DE PESTAÑAS */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("items")}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "items"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Package size={16} />
            <span>Artículos en Stock ({items.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("movements")}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "movements"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <ClipboardList size={16} />
            <span>Historial Kardex ({movements.length})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => loadData(false)}
          disabled={isRefreshing}
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
        >
          <RefreshCw
            size={13}
            className={isRefreshing ? "animate-spin text-indigo-600" : ""}
          />
          <span>Actualizar</span>
        </button>
      </div>

      {/* SECCIÓN 1: ARTÍCULOS EN STOCK */}
      {activeTab === "items" && (
        <div className="space-y-6">
          {/* BARRA DE FILTROS */}
          <Card className="rounded-3xl p-5 flex flex-col md:flex-row gap-4 items-end bg-white border border-slate-100 shadow-sm">
            <div className="w-full md:w-1/2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Search size={14} className="text-indigo-500" />
                Buscar por Nombre o SKU
              </label>
              <Input
                placeholder="Ej: Iniciación, Ivermectina, INS-001..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full shadow-sm text-sm"
              />
            </div>

            <div className="w-full md:w-1/3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Filter size={14} className="text-indigo-500" />
                Categoría
              </label>
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm appearance-none cursor-pointer text-sm"
                >
                  <option value="">Todas las Categorías</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <button
                type="button"
                onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
                className={`w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  filterLowStockOnly
                    ? "bg-rose-50 border-rose-300 text-rose-700 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <AlertTriangle
                  size={14}
                  className={filterLowStockOnly ? "text-rose-600" : "text-slate-400"}
                />
                <span>Solo Bajo Stock</span>
              </button>
            </div>
          </Card>

          {/* TABLA MAESTRA DE EXISTENCIAS DE BODEGA */}
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
            ) : items.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No se encontraron insumos en bodega"
                description={
                  searchTerm || filterCategory || filterLowStockOnly
                    ? "No existen artículos que coincidan con los filtros aplicados. Intenta restablecer los filtros."
                    : "Aún no se han registrado insumos en la base de datos de PostgreSQL."
                }
                actionLabel="Registrar Nuevo Insumo"
                onAction={() => setIsAddModalOpen(true)}
              />
            ) : (
              <Table columns={itemColumns} rows={items} />
            )}
          </section>
        </div>
      )}

      {/* SECCIÓN 2: HISTORIAL KARDEX */}
      {activeTab === "movements" && (
        <section className="bg-white rounded-3xl shadow-sm overflow-hidden p-2 border border-slate-100">
          <div className="p-4 flex items-center justify-between border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Auditoría de Movimientos Físicos (Kardex)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Trazabilidad inmutable de entradas por compra, consumos de lotes y ajustes por merma
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedItemForMovement(null);
                setMovementForm({
                  item_id: items[0]?.id || "",
                  tipo_movimiento: "entrada_compra",
                  cantidad: "",
                  costo_unitario: "",
                  motivo: "",
                });
                setIsMovementModalOpen(true);
              }}
              tone="primary"
              className="text-xs font-bold py-2 px-3 rounded-xl!"
            >
              <Plus size={14} className="mr-1" />
              Nuevo Movimiento
            </Button>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-2xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : movements.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Sin movimientos registrados"
              description="No hay entradas o salidas físicas registradas en el Kardex de inventario."
              actionLabel="Registrar Primer Movimiento"
              onAction={() => {
                setSelectedItemForMovement(null);
                setIsMovementModalOpen(true);
              }}
            />
          ) : (
            <Table columns={movementColumns} rows={movements} />
          )}
        </section>
      )}

      {/* MODAL 1: REGISTRO DE NUEVO INSUMO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <Card
            as="form"
            onSubmit={handleCreateSupply}
            className="w-full max-w-xl p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
          >
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-2xl font-black mb-6 text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                <Package className="w-6 h-6" />
              </div>
              Registrar Nuevo Insumo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Código SKU *
                </label>
                <Input
                  placeholder="Ej: INS-011"
                  required
                  value={newSupply.codigo_sku}
                  onChange={(e) =>
                    setNewSupply({ ...newSupply, codigo_sku: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Categoría *
                </label>
                <select
                  value={newSupply.categoria_id}
                  onChange={(e) =>
                    setNewSupply({ ...newSupply, categoria_id: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-sm cursor-pointer"
                  required
                >
                  <option value="">Seleccione Categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Nombre del Insumo / Producto *
                </label>
                <Input
                  placeholder="Ej: Iniciación Lechones Precebo 1"
                  required
                  value={newSupply.nombre}
                  onChange={(e) =>
                    setNewSupply({ ...newSupply, nombre: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Unidad de Medida *
                </label>
                <select
                  value={newSupply.unidad_medida}
                  onChange={(e) =>
                    setNewSupply({ ...newSupply, unidad_medida: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-sm cursor-pointer"
                >
                  {STANDARD_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Stock Mínimo de Seguridad *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ej: 15"
                  required
                  value={newSupply.stock_minimo}
                  onChange={(e) =>
                    setNewSupply({ ...newSupply, stock_minimo: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Costo Unitario ($ COP) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ej: 98000"
                  required
                  value={newSupply.costo_unitario}
                  onChange={(e) =>
                    setNewSupply({
                      ...newSupply,
                      costo_unitario: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Ubicación en Bodega
                </label>
                <Input
                  placeholder="Ej: Silo 1, Estante B"
                  value={newSupply.ubicacion_bodega}
                  onChange={(e) =>
                    setNewSupply({
                      ...newSupply,
                      ubicacion_bodega: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                tone="soft"
                onClick={() => setIsAddModalOpen(false)}
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
                {isSubmitting ? "Guardando..." : "Guardar en Bodega"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 2: REGISTRO DE MOVIMIENTO KARDEX */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <Card
            as="form"
            onSubmit={handleRegisterMovementSubmit}
            className="w-full max-w-lg p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
          >
            <button
              type="button"
              onClick={() => {
                setIsMovementModalOpen(false);
                setSelectedItemForMovement(null);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                <RefreshCw className="w-5 h-5" />
              </div>
              Registrar Movimiento de Kardex
            </h3>
            <p className="text-xs text-slate-500 font-semibold mb-6">
              Afectación física de stock en almacén con auditoría inmutable
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Insumo Afectado *
                </label>
                <select
                  value={movementForm.item_id}
                  onChange={(e) => {
                    const found = items.find((i) => i.id === e.target.value);
                    setMovementForm({
                      ...movementForm,
                      item_id: e.target.value,
                      costo_unitario: found?.costo_unitario
                        ? String(found.costo_unitario)
                        : movementForm.costo_unitario,
                    });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-sm cursor-pointer"
                  required
                >
                  <option value="">Seleccione Insumo</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.codigo_sku}] {item.nombre} (Stock actual:{" "}
                      {item.stock_actual} {item.unidad_medida})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Tipo de Movimiento *
                  </label>
                  <select
                    value={movementForm.tipo_movimiento}
                    onChange={(e) =>
                      setMovementForm({
                        ...movementForm,
                        tipo_movimiento: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-sm cursor-pointer"
                    required
                  >
                    <option value="entrada_compra">Entrada Compra</option>
                    <option value="salida_consumo">Salida Consumo</option>
                    <option value="ajuste_merma">Ajuste por Merma</option>
                    <option value="devolucion">Devolución</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Cantidad *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="Ej: 10.00"
                    value={movementForm.cantidad}
                    onChange={(e) =>
                      setMovementForm({
                        ...movementForm,
                        cantidad: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Costo Unitario ($ COP - Opcional)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ej: 98000"
                  value={movementForm.costo_unitario}
                  onChange={(e) =>
                    setMovementForm({
                      ...movementForm,
                      costo_unitario: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Motivo / Justificación *
                </label>
                <Input
                  placeholder="Ej: Compra mensual proveedor / Dieta precebo lote 4"
                  required
                  value={movementForm.motivo}
                  onChange={(e) =>
                    setMovementForm({
                      ...movementForm,
                      motivo: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                tone="soft"
                onClick={() => {
                  setIsMovementModalOpen(false);
                  setSelectedItemForMovement(null);
                }}
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
                {isSubmitting ? "Procesando..." : "Confirmar Movimiento"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
