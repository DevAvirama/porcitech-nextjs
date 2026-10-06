"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Warehouse,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  createCorral,
  updateCorral,
  deleteCorral,
  getCorrales,
} from "@/services/corralService";

const FASE_CONFIG = {
  maternidad: {
    label: "Maternidad",
    className: "bg-pink-50 text-pink-700 border-pink-200",
  },
  precebo: {
    label: "Precebo",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  levante: {
    label: "Levante",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ceba: {
    label: "Ceba / Engorde",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  gestacion: {
    label: "Gestación",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  cuarentena: {
    label: "Cuarentena",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export default function ManageCorralsModal({
  isOpen,
  onClose,
  corrales = [],
  animals = [],
  onCorralesUpdated,
}) {
  const [corralList, setCorralList] = useState(corrales);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form mode: null | 'create' | 'edit'
  const [formMode, setFormMode] = useState(null);
  const [selectedCorral, setSelectedCorral] = useState(null);

  const [formData, setFormData] = useState({
    codigo: "",
    fase: "levante",
    capacidad_maxima: 20,
    descripcion: "",
    activo: true,
  });

  // Sincronizar corrales cuando se abra el modal
  React.useEffect(() => {
    setCorralList(corrales);
  }, [corrales]);

  if (!isOpen) return null;

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const data = await getCorrales(false); // traer activos e inactivos
      setCorralList(data || []);
      if (onCorralesUpdated) onCorralesUpdated(data);
    } catch (err) {
      toast.error(err.message || "Error al recargar corrales");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedCorral(null);
    setFormData({
      codigo: "",
      fase: "levante",
      capacidad_maxima: 25,
      descripcion: "",
      activo: true,
    });
    setFormMode("create");
  };

  const handleOpenEdit = (c) => {
    setSelectedCorral(c);
    setFormData({
      codigo: c.codigo || "",
      fase: c.fase || "levante",
      capacidad_maxima: c.capacidad_maxima || 20,
      descripcion: c.descripcion || "",
      activo: c.activo !== false,
    });
    setFormMode("edit");
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.codigo.trim()) {
      toast.error("El código del corral es obligatorio.");
      return;
    }
    if (!formData.capacidad_maxima || Number(formData.capacidad_maxima) <= 0) {
      toast.error("La capacidad máxima debe ser mayor a 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        codigo: formData.codigo.trim().toUpperCase(),
        fase: formData.fase,
        capacidad_maxima: Number(formData.capacidad_maxima),
        descripcion: formData.descripcion.trim() || null,
        activo: formData.activo,
      };

      if (formMode === "create") {
        await createCorral(payload);
        toast.success(`Corral "${payload.codigo}" registrado exitosamente.`);
      } else if (formMode === "edit" && selectedCorral) {
        await updateCorral(selectedCorral.id, payload);
        toast.success(`Corral "${payload.codigo}" actualizado correctamente.`);
      }

      setFormMode(null);
      await refreshList();
    } catch (err) {
      console.error("Error al guardar corral:", err);
      toast.error(err.message || "Error al procesar la solicitud de corral.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (c) => {
    const ocupacion = animals.filter(
      (a) => (a.corral_id === c.id || a.corral?.id === c.id) && a.activo !== false
    ).length;

    if (ocupacion > 0) {
      toast.error(
        `No se puede eliminar el corral ${c.codigo} porque tiene ${ocupacion} cerdo(s) asignado(s). Trasládelos primero.`
      );
      return;
    }

    const confirmed = window.confirm(
      `¿Desea dar de baja / inactivar el corral "${c.codigo}"?`
    );
    if (!confirmed) return;

    try {
      await deleteCorral(c.id);
      toast.success(`Corral "${c.codigo}" eliminado lógicamente.`);
      await refreshList();
    } catch (err) {
      toast.error(err.message || "Error al inactivar el corral.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white my-8 max-h-[90vh] flex flex-col">
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
        >
          <X size={18} />
        </button>

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 pr-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Warehouse className="text-emerald-600 w-7 h-7" />
              Gestión y Mantenimiento de Corrales
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
              Administración de naves, capacidad instalada y fases productivas
            </p>
          </div>

          {!formMode && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                tone="soft"
                onClick={refreshList}
                disabled={isLoading}
                className="py-2.5 px-3.5 text-xs rounded-xl! font-bold flex items-center gap-1.5"
                title="Recargar corrales"
              >
                <RefreshCw
                  size={14}
                  className={isLoading ? "animate-spin text-emerald-600" : ""}
                />
                Refrescar
              </Button>
              <Button
                type="button"
                tone="primary"
                onClick={handleOpenCreate}
                className="py-2.5 px-4 text-xs rounded-xl! font-black flex items-center gap-1.5 shadow-md"
              >
                <Plus size={16} />
                + Nuevo Corral
              </Button>
            </div>
          )}
        </div>

        {/* CONTENIDO: Formulario o Tabla */}
        <div className="overflow-y-auto flex-1 mt-6">
          {formMode ? (
            /* SUB-FORMULARIO CREAR / EDITAR */
            <form onSubmit={handleSubmitForm} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  {formMode === "create" ? "Registrar Nuevo Corral" : `Editar Corral: ${selectedCorral?.codigo}`}
                </h3>
                <button
                  type="button"
                  onClick={() => setFormMode(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                >
                  ← Volver a la lista
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Código Identificador (Ej: CORRAL-10)"
                  placeholder="CORRAL-10"
                  value={formData.codigo}
                  onChange={(e) =>
                    setFormData({ ...formData, codigo: e.target.value.toUpperCase() })
                  }
                  required
                />

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Fase Productiva *
                  </label>
                  <select
                    value={formData.fase}
                    onChange={(e) =>
                      setFormData({ ...formData, fase: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 font-semibold outline-none text-sm cursor-pointer"
                  >
                    <option value="maternidad">Maternidad</option>
                    <option value="precebo">Precebo</option>
                    <option value="levante">Levante</option>
                    <option value="ceba">Ceba / Engorde</option>
                    <option value="gestacion">Gestación</option>
                    <option value="cuarentena">Cuarentena</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Capacidad Máxima de Cerdos"
                  type="number"
                  min="1"
                  max="500"
                  value={formData.capacidad_maxima}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacidad_maxima: e.target.value,
                    })
                  }
                  required
                />

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Estado Operativo
                  </label>
                  <select
                    value={formData.activo ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        activo: e.target.value === "true",
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 font-semibold outline-none text-sm cursor-pointer"
                  >
                    <option value="true">Activo (En operación)</option>
                    <option value="false">Cerrado / Inactivo</option>
                  </select>
                </div>
              </div>

              <Input
                label="Descripción / Ubicación (Opcional)"
                placeholder="Ej: Galpón Norte - Módulo 2"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  tone="soft"
                  onClick={() => setFormMode(null)}
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
                  {formMode === "create" ? "Guardar Corral" : "Actualizar Corral"}
                </Button>
              </div>
            </form>
          ) : (
            /* TABLA DE CORRALES */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="px-5 py-2">Código</th>
                    <th className="px-5 py-2">Fase</th>
                    <th className="px-5 py-2">Ocupación Actual</th>
                    <th className="px-5 py-2 text-center">Estado</th>
                    <th className="px-5 py-2 text-right pr-6">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {corralList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                        No hay corrales registrados en la base de datos.
                      </td>
                    </tr>
                  ) : (
                    corralList.map((c) => {
                      const ocupacion = animals.filter(
                        (a) =>
                          (a.corral_id === c.id || a.corral?.id === c.id) &&
                          a.activo !== false
                      ).length;
                      const capMax = c.capacidad_maxima || 1;
                      const pct = Math.min(Math.round((ocupacion / capMax) * 100), 100);
                      const faseConf =
                        FASE_CONFIG[c.fase?.toLowerCase()] || {
                          label: c.fase || "General",
                          className: "bg-slate-100 text-slate-700 border-slate-200",
                        };

                      return (
                        <tr
                          key={c.id}
                          className="bg-slate-50/70 hover:bg-slate-100/80 transition-all rounded-2xl border border-slate-100"
                        >
                          <td className="px-5 py-3.5 rounded-l-2xl font-black text-slate-900 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-emerald-800 font-black">
                                {c.codigo}
                              </span>
                              {c.descripcion && (
                                <span className="text-xs text-slate-400 font-normal truncate max-w-[150px]">
                                  ({c.descripcion})
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${faseConf.className}`}
                            >
                              {faseConf.label}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex flex-col gap-1 w-32">
                              <div className="flex justify-between text-xs font-bold text-slate-700">
                                <span>{ocupacion} / {c.capacidad_maxima}</span>
                                <span className="text-slate-400 font-normal">{pct}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    pct >= 100
                                      ? "bg-rose-500"
                                      : pct >= 80
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5 text-center">
                            {c.activo !== false ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 size={12} />
                                Activo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                <AlertCircle size={12} />
                                Cerrado
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 rounded-r-2xl text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(c)}
                                className="p-2 rounded-lg bg-white hover:bg-slate-200 text-slate-700 transition-colors shadow-xs cursor-pointer"
                                title="Editar corral"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(c)}
                                className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors shadow-xs cursor-pointer"
                                title="Inactivar corral"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
