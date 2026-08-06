"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  Baby,
  Activity,
  CalendarDays,
  Percent,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import ModuleHeader from "@/components/layout/ModuleHeader";
import reproductionStandards from "./data/reproductionStandards.json";

const initialRecords = [
  {
    id: "1",
    hembra: "H-001",
    fecha: "2026-01-15",
    tipo: "Inseminación",
    machoSemen: "S-101",
    leonesVivos: "",
    observaciones: "Inseminación exitosa",
    fechaEstParto: "2026-05-09",
    estado: "Gestante",
    diasGestacion: 108,
  },
  {
    id: "2",
    hembra: "H-045",
    fecha: "2026-02-02",
    tipo: "Monta Natural",
    machoSemen: "M-05",
    leonesVivos: "",
    observaciones: "Monta con semental Duroc",
    fechaEstParto: "2026-05-27",
    estado: "Gestante",
    diasGestacion: 90,
  },
  {
    id: "3",
    hembra: "H-112",
    fecha: "2026-04-10",
    tipo: "Inseminación",
    machoSemen: "S-102",
    leonesVivos: "",
    observaciones: "",
    fechaEstParto: "2026-08-02",
    estado: "Servida",
    diasGestacion: 15,
  },
];

const ReproductionView = () => {
  const [records, setRecords] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    hembra: "",
    tipo: "Monta Natural",
    fecha: new Date().toISOString().split("T")[0],
    machoSemen: "",
    leonesVivos: "",
    observaciones: "",
    edadDias: "",
  });

  const [estimadoParto, setEstimadoParto] = useState("");
  const [alertaMadurez, setAlertaMadurez] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("sip_reproduction_records");
    if (stored) {
      setRecords(JSON.parse(stored));
    } else {
      setRecords(initialRecords);
      localStorage.setItem(
        "sip_reproduction_records",
        JSON.stringify(initialRecords)
      );
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("sip_reproduction_records", JSON.stringify(records));
    }
  }, [records, isMounted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    const isServicio =
      name === "tipo"
        ? value === "Monta Natural" || value === "Inseminación"
        : form.tipo === "Monta Natural" || form.tipo === "Inseminación";

    if (isServicio && (name === "fecha" || name === "tipo")) {
      const currentFecha = name === "fecha" ? value : form.fecha;
      if (currentFecha) {
        const fechaObj = new Date(currentFecha);
        const diasPromedio =
          reproductionStandards.reproduccion_porcina_colombia
            .parametros_gestacion.duracion_promedio_dias;
        fechaObj.setUTCDate(fechaObj.getUTCDate() + diasPromedio);
        setEstimadoParto(fechaObj.toISOString().split("T")[0]);
      } else {
        setEstimadoParto("");
      }
    } else if (name === "tipo" && !isServicio) {
      setEstimadoParto("");
    }

    if (name === "edadDias") {
      const minEdad =
        reproductionStandards.reproduccion_porcina_colombia
          .reemplazos_primerizas.edad_primer_servicio_dias.minimo;
      if (value && parseInt(value) < minEdad) {
        setAlertaMadurez(
          `⚠️ Alerta: Hembra por debajo de los ${minEdad} días reglamentarios`
        );
      } else {
        setAlertaMadurez("");
      }
    }
  };

  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!form.hembra.trim()) {
      toast.error("El código de la cerda es obligatorio");
      return;
    }

    let estado = "Registrado";
    let diasGestacion = null;
    let fechaPartoFinal = null;

    if (form.tipo === "Monta Natural" || form.tipo === "Inseminación") {
      estado = "Gestante";
      diasGestacion = 0;
      fechaPartoFinal = estimadoParto;
    } else if (form.tipo === "Parto") {
      estado = "Lactante";
    } else if (form.tipo === "Destete") {
      estado = "Servicio (Vacía)";
    }

    const newRecord = {
      id: Date.now().toString(),
      hembra: form.hembra.trim(),
      fecha: form.fecha,
      tipo: form.tipo,
      machoSemen: form.machoSemen,
      leonesVivos: form.leonesVivos,
      observaciones: form.observaciones,
      fechaEstParto: fechaPartoFinal,
      estado,
      diasGestacion,
    };

    setRecords([newRecord, ...records]);
    toast.success("Registro de reproducción guardado correctamente");
    setIsModalOpen(false);
    setForm({
      hembra: "",
      tipo: "Monta Natural",
      fecha: new Date().toISOString().split("T")[0],
      machoSemen: "",
      leonesVivos: "",
      observaciones: "",
      edadDias: "",
    });
    setEstimadoParto("");
    setAlertaMadurez("");
  };

  const getBadgeStyle = (estado) => {
    switch (estado) {
      case "Gestante":
        return "bg-fuchsia-100 text-fuchsia-700";
      case "Lactante":
        return "bg-emerald-100 text-emerald-700";
      case "Descarte":
        return "bg-rose-100 text-rose-700";
      case "Servida":
        return "bg-blue-100 text-blue-700";
      case "Servicio (Vacía)":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const renderProgressBar = (dias) => {
    if (dias === null || dias === undefined) return null;
    const total =
      reproductionStandards.reproduccion_porcina_colombia.parametros_gestacion
        .duracion_promedio_dias;
    const alertaWindow =
      reproductionStandards.reproduccion_porcina_colombia.parametros_gestacion
        .ventana_alerta_maternidad_dias;
    const progress = Math.min(Math.round((dias / total) * 100), 100);

    const isAlert = dias >= total - alertaWindow;
    const colorClass = isAlert
      ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
      : "bg-fuchsia-500";

    return (
      <div className="w-full max-w-30 mt-2">
        <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
          <span>{dias}d</span>
          <span>{total}d</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full ${colorClass} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const columns = [
    { key: "hembra", header: "ID Hembra" },
    { key: "fecha", header: "Fecha" },
    { key: "tipo", header: "Tipo" },
    {
      key: "machoSemen",
      header: "Macho/Semen",
      render: (row) => row.machoSemen || "-",
    },
    {
      key: "leonesVivos",
      header: "Lechones Vivos",
      render: (row) => row.leonesVivos || "-",
    },
    {
      key: "fechaEstParto",
      header: "Fecha Est. Parto",
      render: (row) => row.fechaEstParto || "-",
    },
    {
      key: "estado",
      header: "Estado Resultante",
      render: (row) => (
        <div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeStyle(
              row.estado
            )}`}
          >
            {row.estado}
          </span>
          {row.estado === "Gestante" && renderProgressBar(row.diasGestacion)}
        </div>
      ),
    },
  ];

  // Cálculos para stats
  const hembrasGestacion = records.filter(
    (r) => r.estado === "Gestante"
  ).length;
  const proximosPartos = records.filter((r) => {
    if (r.estado !== "Gestante" || !r.fechaEstParto) return false;
    const diff =
      (new Date(r.fechaEstParto) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;
  const lechonesNacidos = records
    .filter((r) => r.tipo === "Parto" && r.leonesVivos)
    .reduce((acc, r) => acc + parseInt(r.leonesVivos || 0), 0);

  const dynamicSummaryStats = [
    {
      title: "Hembras en Gestación",
      value: hembrasGestacion.toString(),
      icon: Activity,
      tone: "text-fuchsia-500",
      bg: "bg-fuchsia-100",
    },
    {
      title: "Próximos Partos (7d)",
      value: proximosPartos.toString(),
      icon: CalendarDays,
      tone: "text-pink-500",
      bg: "bg-pink-100",
    },
    {
      title: "Lechones Vivos Totales",
      value: lechonesNacidos.toString(),
      icon: Baby,
      tone: "text-purple-500",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="REPRODUCCIÓN Y PARTOS"
        title="Gestión Reproductiva"
        description="Seguimiento a ciclos, inseminaciones, gestaciones y partos."
        actions={
          <Button
            onClick={() => setIsModalOpen(true)}
            tone="primary"
            className="flex items-center justify-center gap-2 font-bold rounded-xl!"
          >
            <Plus size={20} />
            Nuevo Registro Reproductivo
          </Button>
        }
      />

      {/* Resumen de Ciclo */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-slate-800">Resumen de Ciclo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dynamicSummaryStats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <Card
                key={idx}
                className="rounded-4xl! flex items-center gap-5 hover:shadow-md hover:shadow-slate-200/50 transition-shadow cursor-default border border-slate-100 shadow-sm bg-white"
              >
                <div className={`p-4 rounded-2xl ${stat.bg}`}>
                  <IconComponent className={`w-8 h-8 ${stat.tone}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-4xl font-black text-slate-900">
                    {stat.value}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Tabla de Eventos Reproductivos */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-slate-800">
          Eventos Reproductivos Recientes
        </h3>
        <div className="bg-white rounded-4xl! shadow-sm overflow-hidden p-2 border border-slate-100">
          <Table columns={columns} rows={records} />
        </div>
      </section>

      {/* Modal Nuevo Registro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <Card
            as="form"
            onSubmit={handleAddRecord}
            className="w-full max-w-lg p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-2xl font-black mb-6 text-slate-900 flex items-center gap-2">
              <Heart className="text-fuchsia-500 w-6 h-6" />
              Nuevo Registro Reproductivo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Código Cerda"
                name="hembra"
                placeholder="Ej: H-045"
                value={form.hembra}
                onChange={handleChange}
                required
              />

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Tipo de Registro</label>
                <div className="relative">
                  <select
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="Monta Natural">Monta Natural</option>
                    <option value="Inseminación">Inseminación</option>
                    <option value="Parto">Parto</option>
                    <option value="Destete">Destete</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              <Input
                label="Fecha"
                name="fecha"
                type="date"
                value={form.fecha}
                onChange={handleChange}
                required
              />

              {(form.tipo === "Monta Natural" || form.tipo === "Inseminación") && (
                <>
                  <Input
                    label="Macho / Lote de Semen"
                    name="machoSemen"
                    placeholder="Ej: M-05 o S-101"
                    value={form.machoSemen}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Edad (Días) - Solo Primerizas"
                    name="edadDias"
                    type="number"
                    placeholder="Ej: 220"
                    value={form.edadDias}
                    onChange={handleChange}
                  />
                </>
              )}

              {form.tipo === "Parto" && (
                <Input
                  label="Lechones Vivos"
                  name="leonesVivos"
                  type="number"
                  placeholder="Ej: 12"
                  value={form.leonesVivos}
                  onChange={handleChange}
                  required
                />
              )}
            </div>

            {alertaMadurez && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                {alertaMadurez}
              </div>
            )}

            {(form.tipo === "Monta Natural" || form.tipo === "Inseminación") && (
              <div className="mt-4">
                <Input
                  label="Fecha Est. de Parto (+114 días)"
                  value={estimadoParto}
                  placeholder="Calculada automáticamente..."
                  readOnly
                  className="bg-slate-50 opacity-80 cursor-not-allowed text-slate-500"
                />
              </div>
            )}

            <div className="mt-4">
              <Input
                label="Observaciones (Opcional)"
                name="observaciones"
                placeholder="Notas adicionales..."
                value={form.observaciones}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                tone="soft"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 font-bold rounded-xl!"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 font-black bg-fuchsia-500 hover:bg-fuchsia-600 text-white border-none shadow-md shadow-fuchsia-500/30 rounded-xl!"
              >
                Guardar Registro
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReproductionView;
