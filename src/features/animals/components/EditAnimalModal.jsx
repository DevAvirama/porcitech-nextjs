"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Edit3, ArrowRightLeft, X, Shield, Warehouse, Scale, Activity } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { updateAnimal } from "@/services/animalService";
import { getAnimalDisplayName, UUID_REGEX } from "@/utils/formatters";

const ESTADOS_REPRODUCTIVOS_MACHO = [
  "No reproductor / Ceba",
  "Semental activo",
  "En descanso",
];

const ESTADOS_REPRODUCTIVOS_HEMBRA = [
  "Vacía",
  "Inseminada / Servida",
  "Gestante",
  "Lactante",
  "Descarte",
];

export default function EditAnimalModal({
  isOpen,
  onClose,
  animal,
  corrales = [],
  onAnimalUpdated,
}) {
  const [formData, setFormData] = useState({
    codigo_arete: "",
    nombre_alias: "",
    sexo: "hembra",
    estado_reproductivo: "Vacía",
    corral_id: "",
    estado: "activo",
    peso_actual_kg: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (animal) {
      const isMale = (animal.sexo || "").toLowerCase() === "macho";
      const defaultRep = isMale ? "No reproductor / Ceba" : "Vacía";
      setFormData({
        codigo_arete: animal.codigo_arete || "",
        nombre_alias: animal.nombre_alias || "",
        sexo: isMale ? "macho" : "hembra",
        estado_reproductivo: animal.estado_reproductivo || animal.estadoReproductivo || defaultRep,
        corral_id: animal.corral_id || animal.corral?.id || "",
        estado: animal.estado || "activo",
        peso_actual_kg: animal.peso_actual_kg ?? "",
      });
    }
  }, [animal]);

  if (!isOpen || !animal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        codigo_arete: formData.codigo_arete.trim(),
        nombre_alias: formData.nombre_alias.trim() || null,
        sexo: formData.sexo,
        estado_reproductivo: formData.estado_reproductivo,
        corral_id: formData.corral_id && formData.corral_id !== "none" ? formData.corral_id : null,
        estado: formData.estado,
      };

      if (formData.peso_actual_kg !== "" && !isNaN(Number(formData.peso_actual_kg))) {
        payload.peso_actual_kg = Number(formData.peso_actual_kg);
      }

      await updateAnimal(animal.id, payload);

      // Sincronizar en cache offline si aplica
      try {
        const stored = localStorage.getItem("sip_animals");
        if (stored) {
          const list = JSON.parse(stored);
          const updatedList = list.map((a) =>
            a.id === animal.id
              ? {
                  ...a,
                  ...payload,
                  sexo: formData.sexo,
                  estado_reproductivo: formData.estado_reproductivo,
                }
              : a
          );
          localStorage.setItem("sip_animals", JSON.stringify(updatedList));
        }
      } catch {}
      const validCode =
        payload.codigo_arete && !UUID_REGEX.test(payload.codigo_arete)
          ? `#${payload.codigo_arete}`
          : null;
      const displayUpdated = payload.nombre_alias || validCode || "Ejemplar";
      toast.success(`Animal ${displayUpdated} actualizado y reubicado con éxito.`);
      if (onAnimalUpdated) onAnimalUpdated();
      onClose();
    } catch (err) {
      console.error("Error al actualizar animal:", err);
      toast.error(err.message || "Error al actualizar los datos del animal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCorralObj = corrales.find((c) => c.id === formData.corral_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <Card
        as="form"
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white my-8 text-slate-900"
      >
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
        >
          <X size={18} />
        </button>

        {/* Encabezado */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ArrowRightLeft className="text-emerald-600 w-6 h-6" />
            Editar / Trasladar Animal
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
            Modifica la ubicación de corral, estado zootécnico o identificación
          </p>
        </div>

        <div className="space-y-4">
          {/* Arete y Alias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Código de Arete *"
              value={formData.codigo_arete}
              onChange={(e) =>
                setFormData({ ...formData, codigo_arete: e.target.value })
              }
              required
            />
            <Input
              label="Nombre / Alias"
              placeholder="Ej: Titán"
              value={formData.nombre_alias}
              onChange={(e) =>
                setFormData({ ...formData, nombre_alias: e.target.value })
              }
            />
          </div>

          {/* Sexo Biológico y Estado Reproductivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 block">
                Sexo Biológico *
              </label>
              <select
                value={formData.sexo}
                onChange={(e) => {
                  const newSexo = e.target.value;
                  setFormData({
                    ...formData,
                    sexo: newSexo,
                    estado_reproductivo:
                      newSexo === "macho" ? "No reproductor / Ceba" : "Vacía",
                  });
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 font-semibold outline-none text-sm cursor-pointer"
              >
                <option value="hembra">♀ Hembra</option>
                <option value="macho">♂ Macho</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 block">
                Estado Reproductivo *
              </label>
              <select
                value={formData.estado_reproductivo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estado_reproductivo: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 font-semibold outline-none text-sm cursor-pointer"
              >
                {(formData.sexo === "macho"
                  ? ESTADOS_REPRODUCTIVOS_MACHO
                  : ESTADOS_REPRODUCTIVOS_HEMBRA
                ).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Corral de Ubicación */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Warehouse size={15} className="text-emerald-600" />
              Corral / Lote de Destino
            </label>
            <select
              value={formData.corral_id || "none"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  corral_id: e.target.value === "none" ? null : e.target.value,
                })
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 font-semibold outline-none text-sm cursor-pointer"
            >
              <option value="none">-- Sin corral asignado --</option>
              {corrales.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} ({c.fase?.toUpperCase()}) - Cap: {c.capacidad_maxima}
                </option>
              ))}
            </select>
            {currentCorralObj && (
              <span className="text-[11px] font-bold text-slate-400 block mt-1">
                Fase del corral seleccionado:{" "}
                <span className="text-emerald-700 uppercase font-black">
                  {currentCorralObj.fase}
                </span>
              </span>
            )}
          </div>

          {/* Estado / Fase Zootécnica */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Activity size={15} className="text-indigo-600" />
                Estado / Fase Zootécnica *
              </label>
              <select
                value={formData.estado}
                onChange={(e) =>
                  setFormData({ ...formData, estado: e.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 font-semibold outline-none text-sm cursor-pointer"
              >
                <option value="activo">Activo (General)</option>
                <option value="lactante">Lactante</option>
                <option value="precebo">Precebo</option>
                <option value="levante">Levante</option>
                <option value="engorde">Engorde / Ceba</option>
                <option value="gestacion">Gestación</option>
                <option value="cuarentena">Cuarentena</option>
                <option value="enfermo">Enfermo / Aislamiento</option>
                <option value="vendido">Vendido</option>
                <option value="muerto">Muerto</option>
              </select>
            </div>

            <Input
              label="Peso Actual (kg)"
              type="number"
              step="0.1"
              min="0"
              placeholder="Ej: 85.5"
              value={formData.peso_actual_kg}
              onChange={(e) =>
                setFormData({ ...formData, peso_actual_kg: e.target.value })
              }
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4 mt-8">
          <Button
            type="button"
            tone="soft"
            onClick={onClose}
            className="flex-1 rounded-xl! font-bold"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            tone="primary"
            isLoading={isSubmitting}
            className="flex-1 rounded-xl! font-black"
          >
            Guardar Cambios
          </Button>
        </div>
      </Card>
    </div>
  );
}
