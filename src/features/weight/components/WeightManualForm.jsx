"use client";

import React, { useState } from "react";
import { Scale } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getAnimalDisplayName, UUID_REGEX } from "@/utils/formatters";
import { registerManualWeight } from "@/services/weightService";

export default function WeightManualForm({
  animals,
  corrales,
  onManualWeightRegistered,
}) {
  const [manualForm, setManualForm] = useState({
    animalId: "",
    corralId: "",
    peso_kg: "",
    fecha: new Date().toISOString().split("T")[0],
    observaciones: "",
  });
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.animalId || !manualForm.peso_kg) {
      toast.error("Completa el cerdo y el peso registrado.");
      return;
    }

    setIsSubmittingManual(true);
    try {
      const payload = {
        id_cerdo: manualForm.animalId,
        corral_id: manualForm.corralId || null,
        peso_kg: parseFloat(manualForm.peso_kg),
        tiempo: manualForm.fecha
          ? new Date(manualForm.fecha).toISOString()
          : new Date().toISOString(),
        observaciones: manualForm.observaciones || null,
      };

      const result = await registerManualWeight(payload);
      toast.success("Pesaje de báscula almacenado en TimescaleDB correctamente.");

      const chosen = animals.find((a) => a.id === manualForm.animalId);
      const corralObj = corrales.find((c) => c.id === manualForm.corralId);
      const validArete =
        chosen?.codigo_arete && !UUID_REGEX.test(chosen.codigo_arete)
          ? chosen.codigo_arete
          : null;

      const newLog = {
        id: result?.id_registro || result?.id || `MAN-${Date.now()}`,
        animalCode: validArete,
        animalDisplayName: getAnimalDisplayName(chosen),
        animalAlias: chosen?.nombre_alias,
        corralCodigo: corralObj?.codigo || "N/A",
        peso: parseFloat(manualForm.peso_kg),
        metodo: "manual_bascula",
        confianza: 1.0,
        fecha: payload.tiempo,
      };

      if (onManualWeightRegistered) {
        onManualWeightRegistered(newLog);
      }

      // Limpiar formulario
      setManualForm({
        animalId: "",
        corralId: "",
        peso_kg: "",
        fecha: new Date().toISOString().split("T")[0],
        observaciones: "",
      });
    } catch (err) {
      console.error("Error al registrar pesaje manual:", err);
      toast.error(err.message || "Error al guardar el pesaje en TimescaleDB.");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <Card
        as="form"
        onSubmit={handleManualSubmit}
        className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Scale size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Registrar Pesaje en Báscula de Piso
            </h3>
            <p className="text-xs text-slate-500">
              Inserta pesajes físicos directos en la hipertabla de TimescaleDB.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Cerdo *
            </label>
            <select
              value={manualForm.animalId}
              onChange={(e) => {
                const id = e.target.value;
                const found = animals.find((a) => a.id === id);
                setManualForm((prev) => ({
                  ...prev,
                  animalId: id,
                  corralId: found?.corral_id || prev.corralId,
                }));
              }}
              required
              disabled={isSubmittingManual}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">-- Seleccionar cerdo --</option>
              {animals.map((a) => {
                const displayName = getAnimalDisplayName(a);
                const validArete =
                  a.codigo_arete && !UUID_REGEX.test(a.codigo_arete)
                    ? `#${a.codigo_arete} · `
                    : "";
                return (
                  <option key={a.id} value={a.id}>
                    {validArete ? `${validArete}${displayName}` : displayName} ({a.raza || "Porcino"})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Corral de Ubicación
            </label>
            <select
              value={manualForm.corralId}
              onChange={(e) =>
                setManualForm((prev) => ({ ...prev, corralId: e.target.value }))
              }
              disabled={isSubmittingManual}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">-- Sin corral asignado --</option>
              {corrales.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} ({c.fase})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Peso Real en Báscula (kg) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.5"
              required
              placeholder="Ej: 82.50"
              value={manualForm.peso_kg}
              onChange={(e) =>
                setManualForm((prev) => ({ ...prev, peso_kg: e.target.value }))
              }
              disabled={isSubmittingManual}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Fecha de la Toma *
            </label>
            <input
              type="date"
              required
              value={manualForm.fecha}
              onChange={(e) =>
                setManualForm((prev) => ({ ...prev, fecha: e.target.value }))
              }
              disabled={isSubmittingManual}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Observaciones Zootécnicas (Opcional)
          </label>
          <textarea
            rows={2}
            placeholder="Ej: Pesaje de control previo a cambio de ración..."
            value={manualForm.observaciones}
            onChange={(e) =>
              setManualForm((prev) => ({ ...prev, observaciones: e.target.value }))
            }
            disabled={isSubmittingManual}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <Button
          type="submit"
          tone="primary"
          isLoading={isSubmittingManual}
          disabled={isSubmittingManual}
          className="w-full py-3.5 rounded-xl font-black text-sm shadow-md mt-2 cursor-pointer"
        >
          Guardar Pesaje en TimescaleDB
        </Button>
      </Card>
    </div>
  );
}
