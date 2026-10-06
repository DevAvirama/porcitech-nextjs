"use client";

import React, { useState, useEffect } from "react";
import { X, Syringe, Pill, Activity, ShieldAlert, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getAnimales } from "@/services/animalService";
import { getItems } from "@/services/inventoryService";
import { getCorrales } from "@/services/corralService";
import { createTreatment } from "@/services/healthService";

const VIAS_ADMINISTRACION = [
  "Subcutánea",
  "Intramuscular",
  "Oral",
  "Tópica",
  "Intrauterina",
];

const UNIDADES_DOSIS = ["ml", "cc", "mg", "g", "dosis", "comprimido"];

export default function AddHealthRecordModal({ isOpen, onClose, onSaved }) {
  const [eventType, setEventType] = useState("tratamiento");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Catálogos cargados de la API
  const [animals, setAnimals] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [corrales, setCorrales] = useState([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);

  // Formulario
  const [form, setForm] = useState({
    animal_id: "",
    corral_id: "",
    medicamento_id: "",
    producto_nombre: "",
    diagnostico: "",
    dosis: "",
    unidad_dosis: "ml",
    via_administracion: "Intramuscular",
    tiempo_retiro_dias: "0",
    fecha_proxima_dosis: "",
    observaciones: "",
  });

  // Cargar animales, medicamentos y corrales cuando se abre el modal
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadCatalogs() {
      setLoadingCatalogs(true);
      try {
        const [animalsData, medicinesData, corralesData] = await Promise.all([
          getAnimales({ estado: "activo" }).catch(() => []),
          getItems({ search: "" }).catch(() => []),
          getCorrales(true).catch(() => []),
        ]);

        if (isMounted) {
          setAnimals(Array.isArray(animalsData) ? animalsData : []);
          // Filtrar items que sean medicamentos o biológicos si es posible, o todos
          const allItems = Array.isArray(medicinesData) ? medicinesData : [];
          const medItems = allItems.filter(
            (i) =>
              i.categoria_codigo === "medicamento" ||
              i.categoria_codigo === "bioseguridad" ||
              i.categoria_codigo === "suplemento"
          );
          setMedicines(medItems.length > 0 ? medItems : allItems);
          setCorrales(Array.isArray(corralesData) ? corralesData : []);
        }
      } catch (err) {
        console.error("Error al cargar catálogos en modal sanitario:", err);
      } finally {
        if (isMounted) setLoadingCatalogs(false);
      }
    }

    loadCatalogs();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Manejo de cambio de animal: auto-asignar corral del animal
  const handleAnimalChange = (e) => {
    const selectedId = e.target.value;
    const selectedAnimal = animals.find((a) => a.id === selectedId);

    setForm((prev) => ({
      ...prev,
      animal_id: selectedId,
      corral_id: selectedAnimal?.corral_id || prev.corral_id,
    }));
  };

  // Manejo de selección de medicamento del inventario: auto-asignar nombre
  const handleMedicineChange = (e) => {
    const selectedId = e.target.value;
    const selectedMed = medicines.find((m) => m.id === selectedId);

    setForm((prev) => ({
      ...prev,
      medicamento_id: selectedId,
      producto_nombre: selectedMed ? selectedMed.nombre : prev.producto_nombre,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.animal_id) {
      toast.error("Seleccione un animal para el tratamiento");
      return;
    }
    if (!form.producto_nombre.trim()) {
      toast.error("El nombre del producto es obligatorio");
      return;
    }
    if (!form.diagnostico.trim()) {
      toast.error("El diagnóstico o motivo es obligatorio");
      return;
    }

    const dosisNum = parseFloat(form.dosis);
    if (isNaN(dosisNum) || dosisNum <= 0) {
      toast.error("La dosis debe ser un número mayor a cero");
      return;
    }

    const retiroNum = parseInt(form.tiempo_retiro_dias, 10);
    if (isNaN(retiroNum) || retiroNum < 0) {
      toast.error("El tiempo de retiro en días debe ser 0 o superior");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        animal_id: form.animal_id,
        tipo_evento: eventType,
        producto_nombre: form.producto_nombre.trim(),
        diagnostico: form.diagnostico.trim(),
        dosis: dosisNum,
        unidad_dosis: form.unidad_dosis,
        via_administracion: form.via_administracion,
        tiempo_retiro_dias: retiroNum,
        observaciones: form.observaciones.trim() || undefined,
      };

      if (form.corral_id) payload.corral_id = form.corral_id;
      if (form.medicamento_id) payload.medicamento_id = form.medicamento_id;
      if (form.fecha_proxima_dosis) {
        payload.fecha_proxima_dosis = form.fecha_proxima_dosis;
      }

      await createTreatment(payload);
      toast.success("Registro sanitario guardado exitosamente");
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error("Error al crear tratamiento sanitario:", err);
      toast.error(err.message || "Fallo al registrar el evento clínico");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans text-slate-900">
      <Card
        as="form"
        onSubmit={handleSubmit}
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto p-8! rounded-[2.5rem]! shadow-2xl relative bg-white border-none"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors z-10 cursor-pointer"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
              Registro de Evento Sanitario
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Procedimiento Clínico en PostgreSQL
            </p>
          </div>
        </div>

        {/* Switch de Tipo de Evento */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl my-6 w-fit gap-1">
          <button
            type="button"
            onClick={() => setEventType("tratamiento")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              eventType === "tratamiento"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Pill size={16} /> Tratamiento Curativo
          </button>
          <button
            type="button"
            onClick={() => setEventType("vacuna")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              eventType === "vacuna"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Syringe size={16} /> Vacunación
          </button>
          <button
            type="button"
            onClick={() => setEventType("desparasitacion")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              eventType === "desparasitacion"
                ? "bg-white text-amber-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldAlert size={16} /> Desparasitación
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          {/* Selector de Animal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Animal Destino *
            </label>
            <div className="relative">
              <select
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-slate-900 appearance-none cursor-pointer pr-10 text-sm"
                required
                value={form.animal_id}
                onChange={handleAnimalChange}
                disabled={loadingCatalogs}
              >
                <option value="">
                  {loadingCatalogs ? "Cargando cerdos..." : "Seleccione cerdo..."}
                </option>
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.codigo_arete} - {a.nombre_alias || "Sin alias"} ({a.raza || "Porcino"})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Selector de Corral */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Corral / Ubicación
            </label>
            <div className="relative">
              <select
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-slate-900 appearance-none cursor-pointer pr-10 text-sm"
                value={form.corral_id}
                onChange={(e) => setForm({ ...form, corral_id: e.target.value })}
                disabled={loadingCatalogs}
              >
                <option value="">Sin corral asignado</option>
                {corrales.map((c) => (
                  <option key={c.id} value={c.id}>
                    Corral {c.codigo} ({c.fase})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Insumo del Inventario (Vinculación automática) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Insumo de Bodega (Descuenta Stock)
            </label>
            <div className="relative">
              <select
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-slate-900 appearance-none cursor-pointer pr-10 text-sm"
                value={form.medicamento_id}
                onChange={handleMedicineChange}
                disabled={loadingCatalogs}
              >
                <option value="">Selección manual / Externo</option>
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.codigo_sku}] {m.nombre} (Stock: {m.stock_actual} {m.unidad_medida})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Nombre Comercial del Producto */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre del Producto *
            </label>
            <Input
              required
              placeholder="Ej: Ivermectina 1%, Parvo-Shield L5"
              value={form.producto_nombre}
              onChange={(e) => setForm({ ...form, producto_nombre: e.target.value })}
            />
          </div>

          {/* Diagnóstico o Motivo */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Diagnóstico / Justificación Clínica *
            </label>
            <Input
              required
              placeholder="Ej: Control parasitario preventivo / Tratamiento respiratorio"
              value={form.diagnostico}
              onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
            />
          </div>

          {/* Dosis y Unidad */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Dosis Administrada *
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="2.5"
                value={form.dosis}
                onChange={(e) => setForm({ ...form, dosis: e.target.value })}
                className="flex-1"
              />
              <select
                value={form.unidad_dosis}
                onChange={(e) => setForm({ ...form, unidad_dosis: e.target.value })}
                className="w-28 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold cursor-pointer"
              >
                {UNIDADES_DOSIS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vía de Administración */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Vía de Administración
            </label>
            <select
              value={form.via_administracion}
              onChange={(e) => setForm({ ...form, via_administracion: e.target.value })}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-slate-900 text-sm cursor-pointer"
            >
              {VIAS_ADMINISTRACION.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Tiempo de Retiro (Días) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Tiempo de Retiro (Días) *</span>
              <span className="text-[10px] text-amber-600 font-bold lowercase">
                Restricción faenado
              </span>
            </label>
            <Input
              type="number"
              min="0"
              required
              placeholder="0 para vacunas sin retiro, ej: 28 para antibiótico"
              value={form.tiempo_retiro_dias}
              onChange={(e) => setForm({ ...form, tiempo_retiro_dias: e.target.value })}
            />
          </div>

          {/* Fecha Próxima Dosis / Refuerzo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Próxima Dosis / Refuerzo (Opcional)
            </label>
            <Input
              type="date"
              value={form.fecha_proxima_dosis}
              onChange={(e) => setForm({ ...form, fecha_proxima_dosis: e.target.value })}
            />
          </div>

          {/* Observaciones */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Observaciones del Veterinario
            </label>
            <Input
              placeholder="Reacción del animal, temperatura corporal, condición general..."
              value={form.observaciones}
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button
            type="button"
            tone="soft"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 font-bold rounded-xl!"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            tone="primary"
            disabled={isSubmitting}
            className="flex-1 font-black rounded-xl! shadow-md"
          >
            {isSubmitting ? "Registrando..." : "Confirmar Evento Clínico"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
