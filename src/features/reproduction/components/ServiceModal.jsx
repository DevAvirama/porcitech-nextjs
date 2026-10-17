"use client";

import React, { useState, useMemo } from "react";
import { Heart, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getAnimalDisplayName, UUID_REGEX } from "@/utils/formatters";
import { GESTATION_DAYS } from "../hooks/useReproductionData";

export default function ServiceModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  females,
  males,
  breedingMales,
}) {
  const [serviceForm, setServiceForm] = useState({
    hembra_id: "",
    macho_id: "",
    tipo_servicio: "inseminacion_artificial",
    codigo_pajilla_macho: "",
    fecha_servicio: new Date().toISOString().split("T")[0],
    estado_confirmacion: "pendiente",
  });

  const estimatedFarrowingDate = useMemo(() => {
    if (!serviceForm.fecha_servicio) return "";
    const date = new Date(serviceForm.fecha_servicio);
    date.setDate(date.getDate() + GESTATION_DAYS);
    return date.toISOString().split("T")[0];
  }, [serviceForm.fecha_servicio]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(serviceForm);
    if (success) {
      setServiceForm({
        hembra_id: "",
        macho_id: "",
        tipo_servicio: "inseminacion_artificial",
        codigo_pajilla_macho: "",
        fecha_servicio: new Date().toISOString().split("T")[0],
        estado_confirmacion: "pendiente",
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
          <div className="p-2 bg-fuchsia-100 rounded-xl text-fuchsia-600">
            <Heart className="w-5 h-5" />
          </div>
          Nuevo Servicio Reproductivo
        </h2>
        <p className="text-xs text-slate-500 font-semibold mb-6">
          Inseminación artificial o monta natural con cálculo de gestación (+114 días)
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
              Cerda Reproductora (Hembra) *
            </label>
            <select
              value={serviceForm.hembra_id}
              onChange={(e) =>
                setServiceForm({ ...serviceForm, hembra_id: e.target.value })
              }
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm cursor-pointer"
              required
            >
              <option value="">Seleccione hembra reproductora...</option>
              {females
                .filter((f) => (f.sexo || "").toLowerCase().trim() === "hembra")
                .map((f) => {
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                Tipo de Servicio *
              </label>
              <select
                value={serviceForm.tipo_servicio}
                onChange={(e) =>
                  setServiceForm({
                    ...serviceForm,
                    tipo_servicio: e.target.value,
                  })
                }
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm cursor-pointer"
              >
                <option value="inseminacion_artificial">
                  Inseminación Artificial
                </option>
                <option value="monta_natural">Monta Natural</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                Fecha de Servicio *
              </label>
              <Input
                type="date"
                required
                value={serviceForm.fecha_servicio}
                onChange={(e) =>
                  setServiceForm({
                    ...serviceForm,
                    fecha_servicio: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {serviceForm.tipo_servicio === "monta_natural" ? (
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                Macho Semental (Verraco) *
              </label>
              <select
                value={serviceForm.macho_id}
                onChange={(e) =>
                  setServiceForm({
                    ...serviceForm,
                    macho_id: e.target.value,
                  })
                }
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm cursor-pointer"
                required
              >
                <option value="">Seleccione macho semental...</option>
                {(breedingMales.length > 0
                  ? breedingMales
                  : males.filter((m) => (m.sexo || "").toLowerCase().trim() === "macho")
                ).map((m) => {
                  const displayName = getAnimalDisplayName(m);
                  const validArete =
                    m.codigo_arete && !UUID_REGEX.test(m.codigo_arete)
                      ? `#${m.codigo_arete} · `
                      : "";
                  return (
                    <option key={m.id} value={m.id}>
                      {validArete ? `${validArete}${displayName}` : displayName} ({m.raza || "Macho Semental"})
                    </option>
                  );
                })}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                Código de Pajilla / Lote de Semen
              </label>
              <Input
                placeholder="Ej: PAJ-DUROC-99"
                value={serviceForm.codigo_pajilla_macho}
                onChange={(e) =>
                  setServiceForm({
                    ...serviceForm,
                    codigo_pajilla_macho: e.target.value,
                  })
                }
              />
            </div>
          )}

          {/* Cálculo previo de fecha estimada de parto */}
          <div className="p-3.5 bg-fuchsia-50 rounded-2xl border border-fuchsia-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-fuchsia-800 uppercase tracking-wider block">
                Parto Probable Estimado (+114 días)
              </span>
              <span className="text-sm font-black text-fuchsia-950">
                {estimatedFarrowingDate || "Pendiente de fecha"}
              </span>
            </div>
            <Clock className="w-5 h-5 text-fuchsia-600" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
              Diagnóstico Inicial
            </label>
            <select
              value={serviceForm.estado_confirmacion}
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  estado_confirmacion: e.target.value,
                })
              }
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm cursor-pointer"
            >
              <option value="pendiente">Pendiente Diagnóstico</option>
              <option value="positiva">Gestante (Confirmada)</option>
              <option value="negativa">No Gestante (Vacía)</option>
            </select>
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
            className="flex-1 font-black bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl! shadow-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registrando..." : "Guardar Servicio"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
