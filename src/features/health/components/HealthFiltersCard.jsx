"use client";

import React from "react";
import { Search, Filter, Warehouse } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

export default function HealthFiltersCard({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterCorral,
  setFilterCorral,
  corrales = [],
}) {
  return (
    <Card className="rounded-3xl p-5 flex flex-col md:flex-row gap-4 items-end bg-white border border-slate-100 shadow-sm">
      <div className="w-full md:w-1/2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Search size={14} className="text-emerald-500" />
          Buscar por Arete, Alias o Producto
        </label>
        <Input
          placeholder="Ej: Código de arete, alias o medicamento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full shadow-sm text-sm"
        />
      </div>

      <div className="w-full md:w-1/4">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Filter size={14} className="text-emerald-500" />
          Tipo de Evento
        </label>
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none text-sm cursor-pointer"
          >
            <option value="all">Todos los Eventos</option>
            <option value="vacuna">Vacunación</option>
            <option value="tratamiento">Tratamiento Médico</option>
            <option value="desparasitacion">Desparasitación</option>
          </select>
        </div>
      </div>

      <div className="w-full md:w-1/4">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Warehouse size={14} className="text-emerald-500" />
          Corral
        </label>
        <div className="relative">
          <select
            value={filterCorral}
            onChange={(e) => setFilterCorral(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none text-sm cursor-pointer"
          >
            <option value="all">Todos los Corrales</option>
            {corrales.map((c) => (
              <option key={c.id} value={c.id}>
                Corral {c.codigo} ({c.fase})
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
}
