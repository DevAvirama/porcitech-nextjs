"use client";

import React, { useState } from "react";
import {
  Heart,
  Baby,
  Activity,
  CalendarDays,
  Percent,
  AlertTriangle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Input from "../../components/ui/Input";
import reproductionStandards from "./data/reproductionStandards.json";

// Mock Data
const summaryStats = [
  {
    title: "Hembras en Gestación",
    value: "42",
    icon: Activity,
    tone: "text-fuchsia-500",
    bg: "bg-fuchsia-100",
  },
  {
    title: "Próximos Partos (7d)",
    value: "8",
    icon: CalendarDays,
    tone: "text-pink-500",
    bg: "bg-pink-100",
  },
  {
    title: "Tasa de Destete",
    value: "92%",
    icon: Percent,
    tone: "text-purple-500",
    bg: "bg-purple-100",
  },
];

const reproductionEvents = [
  {
    id: 1,
    hembra: "H-001",
    fechaServicio: "2026-01-15",
    tipo: "Inseminación",
    fechaParto: "2026-05-09",
    estado: "Gestante",
    diasGestacion: 108,
  },
  {
    id: 2,
    hembra: "H-045",
    fechaServicio: "2026-02-02",
    tipo: "Monta Natural",
    fechaParto: "2026-05-27",
    estado: "Gestante",
    diasGestacion: 90,
  },
  {
    id: 3,
    hembra: "H-112",
    fechaServicio: "2026-04-10",
    tipo: "Inseminación",
    fechaParto: "2026-08-02",
    estado: "Servida",
    diasGestacion: 15,
  },
  {
    id: 4,
    hembra: "H-089",
    fechaServicio: "2025-12-20",
    tipo: "Monta Natural",
    fechaParto: "2026-04-12",
    estado: "Lactante",
    diasGestacion: null,
  },
];

const ReproductionView = () => {
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    hembraId: "",
    fechaServicio: "",
    edadDias: "",
  });
  const [estimadoParto, setEstimadoParto] = useState("");
  const [alertaMadurez, setAlertaMadurez] = useState("");

  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...serviceForm, [name]: value };

    // Cálculo Automático de Parto
    if (name === "fechaServicio" && value) {
      const fecha = new Date(value);
      const diasPromedio =
        reproductionStandards.reproduccion_porcina_colombia.parametros_gestacion
          .duracion_promedio_dias;
      fecha.setUTCDate(fecha.getUTCDate() + diasPromedio);
      setEstimadoParto(fecha.toISOString().split("T")[0]);
    }

    // Validación de Madurez en Reemplazos
    if (name === "edadDias") {
      const minEdad =
        reproductionStandards.reproduccion_porcina_colombia
          .reemplazos_primerizas.edad_primer_servicio_dias.minimo;
      if (value && parseInt(value) < minEdad) {
        setAlertaMadurez(
          `⚠️ Alerta de Madurez: Hembra por debajo de los ${minEdad} días reglamentarios`,
        );
      } else {
        setAlertaMadurez("");
      }
    }

    setServiceForm(newForm);
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
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const renderProgressBar = (dias) => {
    if (!dias) return null;
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
    { key: "fechaServicio", header: "Fecha de Servicio" },
    { key: "tipo", header: "Tipo" },
    { key: "fechaParto", header: "Fecha Est. de Parto" },
    {
      key: "estado",
      header: "Estado",
      render: (row) => (
        <div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeStyle(row.estado)}`}
          >
            {row.estado}
          </span>
          {row.estado === "Gestante" && renderProgressBar(row.diasGestacion)}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-400 mx-auto pb-10">
      {/* Cabecera y Acciones Principales */}
      <Card
        as="header"
        className="flex flex-col gap-6 rounded-4xl! lg:flex-row lg:items-center lg:justify-between border-t-4 border-sena-green"
      >
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Heart className="text-sena-green w-8 h-8" />
            Control de Reproducción
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            Gestión del ciclo reproductivo, servicios y partos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex items-center justify-center gap-2 bg-sena-green hover:bg-[#2c8300] hover:-translate-y-1 hover:shadow-xl text-white border-none shadow-md shadow-sena-green/30 transition-all duration-200 cursor-pointer">
            <Baby size={20} />
            Registrar Parto
          </Button>

          <Button
            onClick={() => setIsServiceModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-sena-green hover:bg-[#2c8300] hover:-translate-y-1 hover:shadow-xl text-white border-none shadow-md shadow-sena-green/30 transition-all duration-200 cursor-pointer"
          >
            <Heart size={20} />
            Registrar Servicio
          </Button>
        </div>
      </Card>

      {/* Resumen de Ciclo */}
      <section>
        <h3 className="text-xl font-bold mb-6 text-slate-800">
          Resumen de Ciclo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {summaryStats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <Card
                key={idx}
                className="rounded-4xl! flex items-center gap-5 hover:shadow-md hover:shadow-slate-200/50 transition-shadow cursor-default"
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
      <section>
        <h3 className="text-xl font-bold mb-6 text-slate-800">
          Eventos Reproductivos Recientes
        </h3>
        <div className="bg-white rounded-4xl! shadow-sm overflow-hidden p-2">
          <Table columns={columns} rows={reproductionEvents} />
        </div>
      </section>

      {/* Modal Registrar Servicio */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <Card
            as="form"
            className="w-full max-w-md p-8! rounded-4xl! shadow-2xl relative border border-slate-100 bg-white"
          >
            <button
              type="button"
              onClick={() => setIsServiceModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-105 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              X
            </button>
            <h2 className="text-2xl font-black mb-6 text-slate-900 flex items-center gap-2">
              <Heart className="text-fuchsia-500 w-6 h-6" />
              Nuevo Servicio
            </h2>

            <div className="space-y-4">
              <Input
                label="ID Hembra"
                name="hembraId"
                placeholder="Ej: H-045"
                value={serviceForm.hembraId}
                onChange={handleServiceFormChange}
                required
              />

              <Input
                label="Edad de la Hembra (Días) - Solo Primerizas"
                name="edadDias"
                type="number"
                placeholder="Ej: 220"
                value={serviceForm.edadDias}
                onChange={handleServiceFormChange}
              />

              {alertaMadurez && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  {alertaMadurez}
                </div>
              )}

              <Input
                label="Fecha de Servicio"
                name="fechaServicio"
                type="date"
                value={serviceForm.fechaServicio}
                onChange={handleServiceFormChange}
                required
              />

              <Input
                label="Fecha Est. de Parto (+114 días)"
                value={estimadoParto}
                placeholder="Calculada automáticamente..."
                readOnly
                className="bg-slate-50 opacity-80 cursor-not-allowed text-slate-500"
              />
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                tone="soft"
                onClick={() => setIsServiceModalOpen(false)}
                className="flex-1 font-bold"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  setIsServiceModalOpen(false);
                }}
                className="flex-1 font-black bg-fuchsia-500 hover:bg-fuchsia-600 text-white border-none shadow-md shadow-fuchsia-500/30"
              >
                Guardar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReproductionView;
