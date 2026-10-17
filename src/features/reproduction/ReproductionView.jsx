"use client";

import React, { useState } from "react";
import {
  Heart,
  Baby,
  Activity,
  Plus,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import ModuleHeader from "@/components/layout/ModuleHeader";
import { UUID_REGEX } from "@/utils/formatters";
import {
  createService,
  updateService,
  createFarrowing,
  createWeaning,
} from "@/services/reproductionService";

import { useReproductionData } from "./hooks/useReproductionData";
import ReproductionKPIs from "./components/ReproductionKPIs";
import ServicesTab from "./components/ServicesTab";
import FarrowingsTab from "./components/FarrowingsTab";
import WeaningsTab from "./components/WeaningsTab";
import ServiceModal from "./components/ServiceModal";
import DiagnoseModal from "./components/DiagnoseModal";
import FarrowingModal from "./components/FarrowingModal";
import WeaningModal from "./components/WeaningModal";

export default function ReproductionView() {
  const [activeTab, setActiveTab] = useState("services");

  // Hook maestro de datos y KPIs
  const {
    services,
    farrowings,
    weanings,
    females,
    males,
    corrales,
    breedingMales,
    confirmedFemales,
    isLoading,
    isRefreshing,
    error,
    gestacionesConfirmadas,
    proximosPartos,
    totalNacidosVivos,
    totalDestetados,
    loadReproductionData,
  } = useReproductionData();

  // Estados de Modales
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isFarrowingModalOpen, setIsFarrowingModalOpen] = useState(false);
  const [isWeaningModalOpen, setIsWeaningModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Diagnosticar Gestación
  const [selectedServiceForDiagnose, setSelectedServiceForDiagnose] = useState(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // 1. Envío de Nuevo Servicio
  const handleCreateServiceSubmit = async (serviceForm) => {
    if (!serviceForm.hembra_id) {
      toast.error("Seleccione la cerda reproductora");
      return false;
    }
    if (
      serviceForm.tipo_servicio === "monta_natural" &&
      !serviceForm.macho_id
    ) {
      toast.error("Seleccione el macho semental para la monta natural");
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        hembra_id: serviceForm.hembra_id,
        tipo_servicio: serviceForm.tipo_servicio,
        fecha_servicio: serviceForm.fecha_servicio,
        estado_confirmacion: serviceForm.estado_confirmacion,
      };

      if (serviceForm.tipo_servicio === "monta_natural" && serviceForm.macho_id) {
        payload.macho_id = serviceForm.macho_id;
      }
      if (
        serviceForm.tipo_servicio === "inseminacion_artificial" &&
        serviceForm.codigo_pajilla_macho.trim()
      ) {
        payload.codigo_pajilla_macho = serviceForm.codigo_pajilla_macho.trim();
      }

      await createService(payload);
      toast.success("Servicio reproductivo registrado exitosamente");
      setIsServiceModalOpen(false);
      await loadReproductionData(false);
      return true;
    } catch (err) {
      console.error("Error al registrar servicio:", err);
      toast.error(err.message || "Fallo al registrar el servicio reproductivo");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Abrir Modal de Diagnóstico
  const handleOpenDiagnoseModal = (service) => {
    if (service.hembra_sexo && service.hembra_sexo.toLowerCase() !== "hembra") {
      toast.error("El diagnóstico de preñez solo es aplicable a hembras reproductoras.");
      return;
    }
    setSelectedServiceForDiagnose(service);
  };

  // 3. Enviar Diagnóstico de Gestación
  const handleDiagnoseSubmit = async (service, diagnoseForm) => {
    if (!service) return;

    setIsDiagnosing(true);
    try {
      await updateService(service.id, {
        estado_confirmacion: diagnoseForm.estado_confirmacion,
        fecha_diagnostico: diagnoseForm.fecha_diagnostico,
        observaciones: diagnoseForm.observaciones?.trim() || undefined,
      });

      const validArete =
        service.hembra_arete && !UUID_REGEX.test(service.hembra_arete)
          ? `#${service.hembra_arete}`
          : null;
      const hembraStr = service.hembra_alias || validArete || "la cerda";
      toast.success(
        `Servicio diagnosticado como "${diagnoseForm.estado_confirmacion.toUpperCase()}". ${
          diagnoseForm.estado_confirmacion === "positiva"
            ? `¡${hembraStr} ahora está registrada en gestación!`
            : ""
        }`
      );
      setSelectedServiceForDiagnose(null);
      await loadReproductionData(false);
    } catch (err) {
      console.error("Error al diagnosticar servicio:", err);
      toast.error(err.message || "Error al actualizar diagnóstico del servicio.");
    } finally {
      setIsDiagnosing(false);
    }
  };

  // 4. Envío de Registro de Parto
  const handleCreateFarrowingSubmit = async (farrowingForm) => {
    if (!farrowingForm.hembra_id) {
      toast.error("Seleccione la cerda madre");
      return false;
    }

    const hasConfirmedService = services.some(
      (s) =>
        (s.hembra_id === farrowingForm.hembra_id || s.id_cerda === farrowingForm.hembra_id) &&
        s.estado_confirmacion === "positiva"
    );
    if (!hasConfirmedService) {
      toast.error(
        "Validación Zootécnica: Solo se pueden registrar partos para hembras con servicio previo confirmado positivo."
      );
      return false;
    }
    const vivos = parseInt(farrowingForm.nacidos_vivos, 10);
    if (isNaN(vivos) || vivos < 0) {
      toast.error("Ingrese una cantidad válida de lechones vivos (>= 0)");
      return false;
    }
    const pesoTotal = parseFloat(farrowingForm.peso_camada_total_kg);
    if (isNaN(pesoTotal) || pesoTotal <= 0) {
      toast.error("El peso total de la camada debe ser mayor a 0 kg");
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        hembra_id: farrowingForm.hembra_id,
        fecha_parto: farrowingForm.fecha_parto,
        nacidos_vivos: vivos,
        nacidos_muertos: parseInt(farrowingForm.nacidos_muertos || "0", 10),
        momias: parseInt(farrowingForm.momias || "0", 10),
        peso_camada_total_kg: pesoTotal,
        observaciones: farrowingForm.observaciones.trim() || undefined,
      };

      if (farrowingForm.servicio_id) payload.servicio_id = farrowingForm.servicio_id;
      if (farrowingForm.corral_maternidad_id) {
        payload.corral_maternidad_id = farrowingForm.corral_maternidad_id;
      }

      await createFarrowing(payload);
      toast.success("Parto y camada registrados en PostgreSQL");
      setIsFarrowingModalOpen(false);
      await loadReproductionData(false);
      return true;
    } catch (err) {
      console.error("Error al registrar parto:", err);
      toast.error(err.message || "Fallo al registrar el parto");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Envío de Registro de Destete
  const handleCreateWeaningSubmit = async (weaningForm) => {
    if (!weaningForm.hembra_id) {
      toast.error("Seleccione la cerda madre");
      return false;
    }
    if (!weaningForm.corral_destino_id) {
      toast.error("Seleccione el corral de destino para los lechones");
      return false;
    }
    const lechones = parseInt(weaningForm.lechones_destetados, 10);
    if (isNaN(lechones) || lechones <= 0) {
      toast.error("La cantidad de lechones destetados debe ser mayor a 0");
      return false;
    }
    const peso = parseFloat(weaningForm.peso_total_kg);
    if (isNaN(peso) || peso <= 0) {
      toast.error("El peso total de los lechones destetados debe ser mayor a 0");
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        hembra_id: weaningForm.hembra_id,
        corral_destino_id: weaningForm.corral_destino_id,
        fecha_destete: weaningForm.fecha_destete,
        lechones_destetados: lechones,
        peso_total_kg: peso,
        dias_lactancia: parseInt(weaningForm.dias_lactancia || "21", 10),
      };

      if (weaningForm.parto_id) payload.parto_id = weaningForm.parto_id;

      await createWeaning(payload);
      toast.success("Destete registrado y lote asignado al corral");
      setIsWeaningModalOpen(false);
      await loadReproductionData(false);
      return true;
    } catch (err) {
      console.error("Error al registrar destete:", err);
      toast.error(err.message || "Fallo al registrar el destete");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-900">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="REPRODUCCIÓN Y CICLO BIOLÓGICO"
        title="Gestión Reproductiva, Partos y Destetes"
        description="Seguimiento analítico de servicios reproductivos (+114 días de gestación), camadas nacidas y transición a precebo en PostgreSQL."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {activeTab === "services" && (
              <Button
                onClick={() => setIsServiceModalOpen(true)}
                tone="primary"
                className="flex items-center gap-2 font-black rounded-xl! shadow-md"
              >
                <Plus size={18} />
                Nuevo Servicio
              </Button>
            )}
            {activeTab === "farrowings" && (
              <Button
                onClick={() => setIsFarrowingModalOpen(true)}
                tone="primary"
                className="flex items-center gap-2 font-black rounded-xl! shadow-md"
              >
                <Plus size={18} />
                Registrar Parto
              </Button>
            )}
            {activeTab === "weanings" && (
              <Button
                onClick={() => setIsWeaningModalOpen(true)}
                tone="primary"
                className="flex items-center gap-2 font-black rounded-xl! shadow-md"
              >
                <Plus size={18} />
                Registrar Destete
              </Button>
            )}
          </div>
        }
      />

      {/* Banner de Error */}
      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-rose-100 p-2 text-rose-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Fallo de sincronización reproductiva
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <Button
            onClick={() => loadReproductionData(true)}
            tone="danger"
            className="text-xs shrink-0 self-start sm:self-center"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reintentar
          </Button>
        </div>
      )}

      {/* Tarjetas de KPI */}
      <ReproductionKPIs
        gestacionesConfirmadas={gestacionesConfirmadas}
        proximosPartos={proximosPartos}
        totalNacidosVivos={totalNacidosVivos}
        totalDestetados={totalDestetados}
        farrowingsCount={farrowings.length}
      />

      {/* Control de Pestañas */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("services")}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "services"
                ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Heart size={16} />
            <span>Servicios e Inseminaciones ({services.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("farrowings")}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "farrowings"
                ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Baby size={16} />
            <span>Partos y Camadas ({farrowings.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("weanings")}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "weanings"
                ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Activity size={16} />
            <span>Destetes ({weanings.length})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => loadReproductionData(false)}
          disabled={isRefreshing}
          className="text-xs font-semibold text-slate-500 hover:text-fuchsia-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
        >
          <RefreshCw
            size={13}
            className={isRefreshing ? "animate-spin text-fuchsia-600" : ""}
          />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Contenido de Pestaña Activa */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-2">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 rounded-2xl bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : activeTab === "services" ? (
          <ServicesTab
            services={services}
            onOpenDiagnose={handleOpenDiagnoseModal}
            onOpenNewService={() => setIsServiceModalOpen(true)}
          />
        ) : activeTab === "farrowings" ? (
          <FarrowingsTab
            farrowings={farrowings}
            onOpenNewFarrowing={() => setIsFarrowingModalOpen(true)}
          />
        ) : (
          <WeaningsTab
            weanings={weanings}
            onOpenNewWeaning={() => setIsWeaningModalOpen(true)}
          />
        )}
      </section>

      {/* Modales */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSubmit={handleCreateServiceSubmit}
        isSubmitting={isSubmitting}
        females={females}
        males={males}
        breedingMales={breedingMales}
      />

      <DiagnoseModal
        service={selectedServiceForDiagnose}
        onClose={() => setSelectedServiceForDiagnose(null)}
        onSubmit={handleDiagnoseSubmit}
        isDiagnosing={isDiagnosing}
      />

      <FarrowingModal
        isOpen={isFarrowingModalOpen}
        onClose={() => setIsFarrowingModalOpen(false)}
        onSubmit={handleCreateFarrowingSubmit}
        isSubmitting={isSubmitting}
        confirmedFemales={confirmedFemales}
        services={services}
        corrales={corrales}
      />

      <WeaningModal
        isOpen={isWeaningModalOpen}
        onClose={() => setIsWeaningModalOpen(false)}
        onSubmit={handleCreateWeaningSubmit}
        isSubmitting={isSubmitting}
        females={females}
        corrales={corrales}
      />
    </div>
  );
}
