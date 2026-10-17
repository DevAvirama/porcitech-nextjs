"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ModuleHeader from "@/components/layout/ModuleHeader";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { ChevronLeft, QrCode, AlertCircle } from "lucide-react";
import { getAnimalDisplayName } from "@/utils/formatters";

import AnimalQrModal from "./components/AnimalQrModal";
import ProfileBadge from "./components/profile/ProfileBadge";
import AnimalProfileHeader from "./components/profile/AnimalProfileHeader";
import ProfileResumenTab from "./components/profile/ProfileResumenTab";
import ProfileSaludTab from "./components/profile/ProfileSaludTab";
import ProfileProduccionTab from "./components/profile/ProfileProduccionTab";
import ProfileReproduccionTab from "./components/profile/ProfileReproduccionTab";
import { useAnimalProfile } from "./hooks/useAnimalProfile";

const TABS = [
  { id: "resumen", label: "Resumen General" },
  { id: "salud", label: "Historial Médico" },
  { id: "produccion", label: "Producción y Peso" },
  { id: "reproduccion", label: "Reproducción" },
];

export default function AnimalProfileView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const animalId = searchParams.get("code") || searchParams.get("id");

  const [activeTab, setActiveTab] = useState("resumen");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const {
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
  } = useAnimalProfile(animalId);

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
            <ProfileBadge estado={animal.etapa} type="etapa" />
            <ProfileBadge estado={animal.estadoSalud} type="salud" />
          </div>
        }
      />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 w-full space-y-6">
          {/* Header de Perfil con Datos y Acciones */}
          <AnimalProfileHeader
            animal={animal}
            isMacho={isMacho}
            isSemental={isSemental}
            tratamientos={tratamientos}
            onOpenQrModal={() => setIsQrModalOpen(true)}
            onNavigateWeight={() => router.push("/dashboard/weight")}
            onNavigateHealth={() => router.push("/dashboard/health")}
          />

          {/* Navegación por Pestañas */}
          <Card className="p-2 bg-white rounded-4xl shadow-sm border border-slate-100">
            <div className="flex overflow-x-auto no-scrollbar gap-2 p-2">
              {TABS.map((tab) => (
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
              {activeTab === "resumen" && (
                <ProfileResumenTab
                  animal={animal}
                  isMacho={isMacho}
                  isSemental={isSemental}
                  tratamientos={tratamientos}
                />
              )}
              {activeTab === "salud" && (
                <ProfileSaludTab
                  animal={animal}
                  tratamientos={tratamientos}
                  onNavigateHealth={() => router.push("/dashboard/health")}
                />
              )}
              {activeTab === "produccion" && (
                <ProfileProduccionTab
                  pesajes={pesajes}
                  onNavigateWeight={() => router.push("/dashboard/weight")}
                />
              )}
              {activeTab === "reproduccion" && (
                <ProfileReproduccionTab
                  animal={animal}
                  isMacho={isMacho}
                  isSemental={isSemental}
                  coberturas={coberturas}
                  partos={partos}
                  onNavigateProduction={() => setActiveTab("produccion")}
                  onNavigateReproduction={() => router.push("/dashboard/reproduction")}
                />
              )}
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
