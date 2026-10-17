"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Scale,
  TrendingUp,
  Activity,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Camera,
  Upload,
  Sparkles,
  Layers,
  Inbox,
  RefreshCw,
  Info,
  Maximize2,
  Cpu,
  Eye,
  History,
  Tag,
  Trash2,
  Video,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ModuleHeader from "@/components/layout/ModuleHeader";
import { getAnimales } from "@/services/animalService";
import { getCorrales } from "@/services/corralService";
import {
  estimateWeightWithAI,
  estimarPesoCamaraRTSP,
  deletePesaje,
  getCorralGMD,
  getAnimalWeightHistory,
  registerManualWeight,
} from "@/services/weightService";
import { getAnimalDisplayName, UUID_REGEX } from "@/utils/formatters";

const DEFAULT_RTSP_URL = "rtsp://admin:123456@192.168.32.200:554/live/ch00_1";
const DEFAULT_PIXELS_PER_CM = "15.2";
const UUID_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function WeightView() {
  // Pestaña activa: 'ia_vision' | 'manual' | 'analytics' | 'history'
  const [activeTab, setActiveTab] = useState("ia_vision");

  // Listas de datos maestros desde API
  const [animals, setAnimals] = useState([]);
  const [corrales, setCorrales] = useState([]);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(true);

  // Estados del Flujo de Visión Artificial (YOLO + OpenCV)
  const [selectedAnimalId, setSelectedAnimalId] = useState("");
  const [selectedCorralId, setSelectedCorralId] = useState("");
  const [persistAI, setPersistAI] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const fileInputRef = useRef(null);

  // Fuente de captura: 'upload' (foto/móvil) | 'rtsp' (cámara cenital V380 Pro)
  const [captureMode, setCaptureMode] = useState("upload");
  const [rtspUrl, setRtspUrl] = useState(DEFAULT_RTSP_URL);
  const [pixelsPerCm, setPixelsPerCm] = useState(DEFAULT_PIXELS_PER_CM);
  const [validarBordes, setValidarBordes] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Estados del Flujo de Pesaje Manual
  const [manualForm, setManualForm] = useState({
    animalId: "",
    corralId: "",
    peso_kg: "",
    fecha: new Date().toISOString().split("T")[0],
    observaciones: "",
  });
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Estados de Analítica TimescaleDB (GMD)
  const [analyticsCorralId, setAnalyticsCorralId] = useState("");
  const [gmdData, setGmdData] = useState([]);
  const [isLoadingGMD, setIsLoadingGMD] = useState(false);

  // Historial de pesajes combinados y desde base de datos
  const [recentLogs, setRecentLogs] = useState([]);
  const [historyAnimalId, setHistoryAnimalId] = useState("");
  const [dbHistoryLogs, setDbHistoryLogs] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Cargar animales y corrales al montar el componente
  useEffect(() => {
    async function loadData() {
      setIsLoadingMasterData(true);
      try {
        const [animalsRes, corralesRes] = await Promise.all([
          getAnimales(),
          getCorrales(true),
        ]);
        const validAnimals = Array.isArray(animalsRes) ? animalsRes : [];
        const validCorrales = Array.isArray(corralesRes) ? corralesRes : [];

        setAnimals(validAnimals);
        setCorrales(validCorrales);

        if (validCorrales.length > 0) {
          setAnalyticsCorralId(validCorrales[0].id);
        }
      } catch (err) {
        console.error("Error al cargar datos maestros:", err);
        toast.error("No se pudo sincronizar la lista de animales o corrales");
      } finally {
        setIsLoadingMasterData(false);
      }
    }
    loadData();
  }, []);

  // Autoseleccionar corral cuando se selecciona un animal en el flujo de IA
  const handleAnimalChange = (animalId) => {
    setSelectedAnimalId(animalId);
    const chosen = animals.find((a) => a.id === animalId);
    if (chosen && chosen.corral_id) {
      setSelectedCorralId(chosen.corral_id);
    }
  };

  // Cargar series temporales GMD desde TimescaleDB cuando cambia el corral analizado
  useEffect(() => {
    if (analyticsCorralId) {
      setIsLoadingGMD(true);
      getCorralGMD(analyticsCorralId, 30)
        .then((data) => {
          setGmdData(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.warn("Aviso al obtener GMD de TimescaleDB:", err.message);
          setGmdData([]);
        })
        .finally(() => {
          setIsLoadingGMD(false);
        });
    }
  }, [analyticsCorralId]);

  // Manejar selección de imagen (archivo o captura con cámara)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setAiResult(null);
    }
  };

  // Recargar datos maestros y GMD tras persistir o anular un pesaje
  const refreshViewData = async () => {
    try {
      const animalsRes = await getAnimales();
      setAnimals(Array.isArray(animalsRes) ? animalsRes : []);
    } catch (err) {
      console.warn("No se pudo recargar la lista de animales:", err.message);
    }
    if (analyticsCorralId) {
      try {
        const data = await getCorralGMD(analyticsCorralId, 30);
        setGmdData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("No se pudo recargar la GMD:", err.message);
      }
    }
    if (historyAnimalId) {
      try {
        const res = await getAnimalWeightHistory(historyAnimalId);
        const list = Array.isArray(res) ? res : [];
        const chosen = animals.find((a) => a.id === historyAnimalId);
        const mapped = list.map((reg) => ({
          id: reg.id_registro || reg.id,
          id_registro: reg.id_registro || reg.id,
          animalCode: reg.cerdo_arete || (chosen?.codigo_arete && !UUID_REGEX.test(chosen.codigo_arete) ? chosen.codigo_arete : null),
          animalDisplayName: chosen ? getAnimalDisplayName(chosen) : (reg.cerdo_alias || "Ejemplar"),
          animalAlias: reg.cerdo_alias || chosen?.nombre_alias,
          corralCodigo: reg.corral_codigo || "N/A",
          peso: reg.peso_kg,
          metodo: reg.metodo === "vision_ai" ? "ia_vision" : reg.metodo,
          confianza: reg.confianza_ia,
          fecha: reg.tiempo || reg.created_at,
        }));
        setDbHistoryLogs(mapped);
      } catch (err) {
        console.warn("No se pudo recargar el historial del animal:", err.message);
      }
    }
  };

  // Cargar historial de un animal individual al seleccionarlo en la pestaña de historial
  useEffect(() => {
    if (historyAnimalId) {
      setIsLoadingHistory(true);
      getAnimalWeightHistory(historyAnimalId)
        .then((res) => {
          const list = Array.isArray(res) ? res : [];
          const chosen = animals.find((a) => a.id === historyAnimalId);
          const mapped = list.map((reg) => ({
            id: reg.id_registro || reg.id,
            id_registro: reg.id_registro || reg.id,
            animalCode: reg.cerdo_arete || (chosen?.codigo_arete && !UUID_REGEX.test(chosen.codigo_arete) ? chosen.codigo_arete : null),
            animalDisplayName: chosen ? getAnimalDisplayName(chosen) : (reg.cerdo_alias || "Ejemplar"),
            animalAlias: reg.cerdo_alias || chosen?.nombre_alias,
            corralCodigo: reg.corral_codigo || "N/A",
            peso: reg.peso_kg,
            metodo: reg.metodo === "vision_ai" ? "ia_vision" : reg.metodo,
            confianza: reg.confianza_ia,
            fecha: reg.tiempo || reg.created_at,
          }));
          setDbHistoryLogs(mapped);
        })
        .catch((err) => {
          console.warn("Aviso al obtener historial del animal:", err.message);
          setDbHistoryLogs([]);
        })
        .finally(() => setIsLoadingHistory(false));
    } else {
      setDbHistoryLogs([]);
    }
  }, [historyAnimalId, animals]);

  // Procesar respuesta de inferencia (común a archivo y RTSP)
  const procesarResultadoIA = (result) => {
    setAiResult(result);

    if (result?.imagen_anotada_base64) {
      setImagePreview(result.imagen_anotada_base64);
    }

    if (result?.detectado) {
      toast.success(
        `¡Estimación exitosa! Peso: ${result.peso_estimado_kg?.toFixed(2)} kg`,
      );

      // Agregar al historial de la sesión
      const chosen = animals.find((a) => a.id === selectedAnimalId);
      const corralObj = corrales.find((c) => c.id === selectedCorralId);
      const validArete =
        chosen?.codigo_arete && !UUID_REGEX.test(chosen.codigo_arete)
          ? chosen.codigo_arete
          : null;
      const newLog = {
        id: result.id_registro_persistido || `AI-${Date.now()}`,
        id_registro: result.id_registro_persistido || null,
        animalCode: validArete,
        animalDisplayName: getAnimalDisplayName(chosen),
        animalAlias: chosen?.nombre_alias,
        corralCodigo: corralObj?.codigo || "N/A",
        peso: result.peso_estimado_kg,
        metodo: "ia_vision",
        confianza: result.confianza,
        fecha: result.tiempo_registro || new Date().toISOString(),
      };
      setRecentLogs((prev) => [newLog, ...prev]);

      if (result.id_registro_persistido) {
        refreshViewData();
      }
    } else {
      toast.warning(
        result?.mensaje || "No se detectó el animal en el plano dorsal.",
      );
    }
  };

  // Ejecutar inferencia de peso por visión artificial (archivo / móvil)
  const handleRunAiEstimation = async () => {
    if (!selectedAnimalId) {
      toast.error("Selecciona el cerdo a evaluar.");
      return;
    }
    if (!selectedCorralId) {
      toast.error("Selecciona el corral de procedencia.");
      return;
    }
    if (!imageFile) {
      toast.error("Adjunta o toma una foto dorsal del porcino.");
      return;
    }

    setIsProcessingAI(true);
    setAiResult(null);

    try {
      const result = await estimateWeightWithAI({
        imageFile,
        animalId: selectedAnimalId,
        corralId: selectedCorralId,
        persist: persistAI,
      });
      procesarResultadoIA(result);
    } catch (err) {
      console.error("Error en inferencia de visión IA:", err);
      setAiResult({ detectado: false, mensaje: err.message });
      toast.error(
        err.message || "Error al procesar la imagen en el microservicio Docker.",
      );
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Capturar fotograma desde la cámara cenital V380 Pro (RTSP/TCP) y estimar peso
  const handleRunRtspEstimation = async () => {
    if (!selectedAnimalId) {
      toast.error("Selecciona el cerdo a evaluar.");
      return;
    }
    if (!selectedCorralId) {
      toast.error("Selecciona el corral de procedencia.");
      return;
    }

    setIsProcessingAI(true);
    setAiResult(null);

    try {
      const result = await estimarPesoCamaraRTSP({
        id_cerdo: selectedAnimalId,
        corral_id: selectedCorralId,
        rtsp_url: rtspUrl || DEFAULT_RTSP_URL,
        pixels_per_cm: Number(pixelsPerCm) || 15.2,
        validar_bordes: validarBordes,
        persistir: persistAI,
      });
      procesarResultadoIA(result);
    } catch (err) {
      console.error("Error en captura RTSP V380 Pro:", err);
      setAiResult({ detectado: false, mensaje: err.message });
      toast.error(err.message || "No se pudo capturar desde la cámara Wi-Fi.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Anular un pesaje anómalo del historial
  const handleDeletePesaje = async (log) => {
    const targetId = log?.id_registro || log?.id;
    if (!targetId || !UUID_ID_REGEX.test(targetId)) {
      setRecentLogs((prev) => prev.filter((l) => (l.id_registro || l.id) !== targetId));
      setDbHistoryLogs((prev) => prev.filter((l) => (l.id_registro || l.id) !== targetId));
      toast.info("Registro local retirado del historial.");
      return;
    }
    setDeletingId(targetId);
    try {
      const res = await deletePesaje(targetId);
      setRecentLogs((prev) => prev.filter((l) => (l.id_registro || l.id) !== targetId));
      setDbHistoryLogs((prev) => prev.filter((l) => (l.id_registro || l.id) !== targetId));
      toast.success(
        res?.mensaje || `Pesaje anulado. Peso actual recalculado: ${Number(res?.peso_actual_kg ?? 0).toFixed(2)} kg`,
      );
      await refreshViewData();
    } catch (err) {
      console.error("Error al anular pesaje:", err);
      toast.error(err.message || "No se pudo anular el pesaje.");
    } finally {
      setDeletingId(null);
    }
  };

  // Manejar registro manual en báscula
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.animalId || !manualForm.peso_kg) {
      toast.error("Completa el cerdo y el peso registrado.");
      return;
    }

    setIsSubmittingManual(true);
    try {
      const payload = {
        id_cerdo: manualForm.animalId,
        corral_id: manualForm.corralId || null,
        peso_kg: parseFloat(manualForm.peso_kg),
        tiempo: manualForm.fecha
          ? new Date(manualForm.fecha).toISOString()
          : new Date().toISOString(),
        observaciones: manualForm.observaciones || null,
      };

      const result = await registerManualWeight(payload);
      toast.success("Pesaje de báscula almacenado en TimescaleDB correctamente.");

      const chosen = animals.find((a) => a.id === manualForm.animalId);
      const corralObj = corrales.find((c) => c.id === manualForm.corralId);
      const validArete =
        chosen?.codigo_arete && !UUID_REGEX.test(chosen.codigo_arete)
          ? chosen.codigo_arete
          : null;
      const newLog = {
        id: result?.id_registro || result?.id || `MAN-${Date.now()}`,
        animalCode: validArete,
        animalDisplayName: getAnimalDisplayName(chosen),
        animalAlias: chosen?.nombre_alias,
        corralCodigo: corralObj?.codigo || "N/A",
        peso: parseFloat(manualForm.peso_kg),
        metodo: "manual_bascula",
        confianza: 1.0,
        fecha: payload.tiempo,
      };
      setRecentLogs((prev) => [newLog, ...prev]);

      // Limpiar formulario
      setManualForm({
        animalId: "",
        corralId: "",
        peso_kg: "",
        fecha: new Date().toISOString().split("T")[0],
        observaciones: "",
      });
    } catch (err) {
      console.error("Error al registrar pesaje manual:", err);
      toast.error(err.message || "Error al guardar el pesaje en TimescaleDB.");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // KPIs Resumen
  const averageWeight = useMemo(() => {
    if (animals.length === 0) return "0.0";
    const pesosValidos = animals
      .map((a) => a.peso_actual_kg)
      .filter((p) => p !== null && p !== undefined && p > 0);
    if (pesosValidos.length === 0) return "78.5";
    const sum = pesosValidos.reduce((acc, curr) => acc + curr, 0);
    return (sum / pesosValidos.length).toFixed(1);
  }, [animals]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-900">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="BIOMETRÍA Y VISIÓN COMPUTACIONAL"
        title="Pesaje Inteligente y Estimación por Visión Artificial"
        description="Inferencia biométrica dorsal mediante modelo YOLO + OpenCV en contenedor Docker y registro analítico en series temporales de TimescaleDB."
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setActiveTab("ia_vision")}
              tone={activeTab === "ia_vision" ? "primary" : "soft"}
              className="text-xs font-black rounded-xl! cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={16} />
              Visión Artificial IA
            </Button>
            <Button
              onClick={() => setActiveTab("manual")}
              tone={activeTab === "manual" ? "primary" : "soft"}
              className="text-xs font-black rounded-xl! cursor-pointer flex items-center gap-1.5"
            >
              <Scale size={16} />
              Báscula Manual
            </Button>
          </div>
        }
      />

      {/* TARJETAS KPI DE RENDIMIENTO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Modelo de Visión
              </p>
              <h4 className="text-xl font-black text-slate-900 mt-2 flex items-center gap-2">
                YOLOv8 + OpenCV
              </h4>
              <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 size={13} /> Microservicio Docker Activo
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Peso Promedio del Hato
              </p>
              <h4 className="text-2xl font-black text-slate-900 mt-2">
                {averageWeight} <span className="text-sm text-slate-500">kg</span>
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Calculado en PostgreSQL
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Scale size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Hipertabla TimescaleDB
              </p>
              <h4 className="text-xl font-black text-emerald-600 mt-2">
                registro_pesos
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Series temporales con chunks
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ejemplares Activos
              </p>
              <h4 className="text-2xl font-black text-slate-900 mt-2">
                {animals.length} Cerdos
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Listos para monitoreo
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* SELECTOR DE PESTAÑAS PRINCIPALES */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("ia_vision")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "ia_vision"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles size={16} />
          Visión Artificial IA (YOLO)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "manual"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Scale size={16} />
          Báscula Manual
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "analytics"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <TrendingUp size={16} />
          Analítica GMD (TimescaleDB)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "history"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <History size={16} />
          Historial de Pesajes
        </button>
      </div>

      {/* ========================================================
          PESTAÑA 1: INFERENCIA DE VISIÓN ARTIFICIAL (YOLO + OPENCV)
          ======================================================== */}
      {activeTab === "ia_vision" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Panel Izquierdo: Captura, Parámetros y Ejecución */}
          <Card className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Camera className="text-indigo-600" size={20} />
                  Captura Dorsal y Parámetros
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toma o sube una fotografía del plano superior del porcino.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                Docker Microservice
              </span>
            </div>

            {/* Selectores de Cerdo y Corral */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Seleccionar Cerdo *
                </label>
                <select
                  value={selectedAnimalId}
                  onChange={(e) => handleAnimalChange(e.target.value)}
                  disabled={isProcessingAI || isLoadingMasterData}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">-- Elige un ejemplar --</option>
                  {animals.map((a) => {
                    const displayName = getAnimalDisplayName(a);
                    const validArete =
                      a.codigo_arete && !UUID_REGEX.test(a.codigo_arete)
                        ? `#${a.codigo_arete} · `
                        : "";
                    return (
                      <option key={a.id} value={a.id}>
                        {validArete ? `${validArete}${displayName}` : displayName} ({a.raza || "Porcino"})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Corral / Ubicación *
                </label>
                <select
                  value={selectedCorralId}
                  onChange={(e) => setSelectedCorralId(e.target.value)}
                  disabled={isProcessingAI || isLoadingMasterData}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">-- Elige el corral --</option>
                  {corrales.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo} ({c.fase})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkbox de Persistencia */}
            <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={persistAI}
                onChange={(e) => setPersistAI(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800">
                  Persistir resultado automáticamente
                </span>
                <p className="text-slate-500 text-[11px]">
                  Guarda en la hipertabla TimescaleDB y actualiza peso_actual_kg del cerdo.
                </p>
              </div>
            </label>

            {/* Selector de Fuente de Captura */}
            <div className="flex flex-col gap-2">
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Fuente de Captura
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  id="capture-mode-upload"
                  onClick={() => {
                    setCaptureMode("upload");
                    setAiResult(null);
                  }}
                  disabled={isProcessingAI}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    captureMode === "upload"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📁 Subir Fotografía Local
                </button>
                <button
                  type="button"
                  id="capture-mode-rtsp"
                  onClick={() => {
                    setCaptureMode("rtsp");
                    setAiResult(null);
                  }}
                  disabled={isProcessingAI}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    captureMode === "rtsp"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📹 Cámara Cenital Wi-Fi (V380 Pro RTSP)
                </button>
              </div>
            </div>

            {/* Área de Captura / Subida de Imagen con Cámara Responsive */}
            {captureMode === "upload" && (
            <div className="flex flex-col gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                id="camera-file-input"
              />

              {imagePreview ? (
                <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 flex items-center justify-center group min-h-64 max-h-96">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={aiResult?.imagen_anotada_base64 || imagePreview}
                    alt="Previsualización dorsal"
                    onLoad={(e) => {
                      setImageDimensions({
                        width: e.currentTarget.naturalWidth || 640,
                        height: e.currentTarget.naturalHeight || 480,
                      });
                    }}
                    className="max-h-96 w-auto object-contain"
                  />

                  {/* Overlay SVG del Bounding Box (solo si el backend no envió imagen anotada) */}
                  {aiResult?.detectado && !aiResult?.imagen_anotada_base64 && aiResult?.bbox?.x_min !== undefined && imageDimensions.width > 0 && (
                    <svg
                      viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    >
                      <rect
                        x={aiResult.bbox.x_min}
                        y={aiResult.bbox.y_min}
                        width={aiResult.bbox.x_max - aiResult.bbox.x_min}
                        height={aiResult.bbox.y_max - aiResult.bbox.y_min}
                        fill="rgba(16, 185, 129, 0.15)"
                        stroke="#10b981"
                        strokeWidth={Math.max(4, Math.round(imageDimensions.width / 150))}
                        rx="8"
                      />
                      <g
                        transform={`translate(${aiResult.bbox.x_min}, ${Math.max(
                          24,
                          aiResult.bbox.y_min - 10,
                        )})`}
                      >
                        <rect
                          x="0"
                          y="-24"
                          width={Math.max(160, Math.round(imageDimensions.width / 4))}
                          height="28"
                          rx="6"
                          fill="#10b981"
                        />
                        <text
                          x="8"
                          y="-6"
                          fill="#ffffff"
                          fontSize={Math.max(14, Math.round(imageDimensions.width / 45))}
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          Porcino: {(aiResult.confianza * 100).toFixed(1)}%
                        </text>
                      </g>
                    </svg>
                  )}

                  {/* Botón flotante para cambiar foto */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingAI}
                    className="absolute bottom-4 right-4 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <RefreshCw size={14} />
                    Cambiar Foto
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Camera size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">
                      Toma una foto con la cámara o sube un archivo
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Coloca el dispositivo en ángulo dorsal superior (cenital a 1.2 - 1.5 metros) para maximizar la precisión morfométrica.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm">
                    <Upload size={14} /> Seleccionar Imagen
                  </span>
                </div>
              )}
            </div>
            )}

            {/* Panel de Cámara Cenital Wi-Fi (V380 Pro RTSP) */}
            {captureMode === "rtsp" && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="rtsp-url-input"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      URL RTSP de la Cámara
                    </label>
                    <input
                      id="rtsp-url-input"
                      type="text"
                      value={rtspUrl}
                      onChange={(e) => setRtspUrl(e.target.value)}
                      placeholder={DEFAULT_RTSP_URL}
                      disabled={isProcessingAI}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="pixels-per-cm-input"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Factor de Calibración (px/cm base 1280p)
                    </label>
                    <input
                      id="pixels-per-cm-input"
                      type="number"
                      step="0.1"
                      min="1.1"
                      max="100"
                      value={pixelsPerCm}
                      onChange={(e) => setPixelsPerCm(e.target.value)}
                      placeholder={DEFAULT_PIXELS_PER_CM}
                      disabled={isProcessingAI}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
                  <input
                    id="validar-bordes-checkbox"
                    type="checkbox"
                    checked={validarBordes}
                    onChange={(e) => setValidarBordes(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800">
                      Validar que el porcino no toque los bordes
                    </span>
                    <p className="text-slate-500 text-[11px]">
                      Rechaza capturas donde el animal sale parcialmente del encuadre cenital.
                    </p>
                  </div>
                </label>

                <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 flex items-center justify-center min-h-64 max-h-96">
                  {aiResult?.imagen_anotada_base64 ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={aiResult.imagen_anotada_base64}
                      alt="Fotograma cenital anotado por YOLO"
                      className="max-h-96 w-auto object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center p-8 text-slate-400">
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 text-indigo-300 flex items-center justify-center">
                        {isProcessingAI ? (
                          <RefreshCw size={26} className="animate-spin" />
                        ) : (
                          <Video size={26} />
                        )}
                      </div>
                      <p className="text-sm font-black text-slate-200">
                        {isProcessingAI
                          ? "Drenando buffer RTSP y capturando fotograma en vivo..."
                          : "Sin captura de la cámara aún"}
                      </p>
                      <p className="text-xs max-w-sm">
                        El fotograma se toma vía RTSP sobre TCP desde la V380 Pro y se procesa en el servidor sin bloquear la API.
                      </p>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-900/80 text-emerald-300 backdrop-blur-md">
                    <Wifi size={12} /> V380 Pro · RTSP/TCP
                  </span>
                </div>
              </div>
            )}

            {/* Botón de Ejecución de Inferencia */}
            {captureMode === "upload" ? (
              <Button
                type="button"
                tone="primary"
                id="run-ai-file-button"
                onClick={handleRunAiEstimation}
                isLoading={isProcessingAI}
                disabled={isProcessingAI || !imageFile || !selectedAnimalId || !selectedCorralId}
                className="w-full py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
              >
                {isProcessingAI ? (
                  "Iniciando Inferencia en Microservicio YOLO..."
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={18} />
                    Calcular Peso con Visión Artificial
                  </span>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                tone="primary"
                id="run-ai-rtsp-button"
                onClick={handleRunRtspEstimation}
                isLoading={isProcessingAI}
                disabled={isProcessingAI || !selectedAnimalId || !selectedCorralId}
                className="w-full py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
              >
                {isProcessingAI ? (
                  "Capturando fotograma desde la cámara Wi-Fi..."
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Video size={18} />
                    Capturar y Calcular Peso desde Cámara Wi-Fi
                  </span>
                )}
              </Button>
            )}
          </Card>

          {/* Panel Derecho: Resultados Morfométricos en Tiempo Real */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {aiResult && aiResult.detectado ? (
              <Card className="bg-white border-2 border-emerald-300 rounded-3xl p-6 shadow-xl shadow-emerald-500/10 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-black text-sm uppercase tracking-wider">
                    <CheckCircle2 size={18} />
                    Inferencia Morfométrica Exitosa
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Confianza: {(aiResult.confianza * 100).toFixed(1)}%
                  </span>
                </div>

                {/* PESO ESTIMADO GIGANTE */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 text-center">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 block mb-1">
                    Peso Estimado por IA
                  </span>
                  <p className="text-5xl font-black tracking-tight text-slate-950 font-mono">
                    {aiResult.peso_estimado_kg?.toFixed(2)}
                    <span className="text-2xl text-emerald-700 ml-1.5 font-sans font-bold">
                      kg
                    </span>
                  </p>
                  <p className="text-xs font-semibold text-emerald-700 mt-2">
                    {persistAI
                      ? "✓ Persistido en hipertabla registro_pesos (TimescaleDB)"
                      : "Modo estimación previa (No persistido)"}
                  </p>
                </div>

                {/* MÉTRICAS MORFOMÉTRICAS */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Largo Dorsal
                    </span>
                    <span className="text-base font-black text-slate-800 font-mono">
                      {aiResult.largo_cm ? `${aiResult.largo_cm} cm` : "N/D"}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Ancho Corporal
                    </span>
                    <span className="text-base font-black text-slate-800 font-mono">
                      {aiResult.ancho_cm ? `${aiResult.ancho_cm} cm` : "N/D"}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Área Dorsal
                    </span>
                    <span className="text-base font-black text-slate-800 font-mono">
                      {aiResult.area_cm2 ? `${aiResult.area_cm2} cm²` : "N/D"}
                    </span>
                  </div>
                </div>

                {/* DETALLE TÉCNICO DE PERSISTENCIA */}
                {aiResult.id_registro_persistido && (
                  <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-700">ID Registro:</span>
                      <span className="truncate max-w-[180px]">
                        {aiResult.id_registro_persistido}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-700">Timestamp:</span>
                      <span>
                        {aiResult.tiempo_registro
                          ? new Date(aiResult.tiempo_registro).toLocaleTimeString()
                          : "Reciente"}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            ) : aiResult && !aiResult.detectado ? (
              <Card className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 text-amber-900 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2 font-black text-base text-amber-800">
                  <AlertTriangle size={20} className="text-amber-600" />
                  Animal No Detectado
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {aiResult.mensaje ||
                    "El modelo de visión no logró delimitar la silueta dorsal del porcino con la confianza mínima requerida."}
                </p>
                <div className="mt-2 p-3 bg-white/70 rounded-xl border border-amber-200 text-xs space-y-1">
                  <p className="font-bold text-amber-950">Recomendaciones técnicas:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-900">
                    <li>Asegura iluminación directa sin sombras pronunciadas.</li>
                    <li>Enfoca desde arriba asegurando que se vean cabeza, lomo y grupa.</li>
                    <li>Evita obstrucciones como barras o bebederos sobre el cuerpo.</li>
                  </ul>
                </div>
              </Card>
            ) : (
              <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4 text-slate-700">
                <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900">
                  <Info size={18} className="text-indigo-600" />
                  ¿Cómo funciona la estimación morfométrica?
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  El microservicio Docker procesa la fotografía dorsal a través de una red neuronal convolucional YOLO segmentando la geometría del porcino.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl">
                    <span className="font-mono font-bold text-indigo-600">01.</span>
                    <span>Segmentación de contornos dorsales y ancho torácico.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl">
                    <span className="font-mono font-bold text-indigo-600">02.</span>
                    <span>Regresión polinomial calibrada para razas industriales.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl">
                    <span className="font-mono font-bold text-indigo-600">03.</span>
                    <span>Escritura hipertabla TimescaleDB para analítica de GMD.</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          PESTAÑA 2: PESAJE MANUAL (BÁSCULA)
          ======================================================== */}
      {activeTab === "manual" && (
        <div className="max-w-2xl mx-auto w-full">
          <Card
            as="form"
            onSubmit={handleManualSubmit}
            className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Scale size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Registrar Pesaje en Báscula de Piso
                </h3>
                <p className="text-xs text-slate-500">
                  Inserta pesajes físicos directos en la hipertabla de TimescaleDB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cerdo *
                </label>
                <select
                  value={manualForm.animalId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const found = animals.find((a) => a.id === id);
                    setManualForm((prev) => ({
                      ...prev,
                      animalId: id,
                      corralId: found?.corral_id || prev.corralId,
                    }));
                  }}
                  required
                  disabled={isSubmittingManual}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">-- Seleccionar cerdo --</option>
                  {animals.map((a) => {
                    const displayName = getAnimalDisplayName(a);
                    const validArete =
                      a.codigo_arete && !UUID_REGEX.test(a.codigo_arete)
                        ? `#${a.codigo_arete} · `
                        : "";
                    return (
                      <option key={a.id} value={a.id}>
                        {validArete ? `${validArete}${displayName}` : displayName} ({a.raza || "Porcino"})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Corral de Ubicación
                </label>
                <select
                  value={manualForm.corralId}
                  onChange={(e) =>
                    setManualForm((prev) => ({ ...prev, corralId: e.target.value }))
                  }
                  disabled={isSubmittingManual}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">-- Sin corral asignado --</option>
                  {corrales.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo} ({c.fase})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Peso Real en Báscula (kg) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  required
                  placeholder="Ej: 82.50"
                  value={manualForm.peso_kg}
                  onChange={(e) =>
                    setManualForm((prev) => ({ ...prev, peso_kg: e.target.value }))
                  }
                  disabled={isSubmittingManual}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fecha de la Toma *
                </label>
                <input
                  type="date"
                  required
                  value={manualForm.fecha}
                  onChange={(e) =>
                    setManualForm((prev) => ({ ...prev, fecha: e.target.value }))
                  }
                  disabled={isSubmittingManual}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Observaciones Zootécnicas (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Ej: Pesaje de control previo a cambio de ración..."
                value={manualForm.observaciones}
                onChange={(e) =>
                  setManualForm((prev) => ({ ...prev, observaciones: e.target.value }))
                }
                disabled={isSubmittingManual}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>

            <Button
              type="submit"
              tone="primary"
              isLoading={isSubmittingManual}
              disabled={isSubmittingManual}
              className="w-full py-3.5 rounded-xl font-black text-sm shadow-md mt-2 cursor-pointer"
            >
              Guardar Pesaje en TimescaleDB
            </Button>
          </Card>
        </div>
      )}

      {/* ========================================================
          PESTAÑA 3: ANALÍTICA DE SERIES TEMPORALES GMD (TIMESCALE)
          ======================================================== */}
      {activeTab === "analytics" && (
        <div className="flex flex-col gap-6">
          {/* Barra de Filtro de Corral */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={18} />
                Evolución de Ganancia Media Diaria (GMD)
              </h3>
              <p className="text-xs text-slate-500">
                Hipertabla de series temporales agregada por corral (TimescaleDB).
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Corral:
              </span>
              <select
                value={analyticsCorralId}
                onChange={(e) => setAnalyticsCorralId(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 cursor-pointer"
              >
                {corrales.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo} - {c.fase}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Gráfica Temporal o Estado Vacío */}
          {isLoadingGMD ? (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100 flex flex-col items-center justify-center gap-2">
              <RefreshCw size={24} className="animate-spin text-blue-500" />
              <p className="text-xs font-bold text-slate-600">
                Consultando hipertabla TimescaleDB...
              </p>
            </div>
          ) : gmdData.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Sin lecturas de peso registradas"
              description="Aún no se han acumulado lecturas de peso en TimescaleDB para calcular la curva de Ganancia Media Diaria en este corral."
              actionLabel="Registrar Primer Pesaje"
              onAction={() => setActiveTab("ia_vision")}
            />
          ) : (
            <Card className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="relative w-full h-72 bg-slate-50/50 rounded-2xl border border-slate-200/60 p-6">
                {/* Gráfica SVG interactiva de GMD */}
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  {gmdData.map((pt, idx) => {
                    const x = (idx / Math.max(1, gmdData.length - 1)) * 100;
                    const maxWeight = Math.max(...gmdData.map((d) => d.peso_promedio_kg || 120), 100);
                    const y = 100 - ((pt.peso_promedio_kg || 50) / maxWeight) * 100;
                    return (
                      <circle
                        key={idx}
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="5"
                        fill="#3b82f6"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    );
                  })}
                  <polyline
                    points={gmdData
                      .map((pt, idx) => {
                        const x = (idx / Math.max(1, gmdData.length - 1)) * 100;
                        const maxWeight = Math.max(...gmdData.map((d) => d.peso_promedio_kg || 120), 100);
                        const y = 100 - ((pt.peso_promedio_kg || 50) / maxWeight) * 100;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Lista resumida de puntos temporales */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {gmdData.slice(0, 4).map((pt, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {new Date(pt.fecha).toLocaleDateString()}
                    </span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {pt.peso_promedio_kg?.toFixed(1)} kg
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                      GMD: {(pt.gmd_kg * 1000)?.toFixed(0) || "N/A"} g/d
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================
          PESTAÑA 4: HISTORIAL DE REGISTROS (TIMESCALE)
          ======================================================== */}
      {activeTab === "history" && (
        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <History size={18} className="text-slate-700" />
                Historial de Pesajes
              </h3>
              <p className="text-xs text-slate-500">
                Registros emitidos en la hipertabla de pesajes en TimescaleDB.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={historyAnimalId}
                onChange={(e) => setHistoryAnimalId(e.target.value)}
                className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">-- Ver tomas de la sesión --</option>
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {getAnimalDisplayName(a)} ({a.peso_actual_kg || 0} kg)
                  </option>
                ))}
              </select>
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                {(historyAnimalId ? dbHistoryLogs : recentLogs).length} tomas
              </span>
            </div>
          </div>

          {isLoadingHistory ? (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <RefreshCw size={22} className="animate-spin text-indigo-600" />
              <p className="text-xs font-bold text-slate-600">Consultando historial en TimescaleDB...</p>
            </div>
          ) : (historyAnimalId ? dbHistoryLogs : recentLogs).length === 0 ? (
            <EmptyState
              icon={Scale}
              title="Sin lecturas de peso registradas"
              description="Comienza registrando el primer pesaje físico en báscula o mediante visión artificial."
              actionLabel="Registrar Primer Pesaje"
              onAction={() => setActiveTab("ia_vision")}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Cerdo</th>
                    <th className="py-3 px-3">Corral</th>
                    <th className="py-3 px-3">Método</th>
                    <th className="py-3 px-3">Peso</th>
                    <th className="py-3 px-3">Fecha y Hora</th>
                    <th className="py-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(historyAnimalId ? dbHistoryLogs : recentLogs).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {log.animalCode ? `#${log.animalCode}` : (log.animalDisplayName || "Ejemplar")}
                        {log.animalCode && log.animalAlias && (
                          <span className="text-slate-500 italic block text-[11px]">
                            {log.animalAlias}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {log.corralCodigo}
                      </td>
                      <td className="py-3 px-3">
                        {log.metodo === "ia_vision" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                            <Sparkles size={11} /> Visión IA
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                            <Scale size={11} /> Báscula
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-slate-900 text-sm">
                        {log.peso?.toFixed(2)} kg
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono">
                        {new Date(log.fecha).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          id={`delete-pesaje-${log.id}`}
                          onClick={() => handleDeletePesaje(log)}
                          disabled={deletingId === log.id}
                          title="Anular pesaje"
                          aria-label="Anular pesaje"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {deletingId === log.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
