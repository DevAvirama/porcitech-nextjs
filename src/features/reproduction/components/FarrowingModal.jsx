"use client";

import React, { useState } from "react";
import { Baby, AlertTriangle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getAnimalDisplayName, UUID_REGEX } from "@/utils/formatters";

export default function FarrowingModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  confirmedFemales,
  services,
  corrales,
}) {
  const [farrowingForm, setFarrowingForm] = useState({
    servicio_id: "",
    hembra_id: "",
    corral_maternidad_id: "",
    fecha_parto: new Date().toISOString().split("T")[0],
    nacidos_vivos: "",
    nacidos_muertos: "0",
    momias: "0",
    peso_camada_total_kg: "",
    observaciones: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(farrowingForm);
    if (success) {
      setFarrowingForm({
        servicio_id: "",
        hembra_id: "",
        corral_maternidad_id: "",
        fecha_parto: new Date().toISOString().split("T")[0],
        nacidos_vivos: "",
        nacidos_muertos: "0",
        momias: "0",
        peso_camada_total_kg: "",
        observaciones: "",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
      <Card
        as="form"
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-2xl font-black mb-1 text-slate-900 flex items-center gap-2">
          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
            <Baby className="w-5 h-5" />
          </div>
          Registrar Parto y Camada
        </h2>
        <p className="text-xs text-slate-500 font-semibold mb-6">
          Conteo biológico de lechones y pesaje inicial de camada en paridera
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
              Cerda Madre (Gestación Confirmada) *
            </label>
            {confirmedFemales.length > 0 ? (
              <select
                value={farrowingForm.hembra_id}
                onChange={(e) => {
                  const selId = e.target.value;
                  const matchingService = services.find(
                    (s) =>
                      (s.hembra_id === selId || s.id_cerda === selId) &&
                      s.estado_confirmacion === "positiva"
                  );
                  setFarrowingForm({
                    ...farrowingForm,
                    hembra_id: selId,
                    servicio_id: matchingService ? matchingService.id : "",
                  });
                }}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none text-sm cursor-pointer"
                required
              >
                <option value="">Seleccione madre con servicio confirmado...</option>
                {confirmedFemales.map((f) => {
                  const displayName = getAnimalDisplayName(f);
                  const validArete =
                    f.codigo_arete && !UUID_REGEX.test(f.codigo_arete)
                      ? `#${f.codigo_arete} · `
                      : "";
                  return (
                    <option key={f.id} value={f.id}>
                      {validArete ? `${validArete}${displayName}` : displayName} ({f.raza || "Cerda"}) - Gestación Confirmada
                    </option>
                  );
                })}
              </select>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <p className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Sin hembras con servicio confirmado positivo
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Para registrar un parto, la cerda debe contar previamente con un servicio registrado y diagnóstico de preñez confirmado como <strong>positiva</strong> (+114 días).
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                Corral Maternidad
              </label>
              <select
                value={farrowingForm.corral_maternidad_id}
                onChange={(e) =>
                  setFarrowingForm({
                    ...farrowingForm,
                    corral_maternidad_id: e.target.value,
                  })
                }
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none text-sm cursor-pointer"
              >
                <option value="">Seleccione paridera...</option>
                {corrales.map((c) => (
                  <option key={c.id} value={c.id}>
                    Corral {c.codigo} ({c.fase})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                Fecha de Parto *
              </label>
              <Input
                type="date"
                required
                value={farrowingForm.fecha_parto}
                onChange={(e) =>
                  setFarrowingForm({
                    ...farrowingForm,
                    fecha_parto: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                Nacidos Vivos *
              </label>
              <Input
                type="number"
                min="0"
                required
                placeholder="12"
                value={farrowingForm.nacidos_vivos}
                onChange={(e) =>
                  setFarrowingForm({
                    ...farrowingForm,
                    nacidos_vivos: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                Nacidos Muertos
              </label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={farrowingForm.nacidos_muertos}
                onChange={(e) =>
                  setFarrowingForm({
                    ...farrowingForm,
                    nacidos_muertos: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                Momias
              </label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={farrowingForm.momias}
                onChange={(e) =>
                  setFarrowingForm({
                    ...farrowingForm,
                    momias: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
              Peso Camada Total (kg) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.1"
              required
              placeholder="Ej: 16.80"
              value={farrowingForm.peso_camada_total_kg}
              onChange={(e) =>
                setFarrowingForm({
                  ...farrowingForm,
                  peso_camada_total_kg: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
              Observaciones del Alumbramiento
            </label>
            <Input
              placeholder="Ej: Parto normal sin asistencia, calostro consumido"
              value={farrowingForm.observaciones}
              onChange={(e) =>
                setFarrowingForm({
                  ...farrowingForm,
                  observaciones: e.target.value,
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
            className="flex-1 font-black rounded-xl! shadow-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registrando..." : "Guardar Parto"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
