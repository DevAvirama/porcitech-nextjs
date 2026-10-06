"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Heart,
  Baby,
  Activity,
  CalendarDays,
  Plus,
  RefreshCw,
  AlertTriangle,
  Warehouse,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import ModuleHeader from "@/components/layout/ModuleHeader";
import { formatDateTime } from "@/utils/formatters";
import {
  getServices,
  createService,
  updateService,
  getFarrowings,
  createFarrowing,
  getWeanings,
  createWeaning,
} from "@/services/reproductionService";
import { getAnimales } from "@/services/animalService";
import { getCorrales } from "@/services/corralService";

const GESTATION_DAYS = 114; // Duración fisiológica estándar de gestación porcina

const SERVICE_STATUS_BADGES = {
  pendiente: {
    label: "Pendiente Diagnóstico",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  positiva: {
    label: "Gestante (Confirmada)",
    className: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  },
  negativa: {
    label: "No Gestante (Vacía)",
    className: "bg-rose-100 text-rose-700 border-rose-200",
  },
  repetida: {
    label: "Celo Repetido",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

export default function ReproductionView() {
  // Pestañas activas: 'services' | 'farrowings' | 'weanings'
  const [activeTab, setActiveTab] = useState("services");

  // Estados de datos API
  const [services, setServices] = useState([]);
  const [farrowings, setFarrowings] = useState([]);
  const [weanings, setWeanings] = useState([]);
  const [females, setFemales] = useState([]);
  const [males, setMales] = useState([]);
  const [corrales, setCorrales] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modales
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isFarrowingModalOpen, setIsFarrowingModalOpen] = useState(false);
  const [isWeaningModalOpen, setIsWeaningModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Diagnosticar Gestación
  const [selectedServiceForDiagnose, setSelectedServiceForDiagnose] = useState(null);
  const [diagnoseForm, setDiagnoseForm] = useState({
    estado_confirmacion: "positiva",
    fecha_diagnostico: new Date().toISOString().split("T")[0],
    observaciones: "",
  });
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // Formulario de Nuevo Servicio
  const [serviceForm, setServiceForm] = useState({
    hembra_id: "",
    macho_id: "",
    tipo_servicio: "inseminacion_artificial",
    codigo_pajilla_macho: "",
    fecha_servicio: new Date().toISOString().split("T")[0],
    estado_confirmacion: "pendiente",
  });

  // Formulario de Parto
  const [farrowingForm, setFarrowingForm] = useState({
    servicio_id: "",
    hembra_id: "",
    corral_maternidad_id: "",
    fecha_parto: new Date().toISOString().split("T")[0],
    nacidos_vivos: "",
    nacidos_muertos: "0",
    momias: "0",
    peso_camada_total_kg: "",
    observaciones: "",
  });

  // Formulario de Destete
  const [weaningForm, setWeaningForm] = useState({
    parto_id: "",
    hembra_id: "",
    corral_destino_id: "",
    fecha_destete: new Date().toISOString().split("T")[0],
    lechones_destetados: "",
    peso_total_kg: "",
    dias_lactancia: "21",
  });

  // Carga concurrente inicial
  const loadReproductionData = useCallback(async (showFullLoader = true) => {
    if (showFullLoader) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [
        servicesData,
        farrowingsData,
        weaningsData,
        animalsData,
        corralesData,
      ] = await Promise.all([
        getServices(),
        getFarrowings(),
        getWeanings(),
        getAnimales(),
        getCorrales(true),
      ]);

      setServices(Array.isArray(servicesData) ? servicesData : []);
      setFarrowings(Array.isArray(farrowingsData) ? farrowingsData : []);
      setWeanings(Array.isArray(weaningsData) ? weaningsData : []);

      const allAnimals = Array.isArray(animalsData) ? animalsData : [];
      const sows = allAnimals.filter(
        (a) => a.sexo === "hembra" || a.sexo === "Hembra"
      );
      const boars = allAnimals.filter(
        (a) => a.sexo === "macho" || a.sexo === "Macho"
      );

      setFemales(sows.length > 0 ? sows : allAnimals);
      setMales(boars.length > 0 ? boars : allAnimals);
      setCorrales(Array.isArray(corralesData) ? corralesData : []);
    } catch (err) {
      console.error("Error al cargar ciclo reproductivo:", err);
      setError(
        err.message ||
          "No se pudieron sincronizar los datos de reproducción con el backend de FastAPI."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReproductionData(true);
  }, [loadReproductionData]);

  // Cálculo en vivo de fecha probable de parto para el modal (+114 días)
  const estimatedFarrowingDate = useMemo(() => {
    if (!serviceForm.fecha_servicio) return "";
    const date = new Date(serviceForm.fecha_servicio);
    date.setDate(date.getDate() + GESTATION_DAYS);
    return date.toISOString().split("T")[0];
  }, [serviceForm.fecha_servicio]);

  // KPIs reactivos
  const gestacionesConfirmadas = useMemo(() => {
    return services.filter((s) => s.estado_confirmacion === "positiva").length;
  }, [services]);

  const proximosPartos = useMemo(() => {
    const today = new Date();
    return services.filter((s) => {
      if (s.estado_confirmacion !== "positiva" || !s.fecha_probable_parto) {
        return false;
      }
      const partDate = new Date(s.fecha_probable_parto);
      const diffDays = Math.ceil((partDate - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 14;
    }).length;
  }, [services]);

  const totalNacidosVivos = useMemo(() => {
    return farrowings.reduce(
      (acc, curr) => acc + (Number(curr.nacidos_vivos) || 0),
      0
    );
  }, [farrowings]);

  const totalDestetados = useMemo(() => {
    return weanings.reduce(
      (acc, curr) => acc + (Number(curr.lechones_destetados) || 0),
      0
    );
  }, [weanings]);

  // Envío de Nuevo Servicio
  const handleCreateServiceSubmit = async (e) => {
    e.preventDefault();

    if (!serviceForm.hembra_id) {
      toast.error("Seleccione la cerda reproductora");
      return;
    }
    if (
      serviceForm.tipo_servicio === "monta_natural" &&
      !serviceForm.macho_id
    ) {
      toast.error("Seleccione el macho semental para la monta natural");
      return;
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
      setServiceForm({
        hembra_id: "",
        macho_id: "",
        tipo_servicio: "inseminacion_artificial",
        codigo_pajilla_macho: "",
        fecha_servicio: new Date().toISOString().split("T")[0],
        estado_confirmacion: "pendiente",
      });
      await loadReproductionData(false);
    } catch (err) {
      console.error("Error al registrar servicio:", err);
      toast.error(err.message || "Fallo al registrar el servicio reproductivo");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir Modal de Diagnóstico de Gestación
  const handleOpenDiagnoseModal = (service) => {
    setSelectedServiceForDiagnose(service);
    setDiagnoseForm({
      estado_confirmacion: "positiva",
      fecha_diagnostico: new Date().toISOString().split("T")[0],
      observaciones: "",
    });
  };

  // Enviar Diagnóstico de Gestación
  const handleDiagnoseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedServiceForDiagnose) return;

    setIsDiagnosing(true);
    try {
      await updateService(selectedServiceForDiagnose.id, {
        estado_confirmacion: diagnoseForm.estado_confirmacion,
        fecha_diagnostico: diagnoseForm.fecha_diagnostico,
        observaciones: diagnoseForm.observaciones?.trim() || undefined,
      });

      const hembraStr = selectedServiceForDiagnose.hembra_arete || "la cerda";
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

  // Envío de Registro de Parto
  const handleCreateFarrowingSubmit = async (e) => {
    e.preventDefault();

    if (!farrowingForm.hembra_id) {
      toast.error("Seleccione la cerda madre");
      return;
    }
    const vivos = parseInt(farrowingForm.nacidos_vivos, 10);
    if (isNaN(vivos) || vivos < 0) {
      toast.error("Ingrese una cantidad válida de lechones vivos (>= 0)");
      return;
    }
    const pesoTotal = parseFloat(farrowingForm.peso_camada_total_kg);
    if (isNaN(pesoTotal) || pesoTotal <= 0) {
      toast.error("El peso total de la camada debe ser mayor a 0 kg");
      return;
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
      setFarrowingForm({
        servicio_id: "",
        hembra_id: "",
        corral_maternidad_id: "",
        fecha_parto: new Date().toISOString().split("T")[0],
        nacidos_vivos: "",
        nacidos_muertos: "0",
        momias: "0",
        peso_camada_total_kg: "",
        observaciones: "",
      });
      await loadReproductionData(false);
    } catch (err) {
      console.error("Error al registrar parto:", err);
      toast.error(err.message || "Fallo al registrar el parto");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Envío de Registro de Destete
  const handleCreateWeaningSubmit = async (e) => {
    e.preventDefault();

    if (!weaningForm.hembra_id) {
      toast.error("Seleccione la cerda madre");
      return;
    }
    if (!weaningForm.corral_destino_id) {
      toast.error("Seleccione el corral de destino para los lechones");
      return;
    }
    const lechones = parseInt(weaningForm.lechones_destetados, 10);
    if (isNaN(lechones) || lechones <= 0) {
      toast.error("La cantidad de lechones destetados debe ser mayor a 0");
      return;
    }
    const peso = parseFloat(weaningForm.peso_total_kg);
    if (isNaN(peso) || peso <= 0) {
      toast.error("El peso total de los lechones destetados debe ser mayor a 0");
      return;
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
      setWeaningForm({
        parto_id: "",
        hembra_id: "",
        corral_destino_id: "",
        fecha_destete: new Date().toISOString().split("T")[0],
        lechones_destetados: "",
        peso_total_kg: "",
        dias_lactancia: "21",
      });
      await loadReproductionData(false);
    } catch (err) {
      console.error("Error al registrar destete:", err);
      toast.error(err.message || "Fallo al registrar el destete");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Columnas: Servicios Reproductivos
  const serviceColumns = [
    {
      key: "hembra",
      header: "Cerda Madre / Arete",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
            {row.hembra_arete || "Hembra"}
          </span>
          {row.hembra_alias && (
            <span className="font-bold text-sm text-slate-900">
              {row.hembra_alias}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "tipo_servicio",
      header: "Modalidad",
      render: (row) => (
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${
            row.tipo_servicio === "inseminacion_artificial"
              ? "bg-purple-100 text-purple-700 border-purple-200"
              : "bg-blue-100 text-blue-700 border-blue-200"
          }`}
        >
          {row.tipo_servicio === "inseminacion_artificial"
            ? "Inseminación Artificial"
            : "Monta Natural"}
        </span>
      ),
    },
    {
      key: "macho",
      header: "Semental / Pajilla",
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-700">
          {row.macho_arete || row.codigo_pajilla_macho || "No especificado"}
        </span>
      ),
    },
    {
      key: "fecha_servicio",
      header: "Fecha Servicio",
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.fecha_servicio}
        </span>
      ),
    },
    {
      key: "fecha_probable_parto",
      header: "Parto Probable (+114d)",
      render: (row) => (
        <div>
          <span className="text-xs font-black text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {row.fecha_probable_parto}
          </span>
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado Confirmación",
      render: (row) => {
        const config =
          SERVICE_STATUS_BADGES[row.estado_confirmacion] || {
            label: row.estado_confirmacion || "Pendiente",
            className: "bg-slate-100 text-slate-700 border-slate-200",
          };
        return (
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${config.className}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.estado_confirmacion === "pendiente" ? (
            <button
              type="button"
              onClick={() => handleOpenDiagnoseModal(row)}
              className="px-3 py-1.5 rounded-xl bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-600 hover:text-white border border-fuchsia-200 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
              title="Confirmar diagnóstico de gestación"
            >
              <CheckCircle2 size={13} />
              Diagnosticar / Confirmar
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-slate-400 italic">
              {row.fecha_diagnostico ? `Diag: ${row.fecha_diagnostico}` : "Confirmado"}
            </span>
          )}
        </div>
      ),
    },
  ];

  // Columnas: Partos
  const farrowingColumns = [
    {
      key: "hembra",
      header: "Cerda Madre",
      render: (row) => (
        <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
          {row.hembra_arete || "Cerda"}
        </span>
      ),
    },
    {
      key: "corral",
      header: "Corral Maternidad",
      render: (row) => (
        <span className="text-xs font-bold text-slate-700">
          {row.corral_maternidad_codigo || "Paridera"}
        </span>
      ),
    },
    {
      key: "fecha_parto",
      header: "Fecha de Parto (COT)",
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {formatDateTime(row.fecha_parto)}
        </span>
      ),
    },
    {
      key: "lechones",
      header: "Camada (V / M / Mom)",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black">
            {row.nacidos_vivos} vivos
          </span>
          <span className="text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
            {row.nacidos_muertos || 0} m
          </span>
          <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
            {row.momias || 0} mom
          </span>
        </div>
      ),
    },
    {
      key: "peso",
      header: "Peso Camada Total",
      render: (row) => {
        const peso = Number(row.peso_camada_total_kg) || 0;
        const vivos = Number(row.nacidos_vivos) || 1;
        const promedio = vivos > 0 ? (peso / vivos).toFixed(2) : "0.00";
        return (
          <div>
            <span className="font-black text-slate-900 text-sm">{peso} kg</span>
            <span className="block text-[10px] text-slate-400">
              Prom: {promedio} kg/lechón
            </span>
          </div>
        );
      },
    },
    {
      key: "observaciones",
      header: "Observaciones",
      render: (row) => (
        <span className="text-xs text-slate-500 line-clamp-1">
          {row.observaciones || "Sin novedades"}
        </span>
      ),
    },
  ];

  // Columnas: Destetes
  const weaningColumns = [
    {
      key: "hembra",
      header: "Cerda Madre",
      render: (row) => (
        <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
          {row.hembra_arete || "Madre"}
        </span>
      ),
    },
    {
      key: "fecha",
      header: "Fecha Destete",
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.fecha_destete}
        </span>
      ),
    },
    {
      key: "lechones",
      header: "Lechones Destetados",
      render: (row) => (
        <span className="font-black text-sm text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
          {row.lechones_destetados} lechones
        </span>
      ),
    },
    {
      key: "peso",
      header: "Peso Total Lote",
      render: (row) => {
        const peso = Number(row.peso_total_kg) || 0;
        const count = Number(row.lechones_destetados) || 1;
        const prom = count > 0 ? (peso / count).toFixed(2) : "0.00";
        return (
          <div>
            <span className="font-black text-slate-900 text-sm">{peso} kg</span>
            <span className="block text-[10px] text-slate-400">
              Prom: {prom} kg/lechón
            </span>
          </div>
        );
      },
    },
    {
      key: "lactancia",
      header: "Días Lactancia",
      render: (row) => (
        <span className="text-xs font-bold text-slate-700">
          {row.dias_lactancia} días
        </span>
      ),
    },
    {
      key: "destino",
      header: "Corral Destino (Precebo)",
      render: (row) => (
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
          {row.corral_destino_codigo || "Corral Precebo"}
        </span>
      ),
    },
  ];

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

      {/* TARJETAS DE KPI SUPERIORES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hembras Gestantes
            </p>
            <h4 className="text-2xl font-black text-fuchsia-600 mt-1">
              {gestacionesConfirmadas} Cerda{gestacionesConfirmadas === 1 ? "" : "s"}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Confirmadas con diagnóstico positivo
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-fuchsia-50 text-fuchsia-600">
            <Heart className="w-6 h-6" />
          </div>
        </Card>

        <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Partos Inminentes (14d)
            </p>
            <h4 className="text-2xl font-black text-pink-600 mt-1">
              {proximosPartos} Parto{proximosPartos === 1 ? "" : "s"}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Preparación de parideras
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-pink-50 text-pink-600">
            <CalendarDays className="w-6 h-6" />
          </div>
        </Card>

        <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Lechones Vivos Nacidos
            </p>
            <h4 className="text-2xl font-black text-emerald-600 mt-1">
              {totalNacidosVivos.toLocaleString("es-CO")}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              En {farrowings.length} partos registrados
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <Baby className="w-6 h-6" />
          </div>
        </Card>

        <Card className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Lechones Destetados
            </p>
            <h4 className="text-2xl font-black text-purple-600 mt-1">
              {totalDestetados.toLocaleString("es-CO")}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Transición a corrales de precebo
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <Activity className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* CONTROL DE PESTAÑAS */}
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

      {/* CONTENIDO DE PESTAÑAS */}
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
          services.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Sin servicios registrados"
              description="No hay inseminaciones ni montas naturales registradas en la base de datos."
              actionLabel="Registrar Primer Servicio"
              onAction={() => setIsServiceModalOpen(true)}
            />
          ) : (
            <Table columns={serviceColumns} rows={services} />
          )
        ) : activeTab === "farrowings" ? (
          farrowings.length === 0 ? (
            <EmptyState
              icon={Baby}
              title="Sin partos registrados"
              description="No se han registrado alumbramientos ni camadas en PostgreSQL."
              actionLabel="Registrar Primer Parto"
              onAction={() => setIsFarrowingModalOpen(true)}
            />
          ) : (
            <Table columns={farrowingColumns} rows={farrowings} />
          )
        ) : weanings.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Sin destetes registrados"
            description="No se han registrado destetes de camadas hacia corrales de precebo."
            actionLabel="Registrar Primer Destete"
            onAction={() => setIsWeaningModalOpen(true)}
          />
        ) : (
          <Table columns={weaningColumns} rows={weanings} />
        )}
      </section>

      {/* MODAL 1: NUEVO SERVICIO REPRODUCTIVO */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <Card
            as="form"
            onSubmit={handleCreateServiceSubmit}
            className="w-full max-w-lg p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
          >
            <button
              type="button"
              onClick={() => setIsServiceModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-2xl font-black mb-1 text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-fuchsia-100 rounded-xl text-fuchsia-600">
                <Heart className="w-5 h-5" />
              </div>
              Nuevo Servicio Reproductivo
            </h2>
            <p className="text-xs text-slate-500 font-semibold mb-6">
              Inseminación artificial o monta natural con cálculo de gestación (+114 días)
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Cerda Reproductora (Hembra) *
                </label>
                <select
                  value={serviceForm.hembra_id}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, hembra_id: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm cursor-pointer"
                  required
                >
                  <option value="">Seleccione hembra...</option>
                  {females.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.codigo_arete} - {f.nombre_alias || "Sin alias"} ({f.raza || "Cerda"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Tipo de Servicio *
                  </label>
                  <select
                    value={serviceForm.tipo_servicio}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        tipo_servicio: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm cursor-pointer"
                  >
                    <option value="inseminacion_artificial">
                      Inseminación Artificial
                    </option>
                    <option value="monta_natural">Monta Natural</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Fecha de Servicio *
                  </label>
                  <Input
                    type="date"
                    required
                    value={serviceForm.fecha_servicio}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        fecha_servicio: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {serviceForm.tipo_servicio === "monta_natural" ? (
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Macho Semental (Verraco) *
                  </label>
                  <select
                    value={serviceForm.macho_id}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        macho_id: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm cursor-pointer"
                    required
                  >
                    <option value="">Seleccione macho...</option>
                    {males.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.codigo_arete} - {m.nombre_alias || "Sin alias"} ({m.raza || "Macho"})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Código de Pajilla / Lote de Semen
                  </label>
                  <Input
                    placeholder="Ej: PAJ-DUROC-99"
                    value={serviceForm.codigo_pajilla_macho}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        codigo_pajilla_macho: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              {/* Cálculo previo de fecha estimada de parto */}
              <div className="p-3.5 bg-fuchsia-50 rounded-2xl border border-fuchsia-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-fuchsia-800 uppercase tracking-wider block">
                    Parto Probable Estimado (+114 días)
                  </span>
                  <span className="text-sm font-black text-fuchsia-950">
                    {estimatedFarrowingDate || "Pendiente de fecha"}
                  </span>
                </div>
                <Clock className="w-5 h-5 text-fuchsia-600" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Diagnóstico Inicial
                </label>
                <select
                  value={serviceForm.estado_confirmacion}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      estado_confirmacion: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm cursor-pointer"
                >
                  <option value="pendiente">Pendiente Diagnóstico</option>
                  <option value="positiva">Gestante (Confirmada)</option>
                  <option value="negativa">No Gestante (Vacía)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                tone="soft"
                onClick={() => setIsServiceModalOpen(false)}
                className="flex-1 font-bold rounded-xl!"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                tone="primary"
                className="flex-1 font-black bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl! shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Guardar Servicio"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 2: REGISTRO DE PARTO Y CAMADA */}
      {isFarrowingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <Card
            as="form"
            onSubmit={handleCreateFarrowingSubmit}
            className="w-full max-w-lg p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setIsFarrowingModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-2xl font-black mb-1 text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                <Baby className="w-5 h-5" />
              </div>
              Registrar Parto y Camada
            </h2>
            <p className="text-xs text-slate-500 font-semibold mb-6">
              Conteo biológico de lechones y pesaje inicial de camada en paridera
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Cerda Madre *
                </label>
                <select
                  value={farrowingForm.hembra_id}
                  onChange={(e) =>
                    setFarrowingForm({
                      ...farrowingForm,
                      hembra_id: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none text-sm cursor-pointer"
                  required
                >
                  <option value="">Seleccione madre...</option>
                  {females.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.codigo_arete} - {f.nombre_alias || "Sin alias"} ({f.raza || "Cerda"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Corral Maternidad
                  </label>
                  <select
                    value={farrowingForm.corral_maternidad_id}
                    onChange={(e) =>
                      setFarrowingForm({
                        ...farrowingForm,
                        corral_maternidad_id: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none text-sm cursor-pointer"
                  >
                    <option value="">Seleccione paridera...</option>
                    {corrales.map((c) => (
                      <option key={c.id} value={c.id}>
                        Corral {c.codigo} ({c.fase})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Fecha de Parto *
                  </label>
                  <Input
                    type="date"
                    required
                    value={farrowingForm.fecha_parto}
                    onChange={(e) =>
                      setFarrowingForm({
                        ...farrowingForm,
                        fecha_parto: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Nacidos Vivos *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    required
                    placeholder="12"
                    value={farrowingForm.nacidos_vivos}
                    onChange={(e) =>
                      setFarrowingForm({
                        ...farrowingForm,
                        nacidos_vivos: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Nacidos Muertos
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={farrowingForm.nacidos_muertos}
                    onChange={(e) =>
                      setFarrowingForm({
                        ...farrowingForm,
                        nacidos_muertos: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Momias
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={farrowingForm.momias}
                    onChange={(e) =>
                      setFarrowingForm({
                        ...farrowingForm,
                        momias: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Peso Camada Total (kg) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  placeholder="Ej: 16.80"
                  value={farrowingForm.peso_camada_total_kg}
                  onChange={(e) =>
                    setFarrowingForm({
                      ...farrowingForm,
                      peso_camada_total_kg: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Observaciones del Alumbramiento
                </label>
                <Input
                  placeholder="Ej: Parto normal sin asistencia, calostro consumido"
                  value={farrowingForm.observaciones}
                  onChange={(e) =>
                    setFarrowingForm({
                      ...farrowingForm,
                      observaciones: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                tone="soft"
                onClick={() => setIsFarrowingModalOpen(false)}
                className="flex-1 font-bold rounded-xl!"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                tone="primary"
                className="flex-1 font-black rounded-xl! shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Guardar Parto"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 3: REGISTRO DE DESTETE */}
      {isWeaningModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <Card
            as="form"
            onSubmit={handleCreateWeaningSubmit}
            className="w-full max-w-lg p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
          >
            <button
              type="button"
              onClick={() => setIsWeaningModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-2xl font-black mb-1 text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                <Activity className="w-5 h-5" />
              </div>
              Registrar Destete de Camada
            </h2>
            <p className="text-xs text-slate-500 font-semibold mb-6">
              Finalización de lactancia y traslado del lote a corral de precebo
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Cerda Madre *
                </label>
                <select
                  value={weaningForm.hembra_id}
                  onChange={(e) =>
                    setWeaningForm({
                      ...weaningForm,
                      hembra_id: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-purple-500 outline-none text-sm cursor-pointer"
                  required
                >
                  <option value="">Seleccione madre...</option>
                  {females.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.codigo_arete} - {f.nombre_alias || "Sin alias"} ({f.raza || "Cerda"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Corral Destino (Precebo) *
                </label>
                <select
                  value={weaningForm.corral_destino_id}
                  onChange={(e) =>
                    setWeaningForm({
                      ...weaningForm,
                      corral_destino_id: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-purple-500 outline-none text-sm cursor-pointer"
                  required
                >
                  <option value="">Seleccione corral destino...</option>
                  {corrales.map((c) => (
                    <option key={c.id} value={c.id}>
                      Corral {c.codigo} ({c.fase})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Fecha de Destete *
                  </label>
                  <Input
                    type="date"
                    required
                    value={weaningForm.fecha_destete}
                    onChange={(e) =>
                      setWeaningForm({
                        ...weaningForm,
                        fecha_destete: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Días de Lactancia *
                  </label>
                  <Input
                    type="number"
                    min="14"
                    required
                    placeholder="21"
                    value={weaningForm.dias_lactancia}
                    onChange={(e) =>
                      setWeaningForm({
                        ...weaningForm,
                        dias_lactancia: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Lechones Destetados *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    placeholder="11"
                    value={weaningForm.lechones_destetados}
                    onChange={(e) =>
                      setWeaningForm({
                        ...weaningForm,
                        lechones_destetados: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Peso Total Lote (kg) *
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    required
                    placeholder="68.5"
                    value={weaningForm.peso_total_kg}
                    onChange={(e) =>
                      setWeaningForm({
                        ...weaningForm,
                        peso_total_kg: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                tone="soft"
                onClick={() => setIsWeaningModalOpen(false)}
                className="flex-1 font-bold rounded-xl!"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                tone="primary"
                className="flex-1 font-black bg-purple-600 hover:bg-purple-700 text-white rounded-xl! shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Guardar Destete"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 4: DIAGNÓSTICO DE GESTACIÓN / PREÑEZ */}
      {selectedServiceForDiagnose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <Card
            as="form"
            onSubmit={handleDiagnoseSubmit}
            className="w-full max-w-md p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
          >
            <button
              type="button"
              onClick={() => setSelectedServiceForDiagnose(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-xl font-black mb-1 text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-fuchsia-100 rounded-xl text-fuchsia-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              Diagnóstico de Gestación
            </h2>
            <p className="text-xs text-slate-500 font-semibold mb-5">
              Confirmación clínica o ecográfica para la cerda{" "}
              <strong className="text-slate-900 font-black">
                {selectedServiceForDiagnose.hembra_arete}
              </strong>
              {selectedServiceForDiagnose.hembra_alias
                ? ` ("${selectedServiceForDiagnose.hembra_alias}")`
                : ""}
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Resultado del Diagnóstico *
                </label>
                <select
                  value={diagnoseForm.estado_confirmacion}
                  onChange={(e) =>
                    setDiagnoseForm({
                      ...diagnoseForm,
                      estado_confirmacion: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm cursor-pointer"
                >
                  <option value="positiva">Positiva (Gestante - Pasa a Gestación)</option>
                  <option value="negativa">Negativa (Vacía)</option>
                  <option value="repetida">Repetida (Repitió celo)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Fecha de Diagnóstico *
                </label>
                <input
                  type="date"
                  value={diagnoseForm.fecha_diagnostico}
                  onChange={(e) =>
                    setDiagnoseForm({
                      ...diagnoseForm,
                      fecha_diagnostico: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Observaciones Clínicas (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={diagnoseForm.observaciones}
                  onChange={(e) =>
                    setDiagnoseForm({
                      ...diagnoseForm,
                      observaciones: e.target.value,
                    })
                  }
                  placeholder="Ej: Confirmada por ultrasonido a los 30 días..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                tone="soft"
                onClick={() => setSelectedServiceForDiagnose(null)}
                className="flex-1 rounded-xl! font-bold text-sm"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                tone="primary"
                isLoading={isDiagnosing}
                className="flex-1 rounded-xl! font-black text-sm bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
              >
                Confirmar Diagnóstico
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
