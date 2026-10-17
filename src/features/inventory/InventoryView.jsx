"use client";

import React, { useState } from "react";
import {
  Package,
  Plus,
  RefreshCw,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import ModuleHeader from "@/components/layout/ModuleHeader";
import { createItem, registerMovement } from "@/services/inventoryService";

import dynamic from "next/dynamic";
import { useInventoryData } from "./hooks/useInventoryData";
import InventoryKPIs from "./components/InventoryKPIs";
import InventoryItemsTab from "./components/InventoryItemsTab";
import InventoryMovementsTab from "./components/InventoryMovementsTab";

const NewSupplyModal = dynamic(() => import("./components/NewSupplyModal"), { ssr: false });
const KardexMovementModal = dynamic(() => import("./components/KardexMovementModal"), { ssr: false });

export default function InventoryView() {
  const [activeTab, setActiveTab] = useState("items");

  // Hook maestro de datos y KPIs
  const {
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
    categoryMap,
    loadData,
  } = useInventoryData();

  // Estados de Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registro de nuevo insumo
  const handleCreateSupply = async (newSupply) => {
    if (!newSupply.nombre.trim()) {
      toast.error("El nombre del insumo es obligatorio");
      return false;
    }
    if (!newSupply.categoria_id) {
      toast.error("Seleccione una categoría válida");
      return false;
    }
    const minStock = parseFloat(newSupply.stock_minimo);
    if (isNaN(minStock) || minStock < 0) {
      toast.error("El stock mínimo debe ser un número positivo");
      return false;
    }
    const unitCost = parseFloat(newSupply.costo_unitario);
    if (isNaN(unitCost) || unitCost < 0) {
      toast.error("El costo unitario debe ser mayor o igual a 0");
      return false;
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
      await loadData(false);
      return true;
    } catch (err) {
      console.error("Error al crear insumo:", err);
      toast.error(err.message || "No se pudo registrar el insumo");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Registro de movimiento en Kardex
  const handleRegisterMovement = async (movementForm) => {
    if (!movementForm.item_id) {
      toast.error("Seleccione un insumo para el movimiento");
      return false;
    }
    const qty = parseFloat(movementForm.cantidad);
    if (isNaN(qty) || qty <= 0) {
      toast.error("La cantidad debe ser un número positivo mayor a 0");
      return false;
    }
    if (!movementForm.motivo.trim()) {
      toast.error("Debe ingresar un motivo o justificación");
      return false;
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
      await loadData(false);
      return true;
    } catch (err) {
      console.error("Error al registrar movimiento:", err);
      toast.error(err.message || "Fallo al registrar el movimiento en Kardex");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir modal de movimiento preseleccionando un item
  const handleOpenMovementForSupply = (item) => {
    setSelectedItemForMovement(item);
    setIsMovementModalOpen(true);
  };

  const handleOpenNewMovementGeneral = () => {
    setSelectedItemForMovement(null);
    setIsMovementModalOpen(true);
  };

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
              onClick={handleOpenNewMovementGeneral}
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

      {/* Banner de Error */}
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

      {/* TARJETAS DE KPI */}
      <InventoryKPIs
        totalValue={totalValue}
        itemsCount={items.length}
        categoriesCount={categories.length}
        lowStockCount={lowStockCount}
        movementsCount={movements.length}
        isLoading={isLoading}
      />

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

      {/* CONTENIDO DE PESTAÑA ACTIVA */}
      {activeTab === "items" ? (
        <InventoryItemsTab
          items={items}
          categories={categories}
          categoryMap={categoryMap}
          isLoading={isLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterLowStockOnly={filterLowStockOnly}
          setFilterLowStockOnly={setFilterLowStockOnly}
          resetFilters={resetFilters}
          onOpenMovementForSupply={handleOpenMovementForSupply}
          onOpenNewSupply={() => setIsAddModalOpen(true)}
        />
      ) : (
        <InventoryMovementsTab
          movements={movements}
          isLoading={isLoading}
          onOpenNewMovement={handleOpenNewMovementGeneral}
        />
      )}

      {/* MODAL 1: REGISTRO DE NUEVO INSUMO */}
      <NewSupplyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateSupply}
        isSubmitting={isSubmitting}
        categories={categories}
      />

      {/* MODAL 2: REGISTRO DE MOVIMIENTO KARDEX */}
      <KardexMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => {
          setIsMovementModalOpen(false);
          setSelectedItemForMovement(null);
        }}
        onSubmit={handleRegisterMovement}
        isSubmitting={isSubmitting}
        items={items}
        selectedItem={selectedItemForMovement}
      />
    </div>
  );
}
