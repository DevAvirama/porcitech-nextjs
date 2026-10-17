"use client";

import React, { useState } from "react";
import { Activity } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getAnimalDisplayName, UUID_REGEX } from "@/utils/formatters";

export default function WeaningModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  females,
  corrales,
}) {
  const [weaningForm, setWeaningForm] = useState({
    parto_id: "",
    hembra_id: "",
    corral_destino_id: "",
    fecha_destete: new Date().toISOString().split("T")[0],
    lechones_destetados: "",
    peso_total_kg: "",
    dias_lactancia: "21",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(weaningForm);
    if (success) {
      setWeaningForm({
        parto_id: "",
        hembra_id: "",
        corral_destino_id: "",
        fecha_destete: new Date().toISOString().split("T")[0],
        lechones_destetados: "",
        peso_total_kg: "",
        dias_lactancia: "21",
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

        <h2 className="text-2xl font-black mb-1 text-slate-900 flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
            <Activity className="w-5 h-5" />
          </div>
          Registrar Destete de Camada
        </h2>
        <p className="text-xs text-slate-500 font-semibold mb-6">
          Finalización de lactancia y traslado del lote a corral de precebo
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
              Cerda Madre *
            </label>
            <select
              value={weaningForm.hembra_id}
              onChange={(e) =>
                setWeaningForm({
                  ...weaningForm,
                  hembra_id: e.target.value,
                })
              }
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-purple-500 outline-none text-sm cursor-pointer"
              required
            >
              <option value="">Seleccione madre...</option>
              {females.map((f) => {
                const displayName = getAnimalDisplayName(f);
                const validArete =
                  f.codigo_arete && !UUID_REGEX.test(f.codigo_arete)
                    ? `#${f.codigo_arete} · `
                    : "";
                return (
                  <option key={f.id} value={f.id}>
                    {validArete ? `${validArete}${displayName}` : displayName} ({f.raza || "Cerda"})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
              Corral Destino (Precebo) *
            </label>
            <select
              value={weaningForm.corral_destino_id}
              onChange={(e) =>
                setWeaningForm({
                  ...weaningForm,
                  corral_destino_id: e.target.value,
                })
              }
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-purple-500 outline-none text-sm cursor-pointer"
              required
            >
              <option value="">Seleccione corral destino...</option>
              {corrales.map((c) => (
                <option key={c.id} value={c.id}>
                  Corral {c.codigo} ({c.fase})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                Fecha de Destete *
              </label>
              <Input
                type="date"
                required
                value={weaningForm.fecha_destete}
                onChange={(e) =>
                  setWeaningForm({
                    ...weaningForm,
                    fecha_destete: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                Días de Lactancia *
              </label>
              <Input
                type="number"
                min="14"
                required
                placeholder="21"
                value={weaningForm.dias_lactancia}
                onChange={(e) =>
                  setWeaningForm({
                    ...weaningForm,
                    dias_lactancia: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                Lechones Destetados *
              </label>
              <Input
                type="number"
                min="1"
                required
                placeholder="11"
                value={weaningForm.lechones_destetados}
                onChange={(e) =>
                  setWeaningForm({
                    ...weaningForm,
                    lechones_destetados: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                Peso Total Lote (kg) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="1"
                required
                placeholder="68.5"
                value={weaningForm.peso_total_kg}
                onChange={(e) =>
                  setWeaningForm({
                    ...weaningForm,
                    peso_total_kg: e.target.value,
                  })
                }
              />
            </div>
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
            className="flex-1 font-black bg-purple-600 hover:bg-purple-700 text-white rounded-xl! shadow-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registrando..." : "Guardar Destete"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
