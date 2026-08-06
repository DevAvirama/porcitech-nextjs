"use client";

import React, { useState } from "react";
import { Utensils, Database, Plus, TrendingDown } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import ModuleHeader from "@/components/layout/ModuleHeader";

// Mock Data
const initialInventoryStats = [
  {
    type: "Pre-iniciador",
    stock: 450,
    capacity: 500,
    unit: "kg",
    tone: "bg-orange-500",
  },
  {
    type: "Iniciador",
    stock: 800,
    capacity: 1000,
    unit: "kg",
    tone: "bg-amber-500",
  },
  {
    type: "Levante",
    stock: 1200,
    capacity: 2000,
    unit: "kg",
    tone: "bg-blue-500",
  },
  { type: "Ceba", stock: 300, capacity: 2000, unit: "kg", tone: "bg-rose-500" }, // Low stock example
];

const initialDailyConsumption = [
  {
    id: 1,
    fecha: "2026-04-25",
    tipo: "Levante",
    cantidad: "150 kg",
    destino: "Lote #42",
  },
  {
    id: 2,
    fecha: "2026-04-25",
    tipo: "Pre-iniciador",
    cantidad: "25 kg",
    destino: "Corral 09",
  },
  {
    id: 3,
    fecha: "2026-04-24",
    tipo: "Ceba",
    cantidad: "200 kg",
    destino: "Sector A-12",
  },
  {
    id: 4,
    fecha: "2026-04-24",
    tipo: "Iniciador",
    cantidad: "80 kg",
    destino: "Lote #15",
  },
];

const FeedingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consumption, setConsumption] = useState(initialDailyConsumption);
  const [inventory, setInventory] = useState(initialInventoryStats);

  // Form fields state
  const [formTipo, setFormTipo] = useState("Pre-iniciador");
  const [formCantidad, setFormCantidad] = useState("");
  const [formDestino, setFormDestino] = useState("");

  const columns = [
    { key: "fecha", header: "Fecha" },
    { key: "tipo", header: "Tipo de Alimento" },
    { key: "cantidad", header: "Cantidad (kg)" },
    { key: "destino", header: "Lote/Animal destinado" },
  ];

  const handleSubmitSupply = (e) => {
    e.preventDefault();
    const quantityNum = parseFloat(formCantidad);
    if (isNaN(quantityNum) || quantityNum <= 0) return;

    // Validar stock disponible
    const matchedSilo = inventory.find((s) => s.type === formTipo);
    if (matchedSilo && matchedSilo.stock < quantityNum) {
      alert(
        `Stock insuficiente en silo de ${formTipo}. Disponible: ${matchedSilo.stock} kg`,
      );
      return;
    }

    // Agregar al historial de consumo
    const newRecord = {
      id: Date.now(),
      fecha: new Date().toISOString().split("T")[0],
      tipo: formTipo,
      cantidad: `${quantityNum} kg`,
      destino: formDestino || "N/A",
    };

    setConsumption([newRecord, ...consumption]);

    // Restar del silo
    setInventory(
      inventory.map((s) => {
        if (s.type === formTipo) {
          return { ...s, stock: Math.max(0, s.stock - quantityNum) };
        }
        return s;
      }),
    );

    setIsModalOpen(false);
    setFormCantidad("");
    setFormDestino("");
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="NUTRICIÓN"
        title="Alimentación"
        description="Gestión de inventario y consumo diario del plantel."
        actions={
          <Button
            onClick={() => setIsModalOpen(true)}
            tone="primary"
            className="flex items-center gap-2 font-bold rounded-xl!"
          >
            <Plus size={20} />
            Registrar Suministro
          </Button>
        }
      />

      {/* Dashboard de Inventario */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Database className="text-blue-500 w-6 h-6" />
          Inventario de Silos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {inventory.map((stat, idx) => {
            const percentage = Math.round((stat.stock / stat.capacity) * 100);
            const isLow = percentage <= 20;

            return (
              <Card
                key={idx}
                className="rounded-3xl! relative overflow-hidden group border border-slate-100 shadow-sm"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <Database className="w-20 h-20 text-slate-900" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-505 text-slate-500 mb-1">
                  {stat.type}
                </p>
                <div className="flex items-end gap-2 mb-4">
                  <span
                    className={`text-4xl font-black ${isLow ? "text-rose-500" : "text-slate-900"}`}
                  >
                    {stat.stock}
                  </span>
                  <span className="text-slate-500 font-medium mb-1">
                    {stat.unit}
                  </span>
                </div>

                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                  <span>
                    Capacidad: {stat.capacity}
                    {stat.unit}
                  </span>
                  <span>{percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${stat.tone}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                {isLow && (
                  <div className="mt-4 flex items-center gap-2 text-rose-500 text-xs font-bold bg-rose-50 p-2 rounded-lg">
                    <TrendingDown className="w-4 h-4" />
                    Stock crítico. Reabastecer.
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Consumos */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-slate-800">
          Historial de Suministros
        </h3>
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-2">
          <Table columns={columns} rows={consumption} />
        </div>
      </section>

      {/* Modal de Registro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <Card
            as="form"
            onSubmit={handleSubmitSupply}
            className="w-full max-w-md p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-2xl font-black mb-6 text-slate-900">
              Registrar Suministro
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Tipo de Alimento
                </label>
                <select
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none font-medium text-slate-700"
                >
                  <option value="Pre-iniciador">Pre-iniciador</option>
                  <option value="Iniciador">Iniciador</option>
                  <option value="Levante">Levante</option>
                  <option value="Ceba">Ceba</option>
                </select>
              </div>

              <Input
                label="Cantidad Suministrada (kg)"
                type="number"
                placeholder="Ej: 50"
                required
                value={formCantidad}
                onChange={(e) => setFormCantidad(e.target.value)}
              />

              <Input
                label="Destino (Lote o Corral)"
                placeholder="Ej: Lote #42"
                required
                value={formDestino}
                onChange={(e) => setFormDestino(e.target.value)}
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
                Guardar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FeedingView;
