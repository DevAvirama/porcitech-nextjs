"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { UUID_REGEX } from "@/utils/formatters";

export default function DiagnoseModal({
  service,
  onClose,
  onSubmit,
  isDiagnosing,
}) {
  const [diagnoseForm, setDiagnoseForm] = useState({
    estado_confirmacion: "positiva",
    fecha_diagnostico: new Date().toISOString().split("T")[0],
    observaciones: "",
  });

  if (!service) return null;

  const validArete =
    service.hembra_arete && !UUID_REGEX.test(service.hembra_arete)
      ? `#${service.hembra_arete}`
      : null;
  const hembraDisplay = validArete || service.hembra_alias || "Cerda Madre";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(service, diagnoseForm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
      <Card
        as="form"
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-xl font-black mb-1 text-slate-900 flex items-center gap-2">
          <div className="p-2 bg-fuchsia-100 rounded-xl text-fuchsia-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          Diagnóstico de Gestación
        </h2>
        <p className="text-xs text-slate-500 font-semibold mb-5">
          Confirmación clínica o ecográfica para la cerda{" "}
          <strong className="text-slate-900 font-black">
            {hembraDisplay}
          </strong>
          {service.hembra_alias && validArete
            ? ` ("${service.hembra_alias}")`
            : ""}
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
              Resultado del Diagnóstico *
            </label>
            <select
              value={diagnoseForm.estado_confirmacion}
              onChange={(e) =>
                setDiagnoseForm({
                  ...diagnoseForm,
                  estado_confirmacion: e.target.value,
                })
              }
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm cursor-pointer"
            >
              <option value="positiva">Positiva (Gestante - Pasa a Gestación)</option>
              <option value="negativa">No Gestante (Vacía)</option>
              <option value="repetida">Repetida (Repitió celo)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
              Fecha de Diagnóstico *
            </label>
            <input
              type="date"
              value={diagnoseForm.fecha_diagnostico}
              onChange={(e) =>
                setDiagnoseForm({
                  ...diagnoseForm,
                  fecha_diagnostico: e.target.value,
                })
              }
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
              Observaciones Clínicas (Opcional)
            </label>
            <textarea
              rows={2}
              value={diagnoseForm.observaciones}
              onChange={(e) =>
                setDiagnoseForm({
                  ...diagnoseForm,
                  observaciones: e.target.value,
                })
              }
              placeholder="Ej: Confirmada por ultrasonido a los 30 días..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            tone="soft"
            onClick={onClose}
            className="flex-1 rounded-xl! font-bold text-sm"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            tone="primary"
            isLoading={isDiagnosing}
            className="flex-1 rounded-xl! font-black text-sm bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
          >
            Confirmar Diagnóstico
          </Button>
        </div>
      </Card>
    </div>
  );
}
