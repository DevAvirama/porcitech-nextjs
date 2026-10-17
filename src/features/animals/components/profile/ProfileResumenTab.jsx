"use client";

import React from "react";
import Card from "@/components/ui/Card";
import { Scale, Stethoscope, Award, TrendingUp, Dna } from "lucide-react";

export default function ProfileResumenTab({
  animal = {},
  isMacho = false,
  isSemental = false,
  tratamientos = [],
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Tarjeta 1: Último Peso */}
      <Card className="bg-slate-50 border border-slate-100 shadow-none rounded-2xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Último Peso Registrado
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

      {/* Tarjeta 2: Último Tratamiento */}
      <Card className="bg-slate-50 border border-slate-100 shadow-none rounded-2xl p-6">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Último Tratamiento
            </p>
            <p className="mt-2 text-base sm:text-lg font-bold text-slate-900 truncate">
              {animal.ultimoTratamiento}
            </p>
            <p className="text-xs text-slate-400 mt-1 font-medium truncate">
              {tratamientos.length > 0
                ? `${tratamientos.length} registro(s) clínico(s) auditado(s)`
                : "Ninguna aplicación clínica registrada"}
            </p>
          </div>
          <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600 shrink-0">
            <Stethoscope size={24} />
          </div>
        </div>
      </Card>

      {/* Tarjeta 3: Aptitud Zootécnica / Estado Reproductivo */}
      <Card className="bg-slate-50 border border-slate-100 shadow-none rounded-2xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              {isMacho ? "Aptitud Zootécnica" : "Estado Reproductivo"}
            </p>
            <p className="mt-2 text-xl font-black text-slate-900">
              {isMacho
                ? isSemental
                  ? "Semental Reproductor"
                  : "Línea de Ceba / Levante"
                : animal.estadoReproductivo}
            </p>
            {isMacho ? (
              <p
                className={`text-sm font-semibold mt-1 ${
                  isSemental ? "text-indigo-600" : "text-blue-600"
                }`}
              >
                {isSemental
                  ? "Semental activo para montas e IA"
                  : "Línea de ceba terminal (no reproductor)"}
              </p>
            ) : (
              <p className="text-sm font-medium text-fuchsia-600 mt-1">
                {animal.diasGestacion
                  ? `${animal.diasGestacion} días de gestación`
                  : "Sin gestación activa"}
              </p>
            )}
          </div>
          <div
            className={`p-3 rounded-2xl ${
              isMacho
                ? isSemental
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-blue-100 text-blue-600"
                : "bg-fuchsia-100 text-fuchsia-600"
            }`}
          >
            {isMacho ? (
              isSemental ? <Award size={24} /> : <TrendingUp size={24} />
            ) : (
              <Dna size={24} />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
