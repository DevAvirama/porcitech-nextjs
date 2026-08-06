import React, { useState } from "react";
import { X, Syringe, Pill, ChevronDown } from "lucide-react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

const AddHealthRecordModal = ({ isOpen, onClose, onSave }) => {
  const veterinarios = [
    { id: 1, nombre: "Dr. Ricardo Gómez", identidad: "CC 1.098.765" },
    { id: 2, nombre: "Dra. Elena Martínez", identidad: "CC 1.122.334" },
    { id: 3, nombre: "Dr. Carlos Ruiz", identidad: "CC 1.050.440" },
    { id: 4, nombre: "Dra. Sofía Castro", identidad: "CC 1.088.221" },
    { id: 5, nombre: "Dr. Andrés Felipe", identidad: "CC 1.010.998" },
  ];

  const [eventType, setEventType] = useState("vacuna");
  const [form, setForm] = useState({
    id: "",
    lote: "",
    producto: "",
    dosis: "",
    via: "Subcutánea",
    responsable: "",
    fecha: new Date().toISOString().split("T")[0],
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Generar un ID único de registro
    const generatedId = `2026-${form.lote || "G1"}-${Math.floor(10 + Math.random() * 90)}`;
    onSave({ ...form, id: generatedId, type: eventType, estado: "PENDIENTE" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans text-slate-900">
      <Card
        as="form"
        onSubmit={handleSubmit}
        className="w-full max-w-2xl p-10! rounded-[2.5rem]! shadow-2xl relative bg-white border-none"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors z-10 cursor-pointer"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-black text-slate-900 italic mb-2 uppercase">
          Registro Único de Evento Sanitario
        </h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">
          Nuevo Procedimiento Clínico
        </p>

        {/* Switch de Tipo de Evento */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 w-fit">
          <button
            type="button"
            onClick={() => setEventType("vacuna")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all cursor-pointer ${eventType === "vacuna" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"}`}
          >
            <Syringe size={18} /> Vacuna
          </button>
          <button
            type="button"
            onClick={() => setEventType("tratamiento")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all cursor-pointer ${eventType === "tratamiento" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}
          >
            <Pill size={18} /> Tratamiento
          </button>
        </div>

        {/* FILA 1 Y 2: LOTE, PRODUCTO, DOSIS Y VÍA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 ml-2">
              Animal o Lote de Destino
            </label>
            <input
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-400 font-medium text-slate-905"
              placeholder="Ej: Lote #422"
              required
              onChange={(e) => setForm({ ...form, lote: e.target.value })}
            />

            <label className="block text-sm font-bold text-slate-700 ml-2">
              Nombre del Producto
            </label>
            <input
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-400 font-medium text-slate-905"
              placeholder="Ej: Parvo-Shield L5"
              required
              onChange={(e) => setForm({ ...form, producto: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 ml-2">
              Dosis (ml)
            </label>
            <input
              type="number"
              step="0.1"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-400 font-medium text-slate-905"
              placeholder="2.0"
              required
              onChange={(e) => setForm({ ...form, dosis: e.target.value })}
            />

            <label className="block text-sm font-bold text-slate-700 ml-2">
              Vía de Administración
            </label>
            <div className="flex gap-2">
              {["Subcutánea", "Oral", "Tópica"].map((via) => (
                <button
                  key={via}
                  type="button"
                  onClick={() => setForm({ ...form, via })}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${form.via === via ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-white border-slate-200 text-slate-400"}`}
                >
                  {via.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FILA 3: RESPONSABLE Y FECHA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-left">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 ml-2">
              Responsable (Veterinario)
            </label>
            <div className="relative">
              <select
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-400 font-bold text-slate-900 appearance-none cursor-pointer pr-12"
                required
                value={form.responsable}
                onChange={(e) =>
                  setForm({ ...form, responsable: e.target.value })
                }
              >
                <option value="">Seleccione...</option>
                {veterinarios.map((v) => (
                  <option key={v.id} value={v.nombre}>
                    {v.nombre}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={20} className="text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 ml-2">
              Fecha del Evento
            </label>
            <input
              type="date"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-400 font-bold text-slate-900"
              value={form.fecha}
              required
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <Button
            type="submit"
            className="w-full bg-[#00a34d] hover:bg-[#008c42] text-white py-5 rounded-2xl font-black italic shadow-xl shadow-emerald-900/10 border-none transition-all active:scale-95"
          >
            ✓ Confirmar Registro
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AddHealthRecordModal;
