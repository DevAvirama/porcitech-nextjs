"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function KardexMovementModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  items,
  selectedItem,
}) {
  const [movementForm, setMovementForm] = useState({
    item_id: "",
    tipo_movimiento: "entrada_compra",
    cantidad: "",
    costo_unitario: "",
    motivo: "",
  });

  useEffect(() => {
    if (selectedItem) {
      setMovementForm({
        item_id: selectedItem.id,
        tipo_movimiento: "salida_consumo",
        cantidad: "",
        costo_unitario: selectedItem.costo_unitario ? String(selectedItem.costo_unitario) : "",
        motivo: "",
      });
    } else if (items.length > 0 && !movementForm.item_id) {
      setMovementForm((prev) => ({
        ...prev,
        item_id: items[0].id,
      }));
    }
  }, [selectedItem, items, movementForm.item_id]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(movementForm);
    if (success) {
      setMovementForm({
        item_id: items[0]?.id || "",
        tipo_movimiento: "entrada_compra",
        cantidad: "",
        costo_unitario: "",
        motivo: "",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
      <Card
        as="form"
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
      >
        <button
          type="button"
          onClick={onClose}
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
            {isSubmitting ? "Procesando..." : "Confirmar Movimiento"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
