"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Syringe,
  ShieldCheck,
  Clock,
  Search,
  Plus,
  Activity,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ModuleHeader from "@/components/layout/ModuleHeader";
import AddHealthRecordModal from "./components/AddHealthRecordModal";

const HealthView = () => {
  const [records, setRecords] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sip_health_records");
    if (stored) {
      setRecords(JSON.parse(stored));
    } else {
      const defaultRecords = [
        {
          id: "2026-X1",
          type: "vacuna",
          producto: "Peste Porcina Clásica",
          lote: "Lote B-24 / C-01",
          fecha: "Oct 24, 2023",
          estado: "APLICADA",
        },
        {
          id: "2026-X8",
          type: "tratamiento",
          producto: "Complejo B Forte",
          lote: "Lote A-12 / C-05",
          fecha: "Oct 25, 2023",
          estado: "EN CURSO",
        },
        {
          id: "2026-Y4",
          type: "vacuna",
          producto: "Circovirus Porcino",
          lote: "Lote C-02 / C-02",
          fecha: "Oct 28, 2023",
          estado: "PENDIENTE",
        },
      ];
      setRecords(defaultRecords);
      localStorage.setItem("sip_health_records", JSON.stringify(defaultRecords));
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("sip_health_records", JSON.stringify(records));
    }
  }, [records, isMounted]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  // --- LÓGICA DE BÚSQUEDA Y FILTRADO ---
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.producto.toLowerCase().includes(searchTerm.toLowerCase());

      if (filter === "Todos") return matchesSearch;
      if (filter === "Vacunación")
        return matchesSearch && record.type === "vacuna";
      if (filter === "Tratamientos Médicos")
        return matchesSearch && record.type === "tratamiento";
      if (filter === "Pendientes")
        return matchesSearch && record.estado === "PENDIENTE";
      return matchesSearch;
    });
  }, [records, filter, searchTerm]);

  // --- ACCIONES ---
  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro sanitario?")) {
      setRecords(records.filter((r) => r.id !== id));
      toast.success("Registro sanitario eliminado");
    }
  };

  const handleEdit = (record) => {
    console.log("Editando:", record);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="SANIDAD Y BIOSEGURIDAD"
        title="Gestión de Salud y Vacunación"
        description="Historial de tratamientos clínicos, vacunaciones y protocolos sanitarios."
        actions={
          <Button
            onClick={() => setIsModalOpen(true)}
            tone="primary"
            className="flex items-center gap-2 font-bold rounded-xl!"
          >
            <Plus size={20} />
            Registrar Evento Sanitario
          </Button>
        }
      />

      {/* SECCIÓN DE TARJETAS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TARJETA DOSIS PENDIENTES - NARANJA */}
        <Card className="rounded-[2.5rem]! p-8 flex justify-between items-center bg-white shadow-sm border border-orange-100 border-l-10 border-l-orange-500">
          <div>
            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">
              Dosis Pendientes
            </p>
            <h4 className="text-4xl font-black text-orange-505 text-orange-500">124</h4>
            <p className="text-orange-500/60 text-[10px] font-bold mt-2 flex items-center gap-1">
              <Clock size={12} /> Vencimiento próximo: Lote B-12
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-3xl">
            <Clock className="text-orange-500 w-8 h-8" />
          </div>
        </Card>

        {/* TARJETA ANIMALES EN TRATAMIENTO - AZUL */}
        <Card className="rounded-[2.5rem]! p-8 flex justify-between items-center bg-white shadow-sm border border-blue-100 border-l-10 border-l-blue-600">
          <div>
            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">
              En Tratamiento
            </p>
            <h4 className="text-4xl font-black text-blue-605 text-blue-600">42</h4>
            <p className="text-blue-600/60 text-[10px] font-bold mt-2 flex items-center gap-1">
              <Activity size={12} /> 85% recuperación estimada
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-3xl">
            <Activity className="text-blue-600 w-8 h-8" />
          </div>
        </Card>

        {/* TARJETA ÍNDICE DE SALUD - VERDE PORCITECH */}
        <Card className="rounded-[2.5rem]! p-8 flex justify-between items-center bg-white shadow-sm border border-emerald-100 border-l-10 border-l-emerald-500">
          <div>
            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">
              Índice de Salud
            </p>
            <h4 className="text-4xl font-black text-emerald-600">98.2%</h4>
            <p className="text-emerald-500/60 text-[10px] font-bold mt-2 flex items-center gap-1">
              <ShieldCheck size={12} /> +2.1% desde el último mes
            </p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-3xl">
            <ShieldCheck className="text-emerald-500 w-8 h-8" />
          </div>
        </Card>
      </div>

      <Card className="rounded-[2.5rem]! p-8 bg-white border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
          {/* BOTONES DE FILTRADO FUNCIONALES */}
          <div className="flex p-1.5 bg-[#f1f5f9] rounded-full w-fit overflow-x-auto">
            {["Todos", "Vacunación", "Tratamientos Médicos", "Pendientes"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-6 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${filter === tab ? "bg-sena-green text-white shadow-md" : "text-slate-405 text-slate-400 hover:text-slate-600"}`}
                >
                  {tab}
                </button>
              ),
            )}
          </div>
          {/* BÚSQUEDA FUNCIONAL */}
          <div className="relative group">
            <Search
              className="absolute left-5 top-3.5 text-slate-300 group-focus-within:text-[#00a34d] transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por ID o Producto..."
              className="pl-14 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-full w-full md:w-96 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-sm text-slate-900"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8">ID Animal</th>
                <th className="px-6">Tipo</th>
                <th className="px-6">Descripción</th>
                <th className="px-6 text-center">Estado</th>
                <th className="px-6 text-right pr-10">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((row) => (
                <tr
                  key={row.id}
                  className="bg-white hover:bg-slate-50 transition-all shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-100"
                >
                  <td className="px-8 py-5 rounded-l-2xl font-black text-slate-900">
                    #{row.id}
                  </td>
                  <td className="px-6 py-5 font-black text-[9px] uppercase tracking-widest text-[#00a34d]">
                    {row.type}
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-700">
                    {row.producto}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span
                      className={`px-5 py-2 rounded-full text-[9px] font-black tracking-widest text-white ${row.estado === "APLICADA" ? "bg-sena-green" : row.estado === "EN CURSO" ? "bg-blue-600" : "bg-orange-500"}`}
                    >
                      {row.estado}
                    </span>
                  </td>
                  {/* ACCIONES: EDITAR Y PAPELERA */}
                  <td className="px-8 py-5 rounded-r-2xl text-right space-x-2">
                    <button
                      onClick={() => handleEdit(row)}
                      className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AddHealthRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => setRecords([data, ...records])}
      />
    </div>
  );
};

export default HealthView;
