"use client";

import React, { useState, useEffect } from "react";
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
  QrCode,
  ArrowRight,
  ShieldCheck,
  Award,
  Heart,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  FileCheck,
} from "lucide-react";

import animalConstants from "./data/animalConstants.json";
import AnimalQrModal from "./components/AnimalQrModal";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { getAnimalById, getAnimalByQr } from "@/services/animalService";
import { getServices, getFarrowings } from "@/services/reproductionService";
import { getTreatments } from "@/services/healthService";
import { getAnimalWeightHistory } from "@/services/weightService";
import { getAnimalDisplayName, UUID_REGEX, formatDateTime } from "@/utils/formatters";

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
      case "SALUDABLE":
        colorTheme = "emerald";
        break;
      case "En Tratamiento":
        colorTheme = "orange";
        break;
      case "Observación":
      case "OBSERVACIÓN":
        colorTheme = "yellow";
        break;
      case "Crítico":
        colorTheme = "rose";
        break;
    }
  } else if (type === "etapa") {
    const found = animalConstants.etapas.find(
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
  const animalId = searchParams.get("code") || searchParams.get("id");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [animalData, setAnimalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coberturas, setCoberturas] = useState([]);
  const [partos, setPartos] = useState([]);
  const [pesajes, setPesajes] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);

  useEffect(() => {
    async function loadProfile() {
      if (!animalId) {
        setIsLoading(false);
        setError("Identificador de animal no proporcionado.");
        return;
      }

      setIsLoading(true);
      setError(null);

      let found = null;
      try {
        try {
          found = await getAnimalById(animalId);
        } catch {
          found = await getAnimalByQr(animalId);
        }
      } catch (err) {
        console.warn("Animal no encontrado en la base de datos:", err.message);
      }

      if (!found) {
        setAnimalData(null);
        setError("Animal no encontrado en la base de datos");
        setIsLoading(false);
        return;
      }

      const targetId = found.id || animalId;

      // Cargar tratamientos clínicos reales desde FastAPI
      let realTreatments = [];
      try {
        const tData = await getTreatments({ animal_id: targetId });
        if (Array.isArray(tData)) {
          realTreatments = tData;
          setTratamientos(tData);
        }
      } catch (err) {
        console.warn("Aviso al cargar tratamientos clínicos:", err.message);
      }

      // Cargar pesajes reales desde FastAPI / TimescaleDB
      try {
        const wData = await getAnimalWeightHistory(targetId);
        if (Array.isArray(wData)) {
          setPesajes(wData);
        }
      } catch (err) {
        console.warn("Aviso al cargar pesajes del animal:", err.message);
      }

      const isMale = (found.sexo || "").toLowerCase() === "macho";

      // Cargar coberturas / servicios reproductivos
      try {
        const allServices = await getServices();
        if (Array.isArray(allServices)) {
          if (isMale) {
            const maleServices = allServices.filter(
              (s) => s.macho_id === found.id || s.macho_id === animalId
            );
            setCoberturas(maleServices);
          } else {
            const femaleServices = allServices.filter(
              (s) => s.hembra_id === found.id || s.hembra_id === animalId
            );
            setCoberturas(femaleServices);
            const activeGest = femaleServices.find(
              (s) => s.estado_confirmacion === "positiva" && s.fecha_servicio
            );
            if (activeGest) {
              const diffTime = Math.abs(new Date() - new Date(activeGest.fecha_servicio));
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              found._diasGestacion = Math.min(114, Math.max(1, diffDays));
            }
          }
        }
      } catch (err) {
        console.warn("Aviso al consultar servicios reproductivos:", err.message);
      }

      // Cargar partos si es hembra
      if (!isMale) {
        try {
          const allPartos = await getFarrowings();
          if (Array.isArray(allPartos)) {
            const femalePartos = allPartos.filter(
              (p) => p.hembra_id === found.id || p.hembra_id === animalId
            );
            setPartos(femalePartos);
          }
        } catch (err) {
          console.warn("Aviso al consultar partos de la hembra:", err.message);
        }
      }

      let ultimoTrat = "Sin tratamientos registrados";
      if (realTreatments.length > 0) {
        const latest = realTreatments[0];
        const dateStr = latest.fecha_tratamiento ? latest.fecha_tratamiento.split("T")[0] : "";
        ultimoTrat = dateStr ? `${dateStr} (${latest.producto_nombre})` : latest.producto_nombre;
      }

      const rawArete = found.codigo_arete;
      const validArete =
        rawArete && !UUID_REGEX.test(String(rawArete).trim())
          ? String(rawArete).trim()
          : null;

      const etapaLower = (found.estado || found.etapa || "").toLowerCase();
      const isCeba =
        ["engorde", "ceba", "precebo", "levante"].includes(etapaLower) ||
        (found.estado_reproductivo || "").toLowerCase().includes("ceba") ||
        (found.estado_reproductivo || "").toLowerCase().includes("no reproductor");

      let repStatus = "";
      let diasGest = found._diasGestacion || null;

      if (isMale) {
        repStatus = isCeba ? "Línea de Ceba / Levante" : "Semental Reproductor";
        diasGest = null;
      } else {
        if (found.estado_reproductivo) {
          repStatus = found.estado_reproductivo;
        } else if (diasGest) {
          repStatus = "Confirmada";
        } else if (etapaLower === "gestacion") {
          repStatus = "Confirmada";
          diasGest = 45;
        } else if (etapaLower === "lactante") {
          repStatus = "Lactante";
          diasGest = null;
        } else {
          repStatus = "Vacía";
          diasGest = null;
        }
      }

      setAnimalData({
        id: found.id || animalId,
        codigo_arete: validArete,
        codigo_qr:
          found.codigo_qr ||
          (validArete ? `QR-${validArete}` : `QR-${found.id || animalId}`),
        nombre_alias: found.nombre_alias || null,
        nombre: found.nombre || found.nombre_alias || null,
        alias: found.alias || found.nombre_alias || null,
        raza: found.raza || "No especificada",
        sexo: isMale ? "Macho" : "Hembra",
        fechaNacimiento: found.fecha_nacimiento || null,
        etapa: found.estado || (isMale ? (isCeba ? "Ceba" : "Reproductor") : "Activa"),
        estadoSalud: found.estado || "Óptimo",
        pesoActual: found.peso_actual_kg ?? null,
        ultimoTratamiento: ultimoTrat,
        estadoReproductivo: repStatus,
        diasGestacion: diasGest,
        lote: found.corral_codigo ? `Corral ${found.corral_codigo}` : "Sin corral asignado",
        corral_codigo: found.corral_codigo || null,
        tratamientos: realTreatments,
        historial_medico: realTreatments,
      });

      setIsLoading(false);
    }

    loadProfile();
  }, [animalId]);

  const animal = animalData || {};
  const isMacho = (animal.sexo || "").toLowerCase() === "macho";
  const isSemental = isMacho && (
    (animal.estadoReproductivo && (
      animal.estadoReproductivo.toLowerCase().includes("semental") ||
      animal.estadoReproductivo.toLowerCase().includes("reproductor")
    )) ||
    (animal.etapa && animal.etapa.toLowerCase().includes("reproduc")) ||
    (!["engorde", "ceba", "precebo", "levante"].includes((animal.etapa || "").toLowerCase()) &&
     !(animal.estadoReproductivo || "").toLowerCase().includes("ceba") &&
     !(animal.estadoReproductivo || "").toLowerCase().includes("no reproductor"))
  );

  const calcularEdad = (fecha) => {
    if (!fecha) return "No registrada";
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    if (isNaN(nacimiento.getTime())) return "No registrada";
    const meses =
      (hoy.getFullYear() - nacimiento.getFullYear()) * 12 +
      hoy.getMonth() -
      nacimiento.getMonth();
    return `${Math.max(0, meses)} meses`;
  };

  const [activeTab, setActiveTab] = useState("resumen");

  // Funciones de tabs
  const renderTabResumen = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <Card className="bg-slate-50 border border-slate-100 shadow-none rounded-2xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              {isMacho ? "Aptitud Zootécnica" : "Estado Reproductivo"}
            </p>
            <p className="mt-2 text-xl font-black text-slate-900">
              {isMacho
                ? (isSemental ? "Semental Reproductor" : "Línea de Ceba / Levante")
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

  const renderTabSalud = () => {
    const birthDate = animal.fechaNacimiento ? new Date(animal.fechaNacimiento) : null;
    const now = new Date();
    const edadDias = birthDate && !isNaN(birthDate.getTime())
      ? Math.max(0, Math.floor((now - birthDate) / (1000 * 60 * 60 * 24)))
      : 180;
    const edadMeses = Math.floor(edadDias / 30);

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
              onClick={() => router.push("/dashboard/health")}
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
                onAction={() => router.push("/dashboard/health")}
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
  };

  const renderTabProduccion = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <TrendingUp className="text-blue-500" /> Curva de Crecimiento y Pesajes del Ejemplar
        </h3>
        {pesajes.length === 0 ? (
          <div className="py-6">
            <EmptyState
              icon={Scale}
              title="Sin lecturas de peso registradas"
              description="Aún no se han registrado lecturas de peso (manuales o por visión artificial) para este ejemplar en la base de datos."
              actionLabel="+ Registrar Pesaje"
              onAction={() => router.push("/dashboard/weight")}
            />
          </div>
        ) : (
          <>
            <Card className="bg-slate-50 border border-slate-100 shadow-none h-64 relative overflow-hidden flex flex-col justify-end p-0 rounded-2xl">
              <svg
                className="w-full h-48"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {pesajes.map((pt, idx) => {
                  const x = (idx / Math.max(1, pesajes.length - 1)) * 100;
                  const maxW = Math.max(...pesajes.map((p) => Number(p.peso_kg) || 120), 100);
                  const y = 100 - ((Number(pt.peso_kg) || 0) / maxW) * 80;
                  return (
                    <circle
                      key={idx}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="4"
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  );
                })}
                <polyline
                  points={pesajes
                    .map((pt, idx) => {
                      const x = (idx / Math.max(1, pesajes.length - 1)) * 100;
                      const maxW = Math.max(...pesajes.map((p) => Number(p.peso_kg) || 120), 100);
                      const y = 100 - ((Number(pt.peso_kg) || 0) / maxW) * 80;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="absolute top-4 right-6 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-sm text-xs font-bold space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-blue-500 rounded-full"></div> Registros de Báscula / IA ({pesajes.length})
                </div>
              </div>
            </Card>

            <div className="border border-slate-100 rounded-3xl overflow-hidden mt-6">
              <Table
                columns={[
                  {
                    header: "Fecha de Pesaje",
                    key: "tiempo",
                    render: (r) => formatDateTime(r.tiempo),
                  },
                  {
                    header: "Peso Registrado",
                    key: "peso_kg",
                    render: (r) => (
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {r.peso_kg} kg
                      </span>
                    ),
                  },
                  {
                    header: "Método",
                    key: "metodo",
                    render: (r) => (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {r.metodo === "ia_vision" ? "Visión IA" : "Báscula Manual"}
                      </span>
                    ),
                  },
                  {
                    header: "Observaciones",
                    key: "observaciones",
                    render: (r) => r.observaciones || "Control periódico",
                  },
                ]}
                rows={pesajes}
              />
            </div>
          </>
        )}
      </div>
    );
  };

  const renderTabReproduccion = () => {
    // Si es macho de ceba/engorde: EmptyState con redirección a producción
    if (isMacho && !isSemental) {
      return (
        <div className="py-14 px-6 flex flex-col items-center justify-center text-center max-w-lg mx-auto bg-slate-50/70 border border-slate-200/80 rounded-3xl my-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 shadow-xs">
            <Scale className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 mb-2">
            Línea de Engorde / Ceba
          </span>
          <h4 className="text-xl font-black text-slate-900 tracking-tight">
            Seguimiento Reproductivo No Aplicable
          </h4>
          <p className="text-sm text-slate-600 font-semibold mt-2 leading-relaxed">
            Seguimiento reproductivo no aplicable para machos en línea de producción/ceba.
          </p>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Este ejemplar pertenece a la línea comercial de engorde y levante. Su rendimiento zootécnico se evalúa mediante la curva de peso, ganancia media diaria (GMD) y eficiencia alimenticia.
          </p>
          <div className="mt-6">
            <Button
              tone="primary"
              onClick={() => setActiveTab("produccion")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md cursor-pointer"
            >
              <TrendingUp size={16} /> Ver Producción y Curva de Peso (GMD)
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      );
    }

    // Si es macho reproductor / semental: Servicios y Coberturas
    if (isMacho && isSemental) {
      if (coberturas.length === 0) {
        return (
          <div className="py-6">
            <EmptyState
              icon={Heart}
              title="Sin servicios o coberturas registradas"
              description="No se han registrado montas naturales ni inseminaciones artificiales para este semental en la base de datos."
              actionLabel="+ Registrar Servicio"
              onAction={() => router.push("/dashboard/reproduction")}
            />
          </div>
        );
      }

      const totalServicios = coberturas.length;
      const confirmadosCount = coberturas.filter(
        (c) => c.estado_confirmacion === "positiva"
      ).length;
      const efectividadTasa = Math.round((confirmadosCount / totalServicios) * 100);

      const rowsToShow = coberturas.map((c) => ({
        fecha_servicio: c.fecha_servicio,
        hembra: c.hembra_alias || c.hembra_arete || "Cerda Reproductora",
        metodo:
          c.tipo_servicio === "inseminacion_artificial"
            ? "Inseminación Artificial"
            : "Monta Natural",
        estado:
          c.estado_confirmacion === "positiva"
            ? "Confirmada (Positiva)"
            : c.estado_confirmacion === "negativa"
            ? "Negativa (Vacía)"
            : "Pendiente Diagnóstico",
        estado_badge:
          c.estado_confirmacion === "positiva"
            ? "bg-emerald-100 text-emerald-700"
            : c.estado_confirmacion === "negativa"
            ? "bg-rose-100 text-rose-700"
            : "bg-amber-100 text-amber-700",
      }));

      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                  <Award size={18} />
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Servicios y Coberturas del Semental
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Historial de montas naturales e inseminaciones asistidas por este reproductor
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/reproduction")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl! px-3.5 py-2 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Heart size={14} className="mr-1.5" /> Nuevo Servicio
            </Button>
          </div>

          {/* Tarjetas de Métricas del Semental */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-none">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Coberturas
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {totalServicios}
              </p>
              <span className="text-[11px] font-semibold text-slate-400">
                Servicios registrados
              </span>
            </Card>

            <Card className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-none">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tasa de Fertilidad / Efectividad
              </p>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {efectividadTasa}%
              </p>
              <span className="text-[11px] font-semibold text-emerald-600/80">
                Gestaciones confirmadas
              </span>
            </Card>

            <Card className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-none">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Aptitud Reproductiva
              </p>
              <p className="text-lg font-black text-indigo-700 mt-1">
                Semental Activo
              </p>
              <span className="text-[11px] font-semibold text-indigo-600">
                Apto para empadre
              </span>
            </Card>
          </div>

          {/* Tabla de Servicios y Coberturas */}
          <div className="border border-slate-100 rounded-3xl overflow-hidden">
            <Table
              columns={[
                { header: "Fecha de Servicio", key: "fecha_servicio" },
                { header: "Hembra Servida", key: "hembra" },
                { header: "Método de Servicio", key: "metodo" },
                {
                  header: "Efectividad / Diagnóstico",
                  key: "estado",
                  render: (row) => (
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${row.estado_badge}`}
                    >
                      {row.estado}
                    </span>
                  ),
                },
              ]}
              rows={rowsToShow}
            />
          </div>
        </div>
      );
    }

    // Si es Hembra: Partos e Historial de Gestación
    const cols = [
      {
        header: "Fecha de Parto",
        key: "fecha_parto",
        render: (r) => (r.fecha_parto ? r.fecha_parto.split("T")[0] : "--"),
      },
      { header: "Nacidos Vivos", key: "nacidos_vivos" },
      {
        header: "Muertos / Momias",
        key: "nacidos_muertos",
        render: (r) => `${r.nacidos_muertos || 0} / ${r.momias || 0}`,
      },
      {
        header: "Peso Camada (kg)",
        key: "peso_camada_total_kg",
        render: (r) => (r.peso_camada_total_kg ? `${r.peso_camada_total_kg} kg` : "--"),
      },
      {
        header: "Observaciones",
        key: "observaciones",
        render: (r) => r.observaciones || "Parto sin incidencias",
      },
    ];

    const diasG = animal.diasGestacion ?? 0;
    const progresoG = Math.round((diasG / 114) * 100);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900">
            Historial de Partos y Ciclo de Gestación
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-500">
              Ciclos completados: {partos.length}
            </span>
            {diasG > 0 && (
              <div className="bg-fuchsia-100 text-fuchsia-700 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5">
                <Baby size={16} /> Gestación actual: Día {diasG} de 114
              </div>
            )}
          </div>
        </div>

        {diasG > 0 ? (
          <div className="mb-8">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
              <span>Servicio (Día 0)</span>
              <span>Progreso: {progresoG}%</span>
              <span>Parto (Día 114)</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-fuchsia-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, progresoG)}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-fuchsia-50/70 border border-fuchsia-200/60 rounded-2xl text-xs font-semibold text-fuchsia-900 flex items-center gap-2">
            <Heart size={16} className="text-fuchsia-600 shrink-0" />
            Hembra sin gestación activa en este momento. La barra de gestación (114 días) se activará automáticamente al registrar y confirmar un servicio.
          </div>
        )}

        {partos.length === 0 ? (
          <div className="py-6">
            <EmptyState
              icon={Baby}
              title="Sin historial de partos registrado"
              description="No se han registrado partos ni camadas para esta hembra en la base de datos de PostgreSQL."
              actionLabel="+ Registrar Parto o Servicio"
              onAction={() => router.push("/dashboard/reproduction")}
            />
          </div>
        ) : (
          <div className="border border-slate-100 rounded-4xl overflow-hidden">
            <Table columns={cols} rows={partos} />
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-4xl" />
        <Skeleton className="h-96 w-full rounded-4xl" />
      </div>
    );
  }

  if (error || !animalData) {
    return (
      <div className="w-full flex flex-col gap-6 text-slate-900">
        <button
          onClick={() => router.push("/dashboard/animals")}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer w-fit"
        >
          <ChevronLeft size={16} /> Volver a Registro de Animales
        </button>
        <div className="bg-white border border-slate-100 rounded-4xl p-12 shadow-sm">
          <EmptyState
            icon={AlertCircle}
            title="Animal no encontrado en la base de datos"
            description={
              error ||
              "El identificador o arete consultado no corresponde a ningún animal registrado en la base de datos de PostgreSQL."
            }
            actionLabel="Volver al Listado de Animales"
            onAction={() => router.push("/dashboard/animals")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 text-slate-900">
      {/* Botón Volver a Gestión de Animales */}
      <button
        onClick={() => router.push("/dashboard/animals")}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer w-fit no-print"
      >
        <ChevronLeft size={16} /> Volver a Registro de Animales
      </button>

      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="EXPEDIENTE BIOLÓGICO"
        title={`Hoja de Vida Porcina: ${getAnimalDisplayName(animal)}`}
        description={`${animal.raza} • ${animal.sexo} • Edad: ${calcularEdad(animal.fechaNacimiento)} • ${animal.lote}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              tone="soft"
              onClick={() => setIsQrModalOpen(true)}
              className="flex items-center gap-1.5 font-bold text-xs px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer shadow-xs"
            >
              <QrCode size={14} /> Chapeta QR
            </Button>
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {getAnimalDisplayName(animal)}
                    </h3>
                    {animal.codigo_arete && !UUID_REGEX.test(animal.codigo_arete) && (
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                        #{animal.codigo_arete}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    {isMacho ? (
                      <>
                        Propósito zootécnico:{" "}
                        <span className="font-bold text-slate-800">
                          {isSemental ? "Semental Reproductor" : "Línea de Ceba / Levante"}
                        </span>
                      </>
                    ) : (
                      <>
                        Historial reproductivo:{" "}
                        <span className="font-bold text-slate-800">{animal.estadoReproductivo}</span>
                      </>
                    )}
                  </p>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">
                    Último tratamiento:{" "}
                    <span className={tratamientos.length > 0 ? "font-bold text-slate-800" : "italic text-slate-500"}>
                      {animal.ultimoTratamiento}
                    </span>
                  </p>
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className="flex flex-col gap-3 min-w-50 w-full md:w-auto">
                <Button
                  onClick={() => setIsQrModalOpen(true)}
                  className="w-full justify-start gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl! shadow-md border-none cursor-pointer"
                >
                  <QrCode size={16} /> Ver / Imprimir Chapeta QR
                </Button>
                <Button
                  onClick={() => router.push("/dashboard/weight")}
                  className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl! shadow-md border-none cursor-pointer"
                >
                  <Scale size={16} /> Registrar Pesaje
                </Button>
                <Button
                  onClick={() => router.push("/dashboard/health")}
                  className="w-full justify-start gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl! border border-slate-200 shadow-none cursor-pointer"
                >
                  <Plus size={16} /> Añadir Tratamiento
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
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                      : "text-slate-600 hover:bg-slate-100"
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

      <AnimalQrModal
        animal={animal}
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
    </div>
  );
}
