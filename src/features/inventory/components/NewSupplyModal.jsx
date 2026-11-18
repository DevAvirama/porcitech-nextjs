"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getUnitsForCategory } from "../hooks/useInventoryData";

const LABEL = "text-xs font-bold text-slate-700 uppercase block mb-1.5";
const SELECT =
  "w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-sm cursor-pointer";

const emptySupply = (categoria_id = "", unidad_medida = "Bultos (40kg)") => ({
  categoria_id,
  codigo_sku: "",
  nombre: "",
  unidad_medida,
  stock_minimo: "",
  costo_unitario: "",
  ubicacion_bodega: "",
  stock_inicial: "",
  numero_lote: "",
  fecha_vencimiento: "",
  registro_ica: "",
});

export default function NewSupplyModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  categories,
}) {
  const [newSupply, setNewSupply] = useState(emptySupply());
  const [showInitialStock, setShowInitialStock] = useState(true);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === newSupply.categoria_id),
    [categories, newSupply.categoria_id]
  );
  const unitOptions = getUnitsForCategory(selectedCategory?.codigo);
  const isHealthProduct = selectedCategory?.codigo === "medicamento";

  useEffect(() => {
    if (categories.length > 0 && !newSupply.categoria_id) {
      const first = categories[0];
      setNewSupply((prev) => ({
        ...prev,
        categoria_id: first.id,
        unidad_medida: getUnitsForCategory(first.codigo)[0],
      }));
    }
  }, [categories, newSupply.categoria_id]);

  if (!isOpen) return null;

  const update = (field) => (e) => setNewSupply({ ...newSupply, [field]: e.target.value });

  const handleCategoryChange = (e) => {
    const cat = categories.find((c) => c.id === e.target.value);
    const units = getUnitsForCategory(cat?.codigo);
    setNewSupply({
      ...newSupply,
      categoria_id: e.target.value,
      unidad_medida: units.includes(newSupply.unidad_medida) ? newSupply.unidad_medida : units[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(newSupply);
    if (success) {
      setNewSupply(emptySupply(categories[0]?.id || "", getUnitsForCategory(categories[0]?.codigo)[0]));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
      <Card
        as="form"
        onSubmit={handleSubmit}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6! sm:p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-2xl font-black mb-1 text-slate-900 flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
            <Package className="w-6 h-6" />
          </div>
          Registrar Nuevo Insumo
        </h2>
        <p className="text-xs text-slate-500 font-semibold mb-6">
          Solo el nombre, la categoría y el costo son obligatorios. Puedes cargar el stock inicial de una vez.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={LABEL}>Nombre del Insumo / Producto *</label>
            <Input
              placeholder="Ej: Iniciación Lechones Precebo 1"
              required
              value={newSupply.nombre}
              onChange={update("nombre")}
            />
          </div>

          <div>
            <label className={LABEL}>Categoría *</label>
            <select value={newSupply.categoria_id} onChange={handleCategoryChange} className={SELECT} required>
              <option value="">Seleccione Categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL}>Unidad de Medida *</label>
            <select value={newSupply.unidad_medida} onChange={update("unidad_medida")} className={SELECT}>
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL}>Costo por Unidad ($ COP) *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej: 98000"
              required
              value={newSupply.costo_unitario}
              onChange={update("costo_unitario")}
            />
          </div>

          <div>
            <label className={LABEL}>Alertar cuando queden menos de</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej: 15"
              value={newSupply.stock_minimo}
              onChange={update("stock_minimo")}
            />
          </div>

          <div>
            <label className={LABEL}>Ubicación en Bodega</label>
            <Input
              placeholder="Ej: Silo 1, Estante B"
              value={newSupply.ubicacion_bodega}
              onChange={update("ubicacion_bodega")}
            />
          </div>

          <div>
            <label className={LABEL}>Código SKU (opcional)</label>
            <Input
              placeholder="Automático si se deja vacío"
              value={newSupply.codigo_sku}
              onChange={update("codigo_sku")}
            />
          </div>
        </div>

        {/* Stock y lote inicial */}
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/40">
          <button
            type="button"
            onClick={() => setShowInitialStock((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-black text-emerald-800 cursor-pointer"
          >
            Stock y Lote Inicial (opcional)
            {showInitialStock ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showInitialStock && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4">
              <div>
                <label className={LABEL}>Cantidad que ingresa</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={`Ej: 20 ${newSupply.unidad_medida}`}
                  value={newSupply.stock_inicial}
                  onChange={update("stock_inicial")}
                />
              </div>
              <div>
                <label className={LABEL}>Número de Lote</label>
                <Input
                  placeholder="Automático si se deja vacío"
                  value={newSupply.numero_lote}
                  onChange={update("numero_lote")}
                />
              </div>
              <div>
                <label className={LABEL}>Fecha de Vencimiento</label>
                <Input type="date" value={newSupply.fecha_vencimiento} onChange={update("fecha_vencimiento")} />
              </div>
              {isHealthProduct && (
                <div>
                  <label className={LABEL}>Registro ICA</label>
                  <Input
                    placeholder="Ej: ICA-4567-MV"
                    value={newSupply.registro_ica}
                    onChange={update("registro_ica")}
                  />
                </div>
              )}
            </div>
          )}
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
          <Button type="submit" tone="primary" className="flex-1 font-black rounded-xl!" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar en Bodega"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
