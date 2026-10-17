"use client";

import React, { useState, useEffect } from "react";
import { Package } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { STANDARD_UNITS } from "../hooks/useInventoryData";

export default function NewSupplyModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  categories,
}) {
  const [newSupply, setNewSupply] = useState({
    categoria_id: "",
    codigo_sku: "",
    nombre: "",
    unidad_medida: "Bultos (40kg)",
    stock_minimo: "",
    costo_unitario: "",
    ubicacion_bodega: "",
  });

  useEffect(() => {
    if (categories.length > 0 && !newSupply.categoria_id) {
      setNewSupply((prev) => ({
        ...prev,
        categoria_id: categories[0].id,
      }));
    }
  }, [categories, newSupply.categoria_id]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(newSupply);
    if (success) {
      setNewSupply({
        categoria_id: categories[0]?.id || "",
        codigo_sku: "",
        nombre: "",
        unidad_medida: "Bultos (40kg)",
        stock_minimo: "",
        costo_unitario: "",
        ubicacion_bodega: "",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
      <Card
        as="form"
        onSubmit={handleSubmit}
        className="w-full max-w-xl p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
      >
        <button
          type="button"
          onClick={onClose}
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
            onClick={onClose}
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
  );
}
