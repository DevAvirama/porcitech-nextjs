"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Tag, Sparkles, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { createAnimal } from "@/services/animalService";
import { getCorrales } from "@/services/corralService";

const RAZAS_DISPONIBLES = [
  "Landrace",
  "Large White",
  "Duroc",
  "Pietrain",
  "Hampshire",
  "Cruce Industrial",
];

const FASES_ESTADOS = [
  { value: "activo", label: "Activo / En Producción" },
  { value: "precebo", label: "Precebo" },
  { value: "levante", label: "Levante" },
  { value: "engorde", label: "Engorde / Ceba" },
  { value: "maternidad", label: "Maternidad / Lactancia" },
  { value: "gestacion", label: "Gestación" },
  { value: "cuarentena", label: "Cuarentena / Observación" },
];

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

const getInitialFormState = () => ({
  codigo_arete: "",
  codigo_qr: "",
  nombre_alias: "",
  sexo: "hembra",
  estado_reproductivo: "Vacía",
  raza: "Landrace",
  fecha_nacimiento: new Date().toISOString().split("T")[0],
  estado: "activo",
  corral_id: "",
  peso_actual_kg: "",
});

const AddAnimalModal = ({
  isOpen,
  onClose,
  onSuccess,
  corrales: externalCorrales = [],
}) => {
  const [corralesList, setCorralesList] = useState(externalCorrales);
  const [isLoadingCorrales, setIsLoadingCorrales] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState(getInitialFormState);

  // Cargar corrales si no fueron provistos por props
  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setForm(getInitialFormState());

      if (externalCorrales.length > 0) {
        setCorralesList(externalCorrales);
      } else {
        setIsLoadingCorrales(true);
        getCorrales(true)
          .then((data) => setCorralesList(data || []))
          .catch((err) => {
            console.error("Error al cargar corrales:", err);
          })
          .finally(() => setIsLoadingCorrales(false));
      }
    }
  }, [isOpen, externalCorrales]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "sexo") {
        updated.estado_reproductivo =
          value === "macho" ? "No reproductor / Ceba" : "Vacía";
      }
      // Si se escribe el código de arete y el QR estaba vacío o sincronizado, autogenerar sugerencia
      if (name === "codigo_arete" && (!prev.codigo_qr || prev.codigo_qr.startsWith("QR-"))) {
        updated.codigo_qr = value.trim() ? `QR-${value.trim()}` : "";
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.codigo_arete.trim()) {
      setErrorMessage("El código de arete es obligatorio.");
      return;
    }

    if (!["macho", "hembra"].includes(form.sexo)) {
      setErrorMessage("El sexo debe ser 'macho' o 'hembra'.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        codigo_arete: form.codigo_arete.trim(),
        codigo_qr: form.codigo_qr.trim() || `QR-${form.codigo_arete.trim()}`,
        nombre_alias: form.nombre_alias.trim() || null,
        sexo: form.sexo,
        estado_reproductivo: form.estado_reproductivo,
        raza: form.raza,
        fecha_nacimiento: form.fecha_nacimiento,
        estado: form.estado,
        corral_id: form.corral_id && form.corral_id !== "" ? form.corral_id : null,
        tratamientos_aplicados: [],
        historial_medico: [],
      };

      if (form.peso_actual_kg !== "" && !isNaN(form.peso_actual_kg)) {
        payload.peso_actual_kg = parseFloat(form.peso_actual_kg);
      }

      const created = await createAnimal(payload);

      toast.success(
        `Animal #${created.codigo_arete || payload.codigo_arete} registrado exitosamente`,
      );
      if (onSuccess) {
        onSuccess(created);
      }
      onClose();
    } catch (err) {
      console.error("Error al registrar animal:", err);
      setErrorMessage(
        err.message || "Error al registrar el animal. Verifica los datos enviados.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="relative bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden text-slate-900 my-8">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Tag size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Registrar Nuevo Animal
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Ingreso al inventario hato con generación de pasaporte digital
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Alerta de Error */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700"
          >
            <AlertCircle size={18} className="shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Código de Arete */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Código de Arete *
              </label>
              <input
                name="codigo_arete"
                placeholder="Ej: PT-2026-001"
                required
                value={form.codigo_arete}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-900 font-bold"
              />
            </div>

            {/* Código QR */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Código QR (Opcional)
              </label>
              <input
                name="codigo_qr"
                placeholder="Autogenerado (Ej: QR-PT-2026-001)"
                value={form.codigo_qr}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-900 text-sm"
              />
            </div>
          </div>

          {/* Nombre o Alias */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre o Alias (Opcional)
            </label>
            <input
              name="nombre_alias"
              placeholder="Ej: Campeón, Lola"
              value={form.nombre_alias}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-900 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sexo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Sexo Biológico *
              </label>
              <select
                name="sexo"
                value={form.sexo}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-900 font-semibold cursor-pointer"
              >
                <option value="hembra">♀ Hembra</option>
                <option value="macho">♂ Macho</option>
              </select>
            </div>

            {/* Estado Reproductivo Condicional */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estado Reproductivo *
              </label>
              <select
                name="estado_reproductivo"
                value={form.estado_reproductivo}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-900 font-semibold cursor-pointer"
              >
                {(form.sexo === "macho"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Raza */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Raza *
              </label>
              <select
                name="raza"
                value={form.raza}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-900 font-semibold cursor-pointer"
              >
                {RAZAS_DISPONIBLES.map((raza) => (
                  <option key={raza} value={raza}>
                    {raza}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                name="fecha_nacimiento"
                required
                value={form.fecha_nacimiento}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-900 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Corral / Ubicación */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Corral / Ubicación
              </label>
              <select
                name="corral_id"
                value={form.corral_id}
                onChange={handleChange}
                disabled={isSubmitting || isLoadingCorrales}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-900 font-semibold cursor-pointer"
              >
                <option value="">-- Sin corral asignado --</option>
                {corralesList.map((corral) => (
                  <option key={corral.id} value={corral.id}>
                    {corral.codigo} - {corral.fase} (Cap: {corral.capacidad_maxima || "N/A"})
                  </option>
                ))}
              </select>
            </div>

            {/* Estado / Fase */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estado / Fase Inicial *
              </label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-900 font-semibold cursor-pointer"
              >
                {FASES_ESTADOS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Peso Inicial */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Peso Inicial en Kg (Opcional)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="peso_actual_kg"
              placeholder="Ej: 24.5"
              value={form.peso_actual_kg}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-900 text-sm"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-center"
            >
              Cancelar
            </button>

            <Button
              type="submit"
              tone="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-black shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? "Guardando..." : "Guardar en Base de Datos"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAnimalModal;
