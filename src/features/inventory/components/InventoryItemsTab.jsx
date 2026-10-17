"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  Warehouse,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import { CATEGORY_COLORS } from "../hooks/useInventoryData";

export default function InventoryItemsTab({
  items,
  categories,
  categoryMap,
  isLoading,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  filterLowStockOnly,
  setFilterLowStockOnly,
  resetFilters,
  onOpenMovementForSupply,
  onOpenNewSupply,
}) {
  const router = useRouter();

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
            onClick={() => onOpenMovementForSupply(row)}
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

  return (
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
            title={
              searchTerm || filterCategory || filterLowStockOnly
                ? "No se encontraron insumos con los filtros aplicados"
                : "Inventario sin insumos"
            }
            description={
              searchTerm || filterCategory || filterLowStockOnly
                ? "No existen artículos que coincidan con los filtros aplicados. Intenta restablecer los filtros."
                : "Comienza registrando alimentos balanceados, fármacos o materias primas."
            }
            actionLabel={
              searchTerm || filterCategory || filterLowStockOnly
                ? "Restablecer Filtros"
                : "+ Registrar Insumo"
            }
            onAction={
              searchTerm || filterCategory || filterLowStockOnly
                ? resetFilters
                : onOpenNewSupply
            }
          />
        ) : (
          <Table columns={itemColumns} rows={items} />
        )}
      </section>
    </div>
  );
}
