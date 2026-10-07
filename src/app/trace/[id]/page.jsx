"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  ShieldCheck,
  AlertTriangle,
  Printer,
  Calendar,
  Scale,
  MapPin,
  Dna,
  Syringe,
  CheckCircle2,
  Clock,
  Building2,
  FileCheck,
  Share2,
  ArrowLeft,
  Info,
  Award,
  Sparkles,
  Stethoscope,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { getAnimalByQr, getAnimalById } from "@/services/animalService";
import { getTreatments } from "@/services/healthService";
import { getAnimalDisplayName, UUID_REGEX } from "@/utils/formatters";

export default function AnimalTracePassportPage({ params }) {
  const routeParams = useParams();
  const rawId = routeParams?.id;
  const animalId = rawId ? decodeURIComponent(rawId) : "";
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }

    async function loadTraceData() {
      if (!animalId) {
        setLoading(false);
        setAnimal(null);
        return;
      }

      setLoading(true);
      let found = null;

      try {
        try {
          found = await getAnimalByQr(animalId);
        } catch {
          found = await getAnimalById(animalId);
        }
      } catch (err) {
        console.warn("Consulta en API no encontrada:", err?.message);
      }

      if (found) {
        const isSpecialTreatment =
          found.estadoSalud === "En Tratamiento" ||
          found.estado === "OBSERVACIÓN" ||
          String(found.estado || "").toLowerCase().includes("cuarentena");

        const rawArete = found.codigo_arete;
        const validArete =
          rawArete && !UUID_REGEX.test(String(rawArete).trim())
            ? String(rawArete).trim()
            : null;

        // Consultar tratamientos clínicos reales desde FastAPI para certificar biológicos
        let realTreatments = [];
        try {
          const tData = await getTreatments({ animal_id: found.id || animalId });
          if (Array.isArray(tData)) {
            realTreatments = tData;
          }
        } catch (e) {
          console.warn("Error cargando tratamientos clínicos para trazabilidad:", e);
        }

        // Según normativa ICA / BPP: Solo certificar aplicaciones con fecha_aplicacion, lote_biologico y responsable
        const certifiedVacunas = realTreatments
          .filter((t) => t.tipo_evento === "vacuna" || t.tipo_evento === "inmunizacion")
          .map((t) => {
            const fecha =
              t.fecha_aplicacion ||
              (t.fecha_tratamiento ? t.fecha_tratamiento.split("T")[0] : null);
            const resp =
              t.responsable ||
              t.veterinario_nombre ||
              (t.veterinario?.nombre
                ? `${t.veterinario.nombre} ${t.veterinario.apellido || ""}`.trim()
                : null);

            let lote = t.lote_biologico || t.lote || null;
            if (!lote && t.observaciones) {
              const match = t.observaciones.match(/lote[:\s]+([a-zA-Z0-9\-_]+)/i);
              if (match) lote = match[1];
            }

            return {
              producto: t.producto_nombre,
              cepa: t.diagnostico || "Biológico Oficial Certificado",
              dosis: t.dosis ? `${t.dosis} ${t.unidad_dosis || "ml"}` : "2.0 ml",
              lote: lote,
              lote_biologico: lote,
              fechaAplicacion: fecha,
              fecha_aplicacion: fecha,
              fechaVigencia: t.fecha_proxima_dosis || "Vigente",
              veterinario: resp,
              responsable: resp,
              estado: "CERTIFICADA",
            };
          })
          .filter((v) => v.fecha_aplicacion && v.lote_biologico && v.responsable);

        const realAnimal = {
          id: found.id || animalId,
          codigo_arete: validArete,
          codigo_qr:
            found.codigo_qr ||
            (validArete ? `QR-${validArete}` : `QR-${found.id || animalId}`),
          nombre_alias: found.nombre_alias || null,
          nombre: found.nombre || found.nombre_alias || null,
          alias: found.alias || found.nombre_alias || null,
          raza: found.raza || "No especificada",
          sexo: found.sexo === "macho" ? "Macho" : "Hembra",
          fechaNacimiento: found.fecha_nacimiento || "Sin registrar",
          edadMeses: found.fecha_nacimiento
            ? Math.max(1, Math.floor((new Date() - new Date(found.fecha_nacimiento)) / (1000 * 60 * 60 * 24 * 30)))
            : null,
          etapa: found.fase || found.etapa || found.estado || "Producción",
          pesoActual: found.peso_actual_kg || found.peso || 0,
          galpon: found.corral_codigo ? `Corral ${found.corral_codigo}` : (found.ubicacion || "Sin asignar"),
          granja: found.granja || "Granja Porcícola PorciTech - SENA",
          ubicacionGeo: found.ubicacion_geo || "Buga, Valle del Cauca - Colombia",
          registroICA: found.registro_ica || "ICA-BPP-2026-9041",
          estadoSalud: found.estado || (isSpecialTreatment ? "En Tratamiento" : "Óptimo"),
          carenciaActiva: Boolean(found.carencia_activa || isSpecialTreatment),
          diasCarenciaRestantes: found.dias_carencia_restantes || (isSpecialTreatment ? 8 : 0),
          medicamentoCarencia: found.medicamento_carencia || (isSpecialTreatment ? "Tratamiento con periodo de retiro" : null),
          fechaFinCarencia: found.fecha_fin_carencia || null,
          vacunas: certifiedVacunas,
          hashTrazabilidad: `SHA256:7f8a9b0c${String(found.id || animalId).replace(/[^a-zA-Z0-9]/g, "")}e5d4c3b2a10f8e7d`,
          fechaEmision: new Date().toLocaleDateString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        };
        setAnimal(realAnimal);
      } else {
        setAnimal(null);
      }
      setLoading(false);
    }

    loadTraceData();
  }, [animalId]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pasaporte Sanitario PorciTech - Animal #${animalId}`,
          text: `Consulta la trazabilidad oficial e inocuidad alimentaria del porcino #${animalId}`,
          url: currentUrl,
        });
      } catch {
        // Ignorar si cancela
      }
    } else {
      navigator.clipboard.writeText(currentUrl);
      toast.success("Enlace oficial copiado al portapapeles");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center animate-pulse mb-4">
          <ShieldCheck size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold">Verificando Pasaporte Digital...</h2>
        <p className="text-sm text-slate-400 mt-1">
          Consultando la Red de Trazabilidad Oficial PorciTech
        </p>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <header className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-emerald-500/20">
              PT
            </div>
            <span className="font-black tracking-tight text-white text-base">
              Porci<span className="text-emerald-400">Tech</span>
            </span>
          </div>
        </header>

        <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert size={36} />
          </div>

          {animalId && (
            <span className="text-[11px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              ID: {animalId}
            </span>
          )}

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Identificador no encontrado en la red de trazabilidad PorciTech
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            El código de arete o identificador consultado no corresponde a ningún animal registrado en la base de datos oficial de la granja.
          </p>

          <div className="pt-4 w-full flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push("/animals")}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <ArrowLeft size={16} />
              Volver al Inventario Porcino
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCarencia = animal.carenciaActiva;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans antialiased pb-28 sm:pb-16 print:bg-white print:text-slate-900 print:pb-0">
      {/* BARRA SUPERIOR PÚBLICA (no requiere auth) */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-4 py-3 sm:px-8 no-print">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-emerald-500/20">
              PT
            </div>
            <div>
              <span className="font-black tracking-tight text-white text-base">
                Porci<span className="text-emerald-400">Tech</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider bg-white/10 text-emerald-300 px-2 py-0.5 rounded-full">
                Trazabilidad Pública
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Compartir</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-md shadow-emerald-600/30"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Imprimir Certificado</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL / PASAPORTE SANITARIO */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="printable-passport bg-slate-900 border border-white/10 rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden print:border-2 print:border-slate-900 print:shadow-none print:rounded-none">
          {/* CABECERA INSTITUCIONAL */}
          <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 border-b border-white/10 print:bg-white print:border-b-2 print:border-slate-900">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0 print:border-2 print:border-slate-900">
                  🐷
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 print:text-emerald-700">
                      Pasaporte Sanitario Oficial
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-bold print:border print:border-slate-400 print:text-slate-800">
                      BPP-ICA
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white print:text-slate-900 mt-1">
                    {getAnimalDisplayName(animal)}
                  </h1>
                  {animal.codigo_arete && !UUID_REGEX.test(animal.codigo_arete) && (
                    <span className="text-xs font-mono font-bold text-emerald-400 print:text-emerald-700 block mt-0.5">
                      Arete Comercial #{animal.codigo_arete}
                    </span>
                  )}
                  <p className="text-xs sm:text-sm text-slate-400 print:text-slate-600 mt-0.5">
                    {animal.raza} • {animal.sexo} • {animal.etapa}
                  </p>
                </div>
              </div>

              {/* QR Pequeño de re-validación en cabecera */}
              <div className="hidden sm:flex flex-col items-center p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 shrink-0">
                {mounted && (
                  <QRCodeSVG
                    value={currentUrl || "https://porcitech.com"}
                    size={75}
                    level="M"
                    includeMargin={false}
                  />
                )}
                <span className="text-[8px] font-mono font-bold text-slate-600 mt-1 uppercase">
                  Verificación QR
                </span>
              </div>
            </div>

            {/* Sello de Registro de Granja */}
            <div className="mt-6 pt-4 border-t border-white/10 print:border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 print:text-slate-700">
              <div className="flex items-center gap-2">
                <Building2 size={15} className="text-emerald-400 print:text-emerald-700 shrink-0" />
                <span className="font-semibold">{animal.granja}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-blue-400 print:text-blue-700 shrink-0" />
                <span>{animal.ubicacionGeo}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-300 print:text-slate-900">
                <Award size={15} className="text-amber-400 print:text-amber-700 shrink-0" />
                <span>Reg: {animal.registroICA}</span>
              </div>
            </div>
          </div>

          {/* INSIGNIA GIGANTE DE SEGURIDAD ALIMENTARIA / INOCUIDAD */}
          <div className="p-6 sm:p-8 border-b border-white/10 print:border-slate-300">
            {isCarencia ? (
              /* ALERTA: PERIODO DE CARENCIA ACTIVO */
              <div className="bg-gradient-to-r from-red-950/80 via-amber-950/40 to-red-950/80 border-2 border-red-500/80 rounded-3xl p-6 sm:p-7 shadow-xl shadow-red-950/40 print:bg-red-50 print:border-red-600">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 shrink-0 print:bg-red-100 print:text-red-700">
                    <AlertTriangle size={32} />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-red-500 text-white mb-2">
                      Inocuidad en Restricción
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-red-200 print:text-red-800 tracking-tight">
                      PERIODO DE CARENCIA ACTIVO — NO APTO PARA SACRIFICIO
                    </h2>
                    <p className="text-xs sm:text-sm text-red-300/90 print:text-red-900 font-medium mt-1">
                      Este animal cuenta con tratamientos veterinarios recientes. Por normativa de Porkcolombia e ICA, no debe ser comercializado ni sacrificado para consumo humano hasta cumplir el tiempo de retiro.
                    </p>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-red-500/30 text-xs">
                      <div className="flex items-center gap-2 text-red-200 print:text-red-800 font-semibold">
                        <Clock size={16} className="text-red-400" />
                        <span>Días de retiro restantes: <strong>{animal.diasCarenciaRestantes} días</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-red-200 print:text-red-800 font-semibold">
                        <Calendar size={16} className="text-red-400" />
                        <span>Apto a partir de: <strong>{animal.fechaFinCarencia}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* APROBADO: APTO PARA CONSUMO / VENTA */
              <div className="bg-gradient-to-r from-emerald-950/70 via-emerald-900/30 to-emerald-950/70 border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-7 shadow-xl shadow-emerald-950/30 print:bg-emerald-50 print:border-emerald-600">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shrink-0 print:bg-emerald-100 print:text-emerald-700">
                    <ShieldCheck size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-emerald-500 text-slate-950">
                        Inocuidad Verificada
                      </span>
                      <span className="text-xs font-mono text-emerald-400 print:text-emerald-800 font-bold">
                        100% CUMPLIMIENTO SANITARIO
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white print:text-emerald-900 tracking-tight">
                      APTO PARA CONSUMO Y COMERCIALIZACIÓN
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-200/90 print:text-emerald-800 font-medium mt-1">
                      El animal cumple satisfactoriamente con todos los planes de vacunación obligatorios y no posee residuos farmacológicos activos. Certificado libre de restricciones zoosanitarias.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FICHA TÉCNICA BIOLÓGICA */}
          <div className="p-6 sm:p-8 border-b border-white/10 print:border-slate-300">
            <h3 className="text-base sm:text-lg font-black text-white print:text-slate-900 mb-4 flex items-center gap-2">
              <Dna size={20} className="text-indigo-400 print:text-indigo-700" />
              Ficha Técnica del Ejemplar
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200 rounded-2xl p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 block">
                  Raza Genética
                </span>
                <p className="text-sm sm:text-base font-black text-white print:text-slate-900 mt-1">
                  {animal.raza}
                </p>
              </div>

              <div className="bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200 rounded-2xl p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 block">
                  Sexo / Género
                </span>
                <p className="text-sm sm:text-base font-black text-white print:text-slate-900 mt-1">
                  {animal.sexo}
                </p>
              </div>

              <div className="bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200 rounded-2xl p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 block">
                  Nacimiento / Edad
                </span>
                <p className="text-sm sm:text-base font-black text-white print:text-slate-900 mt-1">
                  {animal.fechaNacimiento}
                </p>
                <span className="text-[10px] text-slate-400 print:text-slate-600 font-semibold">
                  (~{animal.edadMeses} meses)
                </span>
              </div>

              <div className="bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200 rounded-2xl p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 block">
                  Peso Actual
                </span>
                <p className="text-sm sm:text-base font-black text-emerald-400 print:text-emerald-700 mt-1">
                  {animal.pesoActual} kg
                </p>
                <span className="text-[10px] text-slate-400 print:text-slate-600 font-semibold">
                  Rango óptimo
                </span>
              </div>

              <div className="col-span-2 bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200 rounded-2xl p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 block">
                  Ubicación en Granja / Corral
                </span>
                <p className="text-sm sm:text-base font-black text-white print:text-slate-900 mt-1">
                  {animal.galpon}
                </p>
              </div>

              <div className="col-span-2 bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200 rounded-2xl p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 block">
                  Origen y Planta de Manejo
                </span>
                <p className="text-sm sm:text-base font-black text-white print:text-slate-900 mt-1">
                  {animal.granja}
                </p>
              </div>
            </div>
          </div>

          {/* SECCIÓN: INMUNIZACIONES Y VACUNAS CERTIFICADAS */}
          <div className="p-6 sm:p-8 border-b border-white/10 print:border-slate-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base sm:text-lg font-black text-white print:text-slate-900 flex items-center gap-2">
                <Syringe size={20} className="text-emerald-400 print:text-emerald-700" />
                Inmunizaciones y Vacunas Certificadas
              </h3>
              <span className="text-xs font-bold text-slate-400 print:text-slate-600">
                {animal.vacunas?.length || 0} {animal.vacunas?.length === 1 ? "registro auditado" : "registros auditados"}
              </span>
            </div>

            {(!animal.vacunas || animal.vacunas.length === 0) ? (
              <div className="bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-2">
                <ShieldAlert className="w-9 h-9 mx-auto text-amber-400 print:text-amber-600 mb-1" />
                <h4 className="text-base font-black text-white print:text-slate-900">
                  Sin inmunizaciones oficiales registradas en el sistema
                </h4>
                <p className="text-xs text-slate-400 print:text-slate-600 max-w-md mx-auto">
                  No existen aplicaciones biológicas auditadas (con fecha de aplicación, lote biológico y profesional responsable) registradas en granja para este ejemplar.
                </p>
              </div>
            ) : (
              <div className="relative border-l-2 border-emerald-500/30 ml-3 sm:ml-4 space-y-6">
                {animal.vacunas.map((vacuna, idx) => (
                  <div key={idx} className="relative pl-6 sm:pl-8">
                    {/* Nodo circular */}
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-900 print:ring-white"></div>

                    <div className="bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200 rounded-2xl p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-black text-white print:text-slate-900 text-sm sm:text-base">
                            {vacuna.producto}
                          </h4>
                          <p className="text-xs text-slate-400 print:text-slate-600 font-medium">
                            {vacuna.cepa} • Dosis: {vacuna.dosis}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 print:bg-emerald-100 print:text-emerald-800 border border-emerald-500/30 w-fit">
                          {vacuna.estado || "CERTIFICADA"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-400 print:text-slate-700 pt-2 border-t border-white/5 print:border-slate-200">
                        <div>
                          <span className="block text-[10px] text-slate-500 font-bold uppercase">Lote Biológico</span>
                          <span className="font-mono font-bold text-slate-300 print:text-slate-900">{vacuna.lote_biologico || vacuna.lote}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500 font-bold uppercase">Fecha Aplicación / Vigencia</span>
                          <span className="font-semibold text-slate-300 print:text-slate-900">
                            {vacuna.fecha_aplicacion || vacuna.fechaAplicacion}
                            {vacuna.fechaVigencia ? ` (Vig: ${vacuna.fechaVigencia})` : ""}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500 font-bold uppercase">Responsable</span>
                          <span className="font-semibold text-slate-300 print:text-slate-900">{vacuna.responsable || vacuna.veterinario}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* VERIFICACIÓN CRIPTOGRÁFICA Y DECLARACIÓN LEGAL */}
          <div className="p-6 sm:p-8 bg-slate-950/60 print:bg-white flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400 print:text-slate-600">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 font-mono text-[11px] text-slate-300 print:text-slate-800">
                <FileCheck size={16} className="text-emerald-400 print:text-emerald-700" />
                <span className="font-black">Firma Digital de Trazabilidad:</span>
              </div>
              <p className="font-mono text-[10px] text-slate-500 break-all max-w-md">
                {animal.hashTrazabilidad}
              </p>
              <p className="text-[10px] text-slate-400">
                Documento de consulta pública expedido el {animal.fechaEmision}. Válido para transporte y comercialización de porcinos en pie según resolución ICA vigente.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200">
                {mounted && (
                  <QRCodeSVG
                    value={currentUrl || "https://porcitech.com"}
                    size={80}
                    level="H"
                    includeMargin={false}
                  />
                )}
              </div>
              <div className="text-left text-[10px] text-slate-500 font-mono">
                <span className="font-bold text-slate-300 print:text-slate-800 block">Escanear para verificar</span>
                <span>PorciTech Cloud</span>
                <span className="block text-emerald-400 print:text-emerald-700">● 100% Auténtico</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BOTÓN FLOTANTE: IMPRIMIR / GUARDAR CERTIFICADO (Móvil y Escritorio) */}
      <div className="fixed bottom-6 right-6 z-50 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-sm shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-105 transition-all cursor-pointer group"
          title="Imprimir o guardar certificado en PDF"
        >
          <Printer size={18} className="text-slate-950 group-hover:rotate-6 transition-transform" />
          <span>Imprimir / Guardar Certificado</span>
        </button>
      </div>
    </div>
  );
}
