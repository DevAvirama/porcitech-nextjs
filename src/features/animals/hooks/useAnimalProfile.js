"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getAnimalById, getAnimalByQr } from "@/services/animalService";
import { getServices, getFarrowings } from "@/services/reproductionService";
import { getTreatments } from "@/services/healthService";
import { getAnimalWeightHistory } from "@/services/weightService";
import { UUID_REGEX } from "@/utils/formatters";

export function useAnimalProfile(animalId) {
  const [animalData, setAnimalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coberturas, setCoberturas] = useState([]);
  const [partos, setPartos] = useState([]);
  const [pesajes, setPesajes] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);

  const loadProfile = useCallback(async () => {
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
    const isMale = (found.sexo || "").toLowerCase() === "macho";

    // Cargar tratamientos, pesajes, servicios y partos en paralelo
    const [treatmentsRes, weightsRes, servicesRes, partosRes] = await Promise.allSettled([
      getTreatments({ animal_id: targetId }),
      getAnimalWeightHistory(targetId),
      getServices(isMale ? {} : { hembra_id: targetId }),
      isMale ? Promise.resolve([]) : getFarrowings({ hembra_id: targetId }),
    ]);

    let realTreatments = [];
    if (treatmentsRes.status === "fulfilled" && Array.isArray(treatmentsRes.value)) {
      realTreatments = treatmentsRes.value;
      setTratamientos(treatmentsRes.value);
    } else if (treatmentsRes.status === "rejected") {
      console.warn("Aviso al cargar tratamientos clínicos:", treatmentsRes.reason?.message);
    }

    if (weightsRes.status === "fulfilled" && Array.isArray(weightsRes.value)) {
      setPesajes(weightsRes.value);
    } else if (weightsRes.status === "rejected") {
      console.warn("Aviso al cargar pesajes del animal:", weightsRes.reason?.message);
    }

    if (servicesRes.status === "fulfilled" && Array.isArray(servicesRes.value)) {
      const allServices = servicesRes.value;
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
    } else if (servicesRes.status === "rejected") {
      console.warn("Aviso al consultar servicios reproductivos:", servicesRes.reason?.message);
    }

    if (!isMale) {
      if (partosRes.status === "fulfilled" && Array.isArray(partosRes.value)) {
        const femalePartos = partosRes.value.filter(
          (p) => p.hembra_id === found.id || p.hembra_id === animalId
        );
        setPartos(femalePartos);
      } else if (partosRes.status === "rejected") {
        console.warn("Aviso al consultar partos de la hembra:", partosRes.reason?.message);
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
  }, [animalId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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

  const calcularEdad = useCallback((fecha) => {
    if (!fecha) return "No registrada";
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    if (isNaN(nacimiento.getTime())) return "No registrada";
    const meses =
      (hoy.getFullYear() - nacimiento.getFullYear()) * 12 +
      hoy.getMonth() -
      nacimiento.getMonth();
    return `${Math.max(0, meses)} meses`;
  }, []);

  return {
    animalData,
    animal,
    isMacho,
    isSemental,
    coberturas,
    partos,
    pesajes,
    tratamientos,
    isLoading,
    error,
    calcularEdad,
    loadProfile,
  };
}
