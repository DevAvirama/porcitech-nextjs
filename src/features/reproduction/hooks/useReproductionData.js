"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getServices,
  getFarrowings,
  getWeanings,
} from "@/services/reproductionService";
import { getAnimales } from "@/services/animalService";
import { getCorrales } from "@/services/corralService";

export const GESTATION_DAYS = 114; // Duración fisiológica estándar de gestación porcina

export const SERVICE_STATUS_BADGES = {
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

export function useReproductionData() {
  const [services, setServices] = useState([]);
  const [farrowings, setFarrowings] = useState([]);
  const [weanings, setWeanings] = useState([]);
  const [females, setFemales] = useState([]);
  const [males, setMales] = useState([]);
  const [corrales, setCorrales] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

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
        (a) => (a.sexo || "").toLowerCase().trim() === "hembra"
      );
      const boars = allAnimals.filter(
        (a) => (a.sexo || "").toLowerCase().trim() === "macho"
      );

      setFemales(sows);
      setMales(boars);
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

  // Filtrar sementales aptos
  const breedingMales = useMemo(() => {
    return males.filter((m) => {
      const isMacho = (m.sexo || "").toLowerCase().trim() === "macho";
      if (!isMacho) return false;
      const estado = (m.estado || "").toLowerCase();
      const estadoRep = (m.estado_reproductivo || m.estadoReproductivo || "").toLowerCase();
      if (estadoRep.includes("no reproductor") || estadoRep.includes("ceba")) return false;
      if (estado === "engorde" || estado === "ceba") return false;
      return true;
    });
  }, [males]);

  // Hembras con gestación confirmada positiva
  const confirmedFemales = useMemo(() => {
    return females.filter((f) => {
      if ((f.sexo || "").toLowerCase().trim() !== "hembra") return false;
      return services.some(
        (s) =>
          (s.hembra_id === f.id || s.id_cerda === f.id) &&
          s.estado_confirmacion === "positiva"
      );
    });
  }, [females, services]);

  // KPIs
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

  return {
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
  };
}
