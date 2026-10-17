"use client";

import React from "react";
import { DollarSign, Package, AlertTriangle, Clock } from "lucide-react";
import Card from "@/components/ui/Card";

export default function InventoryKPIs({
  totalValue,
  itemsCount,
  categoriesCount,
  lowStockCount,
  movementsCount,
  isLoading,
}) {
  return (
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
                {itemsCount} Insumos
              </h4>
            )}
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              {categoriesCount} categorías activas
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
                {movementsCount} Registros
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
  );
}
