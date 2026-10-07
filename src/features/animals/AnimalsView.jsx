"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  AlertTriangle,
  Layers,
  Inbox,
} from "lucide-react";
import AnimalTable from "./components/AnimalTable";
import AddAnimalModal from "./components/AddAnimalModal";
import AnimalQrModal from "./components/AnimalQrModal";
import ManageCorralsModal from "./components/ManageCorralsModal";
import EditAnimalModal from "./components/EditAnimalModal";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import ModuleHeader from "@/components/layout/ModuleHeader";
import { getAnimales, deleteAnimal } from "@/services/animalService";
import { getCorrales } from "@/services/corralService";
import { getAnimalDisplayName } from "@/utils/formatters";

const AnimalsView = () => {
  const [animals, setAnimals] = useState([]);
  const [corrales, setCorrales] = useState([]);
  const [trash, setTrash] = useState([]);

  // Estados de control y filtros
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCorral, setSelectedCorral] = useState("all");
  const [selectedEstado, setSelectedEstado] = useState("all");

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCorralModalOpen, setIsCorralModalOpen] = useState(false);
  const [selectedAnimalForQr, setSelectedAnimalForQr] = useState(null);
  const [selectedAnimalForEdit, setSelectedAnimalForEdit] = useState(null);

  // Cargar Corrales activos desde FastAPI
  const loadCorrales = useCallback(async () => {
    try {
      const data = await getCorrales(true);
      setCorrales(data || []);
    } catch (err) {
      console.warn("No se pudieron cargar los corrales:", err.message);
    }
  }, []);

  // Cargar lista de Animales aplicando filtros en FastAPI
  const loadAnimals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCorral && selectedCorral !== "all") params.corral_id = selectedCorral;
      if (selectedEstado && selectedEstado !== "all") params.estado = selectedEstado;

      const data = await getAnimales(params);
      setAnimals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener animales de la API:", err);
      setError(
        err.message || "No se pudo conectar con el servidor para obtener los animales.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCorral, selectedEstado]);

  // Cargar datos al montar
  useEffect(() => {
    loadCorrales();
  }, [loadCorrales]);

  // Recargar animales cuando cambien los filtros (con debounce para búsqueda)
  useEffect(() => {
    const handler = setTimeout(() => {
      loadAnimals();
    }, 250);

    return () => clearTimeout(handler);
  }, [loadAnimals]);

  // Cargar y persistir papelera local secundaria
  useEffect(() => {
    const storedTrash = localStorage.getItem("sip_animals_trash");
    if (storedTrash) {
      try {
        setTrash(JSON.parse(storedTrash));
      } catch {
        setTrash([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sip_animals_trash", JSON.stringify(trash));
  }, [trash]);

  // Mover animal a papelera local
  const moveToTrash = (id) => {
    const animal = animals.find((a) => a.id === id);
    if (animal) {
      setTrash((prev) => [animal, ...prev]);
      setAnimals((prev) => prev.filter((a) => a.id !== id));
      toast.success(`${getAnimalDisplayName(animal)} movido a la papelera`);
    }
  };

  // Recuperar animal de papelera
  const recoverFromTrash = (id) => {
    const animal = trash.find((a) => a.id === id);
    if (animal) {
      setAnimals((prev) => [animal, ...prev]);
      setTrash((prev) => prev.filter((a) => a.id !== id));
      toast.success(`${getAnimalDisplayName(animal)} restaurado a la lista activa`);
    }
  };

  // Eliminar definitivamente
  const permanentDelete = async (id) => {
    const animal = trash.find((a) => a.id === id);
    if (
      window.confirm(
        "¿Eliminar permanentemente este registro? Esta acción intentará removerlo de la base de datos.",
      )
    ) {
      try {
        await deleteAnimal(id);
      } catch (err) {
        console.warn("Aviso al eliminar en backend:", err.message);
      }
      setTrash((prev) => prev.filter((a) => a.id !== id));
      toast.success(`${getAnimalDisplayName(animal)} eliminado de forma permanente`);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Cabecera del Módulo */}
      <ModuleHeader
        category="GESTIÓN DE HATO"
        title="Registro de animales"
        description="Gestión y control del inventario porcino sincronizado con la base de datos."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={() => setIsCorralModalOpen(true)}
              tone="soft"
              className="rounded-xl! shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-1.5 font-bold text-sm py-2.5 px-4"
            >
              <Layers size={18} className="text-emerald-700" />
              Gestionar Corrales
            </Button>
            <Button
              type="button"
              onClick={() => setIsModalOpen(true)}
              tone="primary"
              className="rounded-xl! shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-sm py-2.5 px-4"
            >
              <Plus size={18} />
              Añadir Cerdo
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-6">
        {/* BARRA DE BÚSQUEDA Y FILTROS REALES */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Buscador */}
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Buscar por arete, alias o raza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Filtros por Corral y Estado */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Filtro de Corrales */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                Corral:
              </span>
              <select
                value={selectedCorral}
                onChange={(e) => setSelectedCorral(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">Todos los corrales</option>
                {corrales.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo} ({c.fase})
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Estado */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                Fase:
              </span>
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">Todas las fases</option>
                <option value="activo">Activo</option>
                <option value="precebo">Precebo</option>
                <option value="levante">Levante</option>
                <option value="engorde">Engorde / Ceba</option>
                <option value="maternidad">Maternidad</option>
                <option value="gestacion">Gestación</option>
                <option value="cuarentena">Cuarentena</option>
              </select>
            </div>

            {/* Botón Refrescar */}
            <button
              type="button"
              onClick={loadAnimals}
              title="Recargar datos desde la base de datos"
              disabled={isLoading}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <RefreshCw
                size={16}
                className={isLoading ? "animate-spin text-emerald-600" : ""}
              />
            </button>
          </div>
        </div>

        {/* ALERTA DE ERROR DE CONEXIÓN */}
        {error && (
          <div className="flex items-start justify-between gap-4 p-5 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="shrink-0 text-amber-600 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-sm">Problema al comunicar con la API</p>
                <p className="text-xs text-amber-700 mt-1">{error}</p>
                <p className="text-xs text-slate-500 mt-2">
                  Verifica que el servicio backend FastAPI esté en ejecución en{" "}
                  <code>http://localhost:8000</code>.
                </p>
              </div>
            </div>
            <Button
              onClick={loadAnimals}
              tone="soft"
              className="text-xs py-2 px-3 shrink-0"
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* TABLA PRINCIPAL DE ANIMALES O ESTADOS */}
        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-24" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : animals.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={
              searchTerm || selectedCorral !== "all" || selectedEstado !== "all"
                ? "No se encontraron animales con los filtros aplicados"
                : "Sin animales registrados en la base de datos"
            }
            description={
              searchTerm || selectedCorral !== "all" || selectedEstado !== "all"
                ? "No hay resultados para los filtros seleccionados. Intenta restablecer los filtros."
                : "Aún no hay cerdos registrados en la base de datos de PostgreSQL. Comienza añadiendo el primer ejemplar al sistema."
            }
            actionLabel={
              searchTerm || selectedCorral !== "all" || selectedEstado !== "all"
                ? "Restablecer Filtros"
                : "+ Registrar Primer Animal"
            }
            onAction={
              searchTerm || selectedCorral !== "all" || selectedEstado !== "all"
                ? () => {
                    setSearchTerm("");
                    setSelectedCorral("all");
                    setSelectedEstado("all");
                  }
                : () => setIsModalOpen(true)
            }
          />
        ) : (
          <AnimalTable
            animals={animals}
            onDelete={moveToTrash}
            onOpenQr={(animal) => setSelectedAnimalForQr(animal)}
            onEditAnimal={(animal) => setSelectedAnimalForEdit(animal)}
          />
        )}

        {/* SECCIÓN PAPELERA (Solo si hay animales movidos a la papelera) */}
        {trash.length > 0 && (
          <div className="flex flex-col gap-4 opacity-80 mt-4">
            <div className="flex items-center gap-3 bg-slate-200/60 p-4 rounded-2xl">
              <span className="text-xl">🗑️</span>
              <h3 className="font-bold text-slate-700 uppercase tracking-widest text-xs">
                Papelera de Reciclaje ({trash.length})
              </h3>
            </div>
            <AnimalTable
              animals={trash}
              isTrash={true}
              onRecover={recoverFromTrash}
              onPermanentDelete={permanentDelete}
              onEditAnimal={(animal) => setSelectedAnimalForEdit(animal)}
            />
          </div>
        )}

        {/* MODAL REGISTRAR ANIMAL */}
        <AddAnimalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            loadAnimals();
          }}
          corrales={corrales}
        />

        {/* MODAL GESTIONAR CORRALES */}
        <ManageCorralsModal
          isOpen={isCorralModalOpen}
          onClose={() => setIsCorralModalOpen(false)}
          corrales={corrales}
          animals={animals}
          onCorralesUpdated={(updated) => {
            setCorrales(updated || []);
            loadAnimals();
          }}
        />

        {/* MODAL EDITAR / TRASLADAR ANIMAL */}
        <EditAnimalModal
          isOpen={Boolean(selectedAnimalForEdit)}
          onClose={() => setSelectedAnimalForEdit(null)}
          animal={selectedAnimalForEdit}
          corrales={corrales}
          onAnimalUpdated={() => {
            loadAnimals();
            loadCorrales();
          }}
        />

        {/* MODAL DE CHAPETA E IMPRESIÓN QR */}
        <AnimalQrModal
          animal={selectedAnimalForQr}
          isOpen={Boolean(selectedAnimalForQr)}
          onClose={() => setSelectedAnimalForQr(null)}
        />
      </div>
    </div>
  );
};

export default AnimalsView;
