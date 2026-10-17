"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { getAnimales } from "@/services/animalService";
import { getCorrales } from "@/services/corralService";

/**
 * Hook personalizado para gestionar datos maestros de animales y corrales
 * para el módulo de pesaje y biometría.
 */
export function useWeightData() {
  const [animals, setAnimals] = useState([]);
  const [corrales, setCorrales] = useState([]);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoadingMasterData(true);
    try {
      const [animalsRes, corralesRes] = await Promise.all([
        getAnimales(),
        getCorrales(true),
      ]);
      setAnimals(Array.isArray(animalsRes) ? animalsRes : []);
      setCorrales(Array.isArray(corralesRes) ? corralesRes : []);
    } catch (err) {
      console.error("Error al cargar datos maestros de pesaje:", err);
      toast.error("No se pudo sincronizar la lista de animales o corrales");
    } finally {
      setIsLoadingMasterData(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshAnimals = useCallback(async () => {
    try {
      const animalsRes = await getAnimales();
      setAnimals(Array.isArray(animalsRes) ? animalsRes : []);
    } catch (err) {
      console.warn("No se pudo recargar la lista de animales:", err.message);
    }
  }, []);

  const averageWeight = useMemo(() => {
    if (animals.length === 0) return "0.0";
    const pesosValidos = animals
      .map((a) => a.peso_actual_kg)
      .filter((p) => p !== null && p !== undefined && p > 0);
    if (pesosValidos.length === 0) return "0.0";
    const sum = pesosValidos.reduce((acc, curr) => acc + curr, 0);
    return (sum / pesosValidos.length).toFixed(1);
  }, [animals]);

  return {
    animals,
    setAnimals,
    corrales,
    isLoadingMasterData,
    refreshAnimals,
    averageWeight,
  };
}
