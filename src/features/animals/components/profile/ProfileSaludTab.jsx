"use client";

import React from "react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import {
  Activity,
  Plus,
  Syringe,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

const CRONOGRAMA_PROFILACTICO = [
  {
    id: "hierro",
    nombre: "Hierro Dextrano & Coccidiostato (Toltrazuril)",
    etapa: "Lactancia (3 a 5 días de nacido)",
    diasMinimo: 5,
    tipo: "Manejo BPP / Preventivo",
    descripcion: "Prevención de anemia neonatal ferropénica y diarreas por coccidias.",
    normativa: "Manejo Sanitario de Camada",
    keywords: ["hierro", "toltrazuril", "dextrano", "anemia", "coccidi"],
  },
  {
    id: "pcv2_myco",
    nombre: "Mycoplasma Hyopneumoniae + Circovirus (PCV2)",
    etapa: "Precebo temprano (14 a 21 días)",
    diasMinimo: 21,
    tipo: "Inmunización Básica (Porkcolombia)",
    descripcion: "Protección pulmonar frente a neumonía enzoótica y síndrome de desmedro multisistémico.",
    normativa: "Estándar BPP Porkcolombia",
    keywords: ["mycoplasma", "circovirus", "pcv2", "pulmonar", "orf2"],
  },
  {
    id: "ppc",
    nombre: "Peste Porcina Clásica (PPC - Cepa China)",
    etapa: "Precebo tardío (45 a 60 días)",
    diasMinimo: 60,
    tipo: "Obligatoria Nacional (ICA)",
    descripcion: "Vacunación oficial obligatoria para control y erradicación de PPC en territorio colombiano.",
    normativa: "Resolución Obligatoria ICA",
    keywords: ["peste", "ppc", "cepa china", "clásica"],
  },
  {
    id: "parvo_lepto",
    nombre: "Parvovirus Porcino + Leptospira + Erisipela",
    etapa: "Reemplazo / Pre-servicio (>180 días)",
    diasMinimo: 180,
    tipo: "Profilaxis Reproductiva",
    descripcion: "Inmunización contra fallas reproductivas, leptospirosis, erisipela y momificación fetal.",
    normativa: "Recomendada Reproductores (Semestral)",
    keywords: ["parvovirus", "leptospira", "erisipela", "parvo", "lepto"],
  },
];

export default function ProfileSaludTab({
  animal = {},
  tratamientos = [],
  onNavigateHealth,
}) {
  const birthDate = animal.fechaNacimiento ? new Date(animal.fechaNacimiento) : null;
  const now = new Date();
  const edadDias =
    birthDate && !isNaN(birthDate.getTime())
      ? Math.max(0, Math.floor((now - birthDate) / (1000 * 60 * 60 * 24)))
      : 180;
  const edadMeses = Math.floor(edadDias / 30);

  return (
    <div className="space-y-8">
      {/* BLOQUE 1: HISTORIAL DE TRATAMIENTOS Y VACUNAS APLICADAS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Activity className="text-emerald-600" size={20} />
              Historial de Tratamientos y Vacunas Aplicadas
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {tratamientos.length > 0
                ? `${tratamientos.length} aplicación(es) clínica(s) verificada(s) en la base de datos de la granja.`
                : "Registro clínico oficial de medicamentos, biológicos y desparasitaciones."}
            </p>
          </div>
          <Button
            onClick={onNavigateHealth}
            tone="primary"
            className="text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-xs"
          >
            <Plus size={14} /> Registrar Tratamiento
          </Button>
        </div>

        {tratamientos.length === 0 ? (
          <div className="py-6">
            <EmptyState
              icon={Syringe}
              title="Sin tratamientos registrados"
              description="No se han registrado aplicaciones biológicas ni tratamientos para este ejemplar."
              actionLabel="Registrar Tratamiento en Sanidad"
              onAction={onNavigateHealth}
            />
          </div>
        ) : (
          <div className="relative border-l-2 border-emerald-200 ml-4 space-y-6">
            {tratamientos.map((item, idx) => (
              <div key={item.id || idx} className="relative pl-6">
                <div className="absolute -left-2 top-1.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {item.producto_nombre}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 w-fit">
                      {item.fecha_tratamiento ? item.fecha_tratamiento.split("T")[0] : ""}
                    </span>
                  </div>
                  {item.diagnostico && (
                    <p className="text-xs text-slate-600 font-medium">
                      Diagnóstico / Motivo: {item.diagnostico}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      <Syringe size={13} className="text-emerald-600" />
                      {item.dosis} {item.unidad_dosis || "ml"} ({item.via_administracion || "Subcutánea"})
                    </span>
                    <span className="text-slate-600 font-medium">
                      Resp: {item.veterinario_nombre || "Médico Veterinario"}
                    </span>
                    {Number(item.tiempo_retiro_dias) > 0 && (
                      <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-bold">
                        Retiro: {item.tiempo_retiro_dias} días
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BLOQUE 2: CRONOGRAMA PROFILÁCTICO SUGERIDO (ESTÁNDAR POR EDAD) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" size={20} />
            <h3 className="text-lg font-black text-slate-900">
              Cronograma Profiláctico Sugerido (Estándar por Edad)
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Planes biológicos recomendados según los días de vida del ejemplar (
            <span className="font-bold text-slate-700">{edadDias} días</span> / ~
            <span className="font-bold text-slate-700">{edadMeses} meses</span>). Por normativa ICA / BPP, las vacunas solo se marcan como aplicadas si existe comprobante clínico registrado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CRONOGRAMA_PROFILACTICO.map((proto) => {
            const matchingTreatment = tratamientos.find((t) => {
              const text = `${t.producto_nombre || ""} ${t.diagnostico || ""}`.toLowerCase();
              return proto.keywords.some((kw) => text.includes(kw));
            });

            let estado = "";
            let badgeClass = "";
            let StatusIcon = null;

            if (matchingTreatment) {
              estado = "APLICADA";
              badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
              StatusIcon = CheckCircle2;
            } else if (edadDias < proto.diasMinimo) {
              estado = "PENDIENTE";
              badgeClass = "bg-amber-100 text-amber-800 border-amber-300";
              StatusIcon = Clock;
            } else {
              estado = "ATRASADA / NO REGISTRADA";
              badgeClass = "bg-rose-100 text-rose-800 border-rose-300";
              StatusIcon = AlertCircle;
            }

            return (
              <div
                key={proto.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-black text-sm text-slate-900">
                      {proto.nombre}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full border whitespace-nowrap ${badgeClass}`}
                    >
                      <StatusIcon size={12} />
                      {estado}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {proto.descripcion}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="font-bold text-slate-500">
                    Etapa: <strong className="text-slate-800">{proto.etapa}</strong>
                  </span>
                  <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                    {proto.normativa}
                  </span>
                </div>

                {matchingTreatment ? (
                  <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                    ✓ Registrada en granja el {matchingTreatment.fecha_tratamiento?.split("T")[0] || matchingTreatment.fecha_tratamiento} por {matchingTreatment.veterinario_nombre || "Veterinario"}
                  </div>
                ) : (
                  <div className="text-[11px] font-medium text-slate-500 italic bg-white p-2 rounded-xl border border-slate-200">
                    {estado === "PENDIENTE"
                      ? "Programada para aplicar al alcanzar la edad requerida."
                      : "Sin registro clínico en BD. No verificada oficialmente."}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
