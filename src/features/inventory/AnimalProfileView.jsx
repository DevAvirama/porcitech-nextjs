"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import ModuleHeader from "@/components/layout/ModuleHeader";
import {
  Stethoscope,
  Scale,
  Dna,
  Calendar,
  Activity,
  Syringe,
  Plus,
  Edit2,
  ChevronLeft,
  TrendingUp,
  Baby,
} from "lucide-react";

import inventoryConstants from "./data/inventoryConstants.json";

const Badge = ({ estado, type = "salud" }) => {
  const themeMap = {
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
    yellow: "bg-yellow-100 text-yellow-700",
    emerald: "bg-emerald-100 text-emerald-700",
    purple: "bg-purple-100 text-purple-700",
    rose: "bg-rose-100 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
  };

  let colorTheme = "slate";

  if (type === "salud") {
    switch (estado) {
      case "Óptimo":
        colorTheme = "emerald";
        break;
      case "En Tratamiento":
        colorTheme = "orange";
        break;
      case "Observación":
        colorTheme = "yellow";
        break;
      case "Crítico":
        colorTheme = "rose";
        break;
    }
  } else if (type === "etapa") {
    const found = inventoryConstants.etapas.find(
      (e) =>
        e.label.toLowerCase() === estado.toLowerCase() ||
        e.id === estado.toLowerCase(),
    );
    if (found) {
      colorTheme = found.color;
    } else if (
      estado.toLowerCase() === "gestación" ||
      estado.toLowerCase() === "reproducción" ||
      estado.toLowerCase() === "reproduccion"
    ) {
      colorTheme = "purple";
    }
  }

  const colors = themeMap[colorTheme] || themeMap.slate;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors}`}
    >
      {estado}
    </span>
  );
};

export default function AnimalProfileView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const animalId = searchParams.get("id") || "L-042";

  // Mock de datos del animal
  const animal = {
    id: animalId,
    raza: "Landrace x Pietrain",
    sexo: "Hembra",
    fechaNacimiento: "2023-05-15",
    etapa: "Gestación",
    estadoSalud: "Óptimo",
    pesoActual: 185.5,
    ultimoTratamiento: "2024-03-10 (Vacuna Parvovirus)",
    estadoReproductivo: "Confirmada",
    diasGestacion: 45,
  };

  const calcularEdad = (fecha) => {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    const meses =
      (hoy.getFullYear() - nacimiento.getFullYear()) * 12 +
      hoy.getMonth() -
      nacimiento.getMonth();
    return `${meses} meses`;
  };

  const [activeTab, setActiveTab] = useState("resumen");

  // Funciones de tabs
  const renderTabResumen = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-slate-50 border border-slate-100 shadow-none rounded-2xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Último Peso
            </p>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {animal.pesoActual}{" "}
              <span className="text-lg text-slate-500 font-bold">kg</span>
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
            <Scale size={24} />
          </div>
        </div>
      </Card>
      <Card className="bg-slate-50 border border-slate-100 shadow-none rounded-2xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Último Tratamiento
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {animal.ultimoTratamiento}
            </p>
          </div>
          <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
            <Stethoscope size={24} />
          </div>
        </div>
      </Card>
      <Card className="bg-slate-50 border border-slate-100 shadow-none rounded-2xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Estado Reproductivo
            </p>
            <p className="mt-2 text-xl font-black text-slate-900">
              {animal.estadoReproductivo}
            </p>
            <p className="text-sm font-medium text-fuchsia-600 mt-1">
              {animal.diasGestacion} días de gestación
            </p>
          </div>
          <div className="p-3 bg-fuchsia-100 rounded-2xl text-fuchsia-600">
            <Dna size={24} />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTabSalud = () => {
    const timeline = [
      {
        fecha: "2024-03-10",
        evento: "Vacuna Parvovirus / Leptospira",
        tipo: "Prevención",
        responsable: "Dr. Ruiz",
      },
      {
        fecha: "2023-11-20",
        evento: "Tratamiento Antibiótico (Neumonía)",
        tipo: "Tratamiento",
        responsable: "Dra. Silva",
      },
      {
        fecha: "2023-06-05",
        evento: "Corte de Cola y Colmillos",
        tipo: "Manejo",
        responsable: "Operador A",
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900">
          Historial Médico y Manejo
        </h3>
        <div className="relative border-l-2 border-indigo-100 ml-4 space-y-8">
          {timeline.map((item, idx) => (
            <div key={idx} className="relative pl-6">
              <div className="absolute -left-2 top-1.5 h-3.5 w-3.5 rounded-full bg-indigo-500 ring-4 ring-white" />
              <div className="bg-slate-55 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-900">
                    {item.evento}
                  </span>
                  <span className="text-sm font-semibold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                    {item.fecha}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Syringe size={14} className="text-indigo-400" />{" "}
                    {item.tipo}
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity size={14} className="text-emerald-400" />{" "}
                    {item.responsable}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTabProduccion = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <TrendingUp className="text-blue-500" /> Crecimiento vs Estándar
          (Porkcolombia)
        </h3>
        <Card className="bg-slate-50 border border-slate-100 shadow-none h-64 relative overflow-hidden flex flex-col justify-end p-0 rounded-2xl">
          <svg
            className="w-full h-48"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polyline
              points="0,90 20,70 40,50 60,35 80,20 100,5"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="opacity-40"
            />
            <polyline
              points="0,95 20,80 40,55 60,40 80,25 100,10"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="absolute top-4 right-6 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-sm text-xs font-bold space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-blue-500 rounded-full"></div> Curva
              Real del Animal
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-emerald-500 opacity-50 rounded-full border border-dashed border-emerald-500"></div>{" "}
              Estándar Ideal
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderTabReproduccion = () => {
    const partos = [
      {
        fecha: "2024-01-15",
        nacidosVivos: 12,
        nacidosMuertos: 1,
        destetados: 11,
        pesoPromedio: 1.4,
      },
      {
        fecha: "2023-08-05",
        nacidosVivos: 14,
        nacidosMuertos: 0,
        destetados: 13,
        pesoPromedio: 1.5,
      },
    ];

    const cols = [
      { header: "Fecha de Parto", key: "fecha" },
      { header: "Nacidos Vivos", key: "nacidosVivos" },
      { header: "Muertos/Momias", key: "nacidosMuertos" },
      { header: "Destetados", key: "destetados" },
      { header: "Peso Promedio (kg)", key: "pesoPromedio" },
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900">
            Historial de Partos
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-500">
              Ciclos completados: 2
            </span>
            <div className="bg-fuchsia-100 text-fuchsia-700 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5">
              <Baby size={16} /> Gestación actual: Día {animal.diasGestacion}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-xs font-bold text-slate-505 text-slate-500 mb-2 uppercase tracking-wider">
            <span>Servicio (Día 0)</span>
            <span>
              Progreso: {Math.round((animal.diasGestacion / 114) * 100)}%
            </span>
            <span>Parto (Día 114)</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-fuchsia-500 rounded-full transition-all duration-1000"
              style={{ width: `${(animal.diasGestacion / 114) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="border border-slate-100 rounded-4xl overflow-hidden">
          <Table columns={cols} rows={partos} />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-900">
      {/* Botón Volver */}
      <button
        onClick={() => router.push("/dashboard/inventory")}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-650 hover:text-indigo-600 transition-colors cursor-pointer w-fit no-print"
      >
        <ChevronLeft size={16} /> Volver al Inventario
      </button>

      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="HOJA DE VIDA"
        title={`Ficha de Animal #${animal.id}`}
        description={`${animal.raza} • ${animal.sexo} • Edad: ${calcularEdad(animal.fechaNacimiento)}`}
        actions={
          <div className="flex gap-2">
            <Badge estado={animal.etapa} type="etapa" />
            <Badge estado={animal.estadoSalud} type="salud" />
          </div>
        }
      />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 w-full space-y-6">
          {/* Header de Perfil */}
          <Card className="p-8! border border-slate-100 bg-white rounded-4xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-3xl bg-indigo-50 flex items-center justify-center border-2 border-indigo-100">
                  <span className="text-3xl font-black text-indigo-300">
                    🐷
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Resumen Técnico
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Historial reproductivo: {animal.estadoReproductivo}
                  </p>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">
                    Último tratamiento: {animal.ultimoTratamiento}
                  </p>
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className="flex flex-col gap-3 min-w-50 w-full md:w-auto">
                <Button className="w-full justify-start gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl! shadow-md border-none cursor-pointer">
                  <Scale size={16} /> Registrar Pesaje
                </Button>
                <Button className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl! shadow-md border-none cursor-pointer">
                  <Plus size={16} /> Añadir Tratamiento
                </Button>
                <Button
                  tone="soft"
                  className="w-full justify-start gap-2 font-bold rounded-xl!"
                >
                  <Edit2 size={16} /> Editar Datos
                </Button>
              </div>
            </div>
          </Card>

          {/* Navegación por Pestañas */}
          <Card className="p-2 bg-white rounded-4xl shadow-sm border border-slate-100">
            <div className="flex overflow-x-auto no-scrollbar gap-2 p-2">
              {[
                { id: "resumen", label: "Resumen General" },
                { id: "salud", label: "Historial Médico" },
                { id: "produccion", label: "Producción y Peso" },
                { id: "reproduccion", label: "Reproducción" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-indigo-650 bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                      : "text-slate-600 hover:bg-slate-105 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 mt-4 border-t border-slate-100">
              {activeTab === "resumen" && renderTabResumen()}
              {activeTab === "salud" && renderTabSalud()}
              {activeTab === "produccion" && renderTabProduccion()}
              {activeTab === "reproduccion" && renderTabReproduccion()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
