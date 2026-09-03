"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Scale,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Activity,
  Plus,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Calendar,
  History,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import ModuleHeader from "@/components/layout/ModuleHeader";
import weightStandards from "./data/weightStandards.json";
import Link from "next/link";

const initialBiometrics = [
  {
    id: "PT-2026-001",
    etapa: "ceba_finalizacion",
    semanas: 24,
    pesos: [
      { fecha: "2026-07-15", peso: 85 },
      { fecha: "2026-08-05", peso: 102 },
      { fecha: "2026-08-25", peso: 118 },
    ],
  },
  {
    id: "2024-001",
    etapa: "pre_ceba",
    semanas: 9,
    pesos: [
      { fecha: "2026-08-01", peso: 22 },
      { fecha: "2026-08-20", peso: 29.5 },
    ],
  },
  {
    id: "L-042",
    etapa: "levante",
    semanas: 16,
    pesos: [
      { fecha: "2026-07-20", peso: 42 },
      { fecha: "2026-08-15", peso: 56.5 },
    ],
  },
  {
    id: "C-089",
    etapa: "levante",
    semanas: 15,
    pesos: [
      { fecha: "2026-07-25", peso: 36 },
      { fecha: "2026-08-20", peso: 44 }, // Rezagado vs estándar de 52kg
    ],
  },
  {
    id: "P-112",
    etapa: "ceba_finalizacion",
    semanas: 25,
    pesos: [
      { fecha: "2026-08-01", peso: 108 },
      { fecha: "2026-08-26", peso: 124 },
    ],
  },
  {
    id: "2024-042",
    etapa: "pre_ceba",
    semanas: 8,
    pesos: [
      { fecha: "2026-08-10", peso: 18 },
      { fecha: "2026-08-28", peso: 21 }, // Rezagado
    ],
  },
];

// Cálculo de peso esperado según tabla oficial de Porkcolombia
const getExpectedWeight = (semanas, etapa) => {
  if (semanas <= 4) return 7.5;
  if (semanas <= 10) return 24 + ((semanas - 4) / 6) * 6; // ~30kg en sem 10
  if (semanas <= 16) return 30 + ((semanas - 10) / 6) * 28; // ~58kg en sem 16
  if (semanas <= 25) return 58 + ((semanas - 16) / 9) * 62; // ~120kg en sem 25
  return 125;
};

const GrowthChart = ({ averagePoints }) => {
  const { puntos_grafica_edad_semanas, puntos_grafica_peso_kg } =
    weightStandards.configuracion_crecimiento_colombia
      .curva_crecimiento_referencia;
  const maxX = 26;
  const maxY = 130;

  const getX = (week) => (week / maxX) * 100;
  const getY = (weight) => 100 - (weight / maxY) * 100;

  const idealPoints = puntos_grafica_edad_semanas
    .map((week, idx) => `${getX(week)},${getY(puntos_grafica_peso_kg[idx])}`)
    .join(" ");

  const realPointsStr = averagePoints
    ? averagePoints
        .map((pt) => `${getX(pt.semana)},${getY(pt.peso)}`)
        .join(" ")
    : null;

  return (
    <Card className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-blue-500 w-5 h-5" />
            Curva Zootécnica de Crecimiento
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparativa directa de evolución en peso real vs. curva patrón oficial Porkcolombia.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-bold bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-700">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Estándar
            Ideal Porkcolombia
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <div className="w-3 h-3 rounded-full bg-blue-500 border border-blue-200"></div>
            Promedio Real del Lote
          </div>
        </div>
      </div>

      <div className="relative w-full h-72 bg-slate-50/40 rounded-2xl border border-slate-100 p-6 ml-6 mt-2">
        <svg
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {[0, 25, 50, 75, 100].map((p) => (
            <line
              key={`h-${p}`}
              x1="0"
              y1={`${p}%`}
              x2="100%"
              y2={`${p}%`}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          ))}

          {/* Curva Ideal Porkcolombia */}
          <polyline
            points={idealPoints}
            fill="none"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Curva Real */}
          <polyline
            points={
              realPointsStr ||
              "0,98 15,94 38,76 61,54 96,12"
            }
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute -bottom-7 left-0 right-0 flex justify-between text-[11px] text-slate-400 font-bold px-0 font-mono">
          <span>Sem 1</span>
          <span>Sem 10 (Pre-ceba)</span>
          <span>Sem 16 (Levante)</span>
          <span>Sem 25 (Ceba)</span>
        </div>
        <div className="absolute top-0 bottom-0 -left-12 flex flex-col justify-between items-end text-[11px] text-slate-400 font-mono font-bold py-0 pr-2">
          <span>130kg</span>
          <span>95kg</span>
          <span>60kg</span>
          <span>30kg</span>
          <span>0kg</span>
        </div>
      </div>
    </Card>
  );
};

export default function WeightView() {
  const [animals, setAnimals] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [filterEtapa, setFilterEtapa] = useState("todas");
  const [filterRendimiento, setFilterRendimiento] = useState("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    animalId: "",
    peso: "",
    semanas: "",
    etapa: "pre_ceba",
    fecha: new Date().toISOString().split("T")[0],
    observaciones: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("sip_weight_animals");
    if (stored) {
      setAnimals(JSON.parse(stored));
    } else {
      setAnimals(initialBiometrics);
      localStorage.setItem("sip_weight_animals", JSON.stringify(initialBiometrics));
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("sip_weight_animals", JSON.stringify(animals));
    }
  }, [animals, isMounted]);

  // Funciones zootécnicas
  const getLatestWeight = (pesos) => {
    if (!pesos || pesos.length === 0) return 0;
    const sorted = [...pesos].sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha),
    );
    return sorted[sorted.length - 1].peso;
  };

  const computeGDP = (pesos) => {
    if (!pesos || pesos.length < 2) return null;
    const sorted = [...pesos].sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha),
    );
    const latest = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];

    const diffDays =
      (new Date(latest.fecha) - new Date(prev.fecha)) / (1000 * 60 * 60 * 24);
    if (diffDays <= 0) return 0;

    return Math.round(((latest.peso - prev.peso) / diffDays) * 1000);
  };

  // KPIs
  const filteredAnimals = useMemo(() => {
    return animals.filter((a) => {
      const matchEtapa = filterEtapa === "todas" ? true : a.etapa === filterEtapa;
      const latest = getLatestWeight(a.pesos);
      const expected = getExpectedWeight(a.semanas || 12, a.etapa);
      const diff = latest - expected;

      let rendimiento = "normal";
      if (diff < -5) rendimiento = "rezagado";
      else if (diff >= 3) rendimiento = "optimo";

      const matchRend =
        filterRendimiento === "todos" ? true : rendimiento === filterRendimiento;
      return matchEtapa && matchRend;
    });
  }, [animals, filterEtapa, filterRendimiento]);

  const averageWeight = useMemo(() => {
    if (animals.length === 0) return 0;
    const total = animals.reduce((acc, curr) => acc + getLatestWeight(curr.pesos), 0);
    return (total / animals.length).toFixed(1);
  }, [animals]);

  const averageGMD = useMemo(() => {
    const validGDPs = animals
      .map((a) => computeGDP(a.pesos))
      .filter((g) => g !== null && g > 0);
    if (validGDPs.length === 0) return 780;
    return Math.round(validGDPs.reduce((a, b) => a + b, 0) / validGDPs.length);
  }, [animals]);

  const rezagadosCount = useMemo(() => {
    return animals.filter((a) => {
      const latest = getLatestWeight(a.pesos);
      const expected = getExpectedWeight(a.semanas || 12, a.etapa);
      return latest - expected < -5;
    }).length;
  }, [animals]);

  const handleAddWeight = (e) => {
    e.preventDefault();
    if (!form.animalId || !form.peso) {
      toast.error("Por favor completa el ID del cerdo y su peso");
      return;
    }

    const pesoNum = parseFloat(form.peso);
    const semanasNum = parseInt(form.semanas) || 12;

    if (isNaN(pesoNum) || pesoNum <= 0) {
      toast.error("El peso debe ser mayor a 0 kg");
      return;
    }

    // Persistencia en log individual y lote
    const logEntry = {
      id: `LOG-W-${Date.now()}`,
      animalId: form.animalId.trim(),
      peso: pesoNum,
      semanas: semanasNum,
      fecha: form.fecha,
      observaciones: form.observaciones || "Pesaje rutinario",
    };

    try {
      const storedLogs = localStorage.getItem("sip_weight_logs");
      const logs = storedLogs ? JSON.parse(storedLogs) : [];
      localStorage.setItem("sip_weight_logs", JSON.stringify([logEntry, ...logs]));
    } catch (err) {
      console.error("Error saving weight log:", err);
    }

    setAnimals((prev) => {
      const exists = prev.some(
        (a) => a.id.toLowerCase() === form.animalId.trim().toLowerCase(),
      );
      if (exists) {
        return prev.map((a) =>
          a.id.toLowerCase() === form.animalId.trim().toLowerCase()
            ? {
                ...a,
                semanas: semanasNum || a.semanas,
                etapa: form.etapa || a.etapa,
                pesos: [...a.pesos, { fecha: form.fecha, peso: pesoNum }],
              }
            : a,
        );
      } else {
        return [
          ...prev,
          {
            id: form.animalId.trim(),
            etapa: form.etapa,
            semanas: semanasNum,
            pesos: [{ fecha: form.fecha, peso: pesoNum }],
          },
        ];
      }
    });

    toast.success(`Pesaje registrado para el ejemplar #${form.animalId}`);
    setIsModalOpen(false);
    setForm({
      animalId: "",
      peso: "",
      semanas: "",
      etapa: "pre_ceba",
      fecha: new Date().toISOString().split("T")[0],
      observaciones: "",
    });
  };

  const columns = [
    {
      key: "id",
      header: "Código / Arete",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/animals/profile?id=${row.id}`}
            className="font-black text-indigo-600 hover:text-indigo-800 font-mono text-sm hover:underline"
          >
            #{row.id}
          </Link>
        </div>
      ),
    },
    {
      key: "etapa",
      header: "Etapa / Edad",
      render: (row) => (
        <div>
          <span className="capitalize text-slate-700 font-bold text-xs px-2.5 py-1 bg-slate-100 rounded-lg block w-fit">
            {row.etapa.replace("_", " ")}
          </span>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
            {row.semanas ? `${row.semanas} semanas` : "N/D"}
          </span>
        </div>
      ),
    },
    {
      key: "pesoActual",
      header: "Peso Real",
      render: (row) => (
        <span className="font-black text-slate-900 text-base">
          {getLatestWeight(row.pesos)} kg
        </span>
      ),
    },
    {
      key: "pesoEsperado",
      header: "Estándar Porkcolombia",
      render: (row) => {
        const expected = getExpectedWeight(row.semanas || 12, row.etapa);
        return (
          <span className="font-bold text-slate-500 text-sm font-mono">
            {expected.toFixed(1)} kg
          </span>
        );
      },
    },
    {
      key: "desviacion",
      header: "Desviación",
      render: (row) => {
        const latest = getLatestWeight(row.pesos);
        const expected = getExpectedWeight(row.semanas || 12, row.etapa);
        const diff = latest - expected;
        const isNegative = diff < 0;

        return (
          <span
            className={`font-mono text-xs font-black px-2 py-1 rounded-md ${
              diff >= 2
                ? "bg-emerald-100 text-emerald-800"
                : diff < -5
                  ? "bg-red-100 text-red-800"
                  : "bg-slate-100 text-slate-700"
            }`}
          >
            {isNegative ? "" : "+"}
            {diff.toFixed(1)} kg
          </span>
        );
      },
    },
    {
      key: "estadoCrecimiento",
      header: "Diagnóstico Biométrico",
      render: (row) => {
        const latest = getLatestWeight(row.pesos);
        const expected = getExpectedWeight(row.semanas || 12, row.etapa);
        const diff = latest - expected;

        if (diff < -5) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
              <AlertTriangle size={12} /> Crecimiento Rezagado
            </span>
          );
        }
        if (diff >= 3) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={12} /> Óptimo / Superior
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
            Conforme a Estándar
          </span>
        );
      },
    },
    {
      key: "gdp",
      header: "GDP Reciente",
      render: (row) => {
        const gdp = computeGDP(row.pesos);
        if (gdp === null)
          return (
            <span className="text-slate-400 text-xs font-medium italic">
              1 sola toma
            </span>
          );

        return (
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black ${
              gdp >= 850
                ? "bg-emerald-50 text-emerald-700"
                : gdp < 650
                  ? "bg-rose-50 text-rose-700"
                  : "bg-slate-100 text-slate-700"
            }`}
          >
            {gdp >= 850 ? (
              <TrendingUp size={14} className="text-emerald-600" />
            ) : (
              <Activity size={14} className="text-slate-500" />
            )}
            {gdp} g/día
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-900">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="BIOMETRÍA Y ZOOTECNIA"
        title="Control de Crecimiento y Ganancia Diaria"
        description="Monitoreo biométrico de Ganancia Diaria de Peso (GDP), comparación contra tablas oficiales Porkcolombia y detección de animales rezagados."
        actions={
          <Button
            onClick={() => setIsModalOpen(true)}
            tone="primary"
            className="flex items-center justify-center gap-2 font-black rounded-xl! shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            Registrar Nuevo Pesaje
          </Button>
        }
      />

      {/* TARJETAS KPI DE RENDIMIENTO BIOMÉTRICO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                GMD Promedio del Hato
              </p>
              <h4 className="text-2xl font-black text-slate-900 mt-2">
                {averageGMD} <span className="text-sm text-slate-500">g/día</span>
              </h4>
              <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <ArrowUpRight size={14} /> +45 g/día vs. mes anterior
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Peso Promedio Actual
              </p>
              <h4 className="text-2xl font-black text-slate-900 mt-2">
                {averageWeight} <span className="text-sm text-slate-500">kg</span>
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Lote de ceba y levante
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Scale size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Cerdos Rezagados
              </p>
              <h4 className="text-2xl font-black text-rose-600 mt-2">
                {rezagadosCount} Animales
              </h4>
              <p className="text-[11px] text-rose-500 font-semibold mt-1">
                &gt;5 kg bajo el estándar
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Monitoreos Activos
              </p>
              <h4 className="text-2xl font-black text-slate-900 mt-2">
                {animals.length} Ejemplares
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Historial biométrico al día
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* CURVA GRÁFICA ZOOTÉCNICA */}
      <GrowthChart />

      {/* CONTROLES Y FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-full md:w-auto overflow-x-auto">
          {[
            { id: "todas", label: "Todas las Etapas" },
            { id: "pre_ceba", label: "Pre-ceba" },
            { id: "levante", label: "Levante" },
            { id: "ceba_finalizacion", label: "Ceba / Finalización" },
          ].map((etp) => (
            <button
              key={etp.id}
              onClick={() => setFilterEtapa(etp.id)}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors whitespace-nowrap cursor-pointer ${
                filterEtapa === etp.id
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {etp.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-full md:w-auto">
          <button
            onClick={() => setFilterRendimiento("todos")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
              filterRendimiento === "todos"
                ? "bg-slate-200 text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterRendimiento("rezagado")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer ${
              filterRendimiento === "rezagado"
                ? "bg-red-500 text-white shadow-sm"
                : "text-red-600 hover:bg-red-50"
            }`}
          >
            <AlertTriangle size={12} /> Solo Rezagados
          </button>
          <button
            onClick={() => setFilterRendimiento("optimo")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer ${
              filterRendimiento === "optimo"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <CheckCircle2 size={12} /> Solo Óptimos
          </button>
        </div>
      </div>

      {/* TABLA COMPARATIVA DE BIOMETRÍA */}
      <section className="bg-white rounded-3xl shadow-sm overflow-hidden p-2 border border-slate-100">
        <Table columns={columns} rows={filteredAnimals} />
      </section>

      {/* MODAL REGISTRO DE NUEVO PESAJE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <Card
            as="form"
            onSubmit={handleAddWeight}
            className="w-full max-w-md p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-2xl font-black mb-6 text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                <Scale className="w-6 h-6" />
              </div>
              Nuevo Registro Biométrico
            </h2>

            <div className="space-y-4">
              <Input
                label="Código / Arete del Animal"
                placeholder="Ej: PT-2026-001, 2024-001..."
                value={form.animalId}
                onChange={(e) => setForm({ ...form, animalId: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Peso Real (kg)"
                  type="number"
                  step="0.1"
                  placeholder="Ej: 58.5"
                  value={form.peso}
                  onChange={(e) => setForm({ ...form, peso: e.target.value })}
                  required
                />
                <Input
                  label="Edad (Semanas)"
                  type="number"
                  placeholder="Ej: 16"
                  value={form.semanas}
                  onChange={(e) => setForm({ ...form, semanas: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Etapa Zootécnica
                </label>
                <select
                  value={form.etapa}
                  onChange={(e) => setForm({ ...form, etapa: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-sm cursor-pointer"
                >
                  <option value="pre_ceba">Pre-ceba (Sem 4-10)</option>
                  <option value="levante">Levante (Sem 10-16)</option>
                  <option value="ceba_finalizacion">Ceba / Finalización (Sem 16-25)</option>
                </select>
              </div>

              <Input
                label="Fecha de la Toma"
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                required
              />

              <Input
                label="Observaciones (Opcional)"
                placeholder="Ej: Buena conversión, cambio de corral..."
                value={form.observaciones}
                onChange={(e) =>
                  setForm({ ...form, observaciones: e.target.value })
                }
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
                tone="primary"
                className="flex-1 font-black rounded-xl!"
              >
                Guardar Pesaje
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
