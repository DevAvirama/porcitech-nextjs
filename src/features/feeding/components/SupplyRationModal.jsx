"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Utensils } from "lucide-react";

export default function SupplyRationModal({
  isOpen = false,
  onClose,
  form = {},
  setForm,
  corrales = [],
  feedItems = [],
  isSubmitting = false,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
      <Card
        as="form"
        onSubmit={onSubmit}
        className="w-full max-w-lg p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
      >
        <button
          type="button"
          onClick={onClose}
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
            {isSubmitting ? "Suministrando..." : "Confirmar Entrega"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
