"use client";

import React, { useState } from "react";
import AnimalTable from "./components/AnimalTable";
import AddAnimalModal from "./components/AddAnimalModal";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ModuleHeader from "@/components/layout/ModuleHeader";

const AnimalsView = () => {
  const [animals, setAnimals] = useState([
    {
      id: "2024-001",
      raza: "Duroc",
      edad: 5,
      lote: "Lote #42",
      estado: "SALUDABLE",
    },
    {
      id: "2024-042",
      raza: "Landrace",
      edad: 6,
      lote: "Lote #15",
      estado: "OBSERVACIÓN",
    },
  ]);
  const [trash, setTrash] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSave = (newAnimal) => {
    setAnimals([...animals, { ...newAnimal }]);
  };

  // Mover a papelera
  const moveToTrash = (id) => {
    const animal = animals.find((a) => a.id === id);
    setTrash([...trash, animal]);
    setAnimals(animals.filter((a) => a.id !== id));
  };

  // Recuperar de papelera
  const recover = (id) => {
    const animal = trash.find((a) => a.id === id);
    setAnimals([...animals, animal]);
    setTrash(trash.filter((a) => a.id !== id));
  };

  // Borrar PARA SIEMPRE
  const permanentDelete = (id) => {
    if (
      window.confirm(
        "¿Eliminar permanentemente? Esta acción no se puede deshacer.",
      )
    ) {
      setTrash(trash.filter((a) => a.id !== id));
    }
  };

  const filtered = animals.filter((a) =>
    a.lote.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="GESTIÓN DE HATO"
        title="Registro de animales"
        description="Gestión y control del inventario porcino."
        actions={
          <Button
            onClick={() => setIsModalOpen(true)}
            tone="primary"
            className="rounded-xl! shadow-md hover:shadow-xl transition-all duration-200"
          >
            + Añadir Cerdo
          </Button>
        }
      />

      <div className="flex flex-col gap-6">
        {/* SECCIÓN PRINCIPAL */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex gap-3 w-full max-w-md">
              <input
                placeholder="Buscar por Lote..."
                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-450 text-slate-900 bg-slate-50 border-slate-200 font-semibold"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <AnimalTable animals={filtered} onDelete={moveToTrash} />
        </div>

        {/* SECCIÓN PAPELERA (Solo aparece si hay algo) */}
        {trash.length > 0 && (
          <div className="flex flex-col gap-4 opacity-80 mt-4">
            <div className="flex items-center gap-4 bg-slate-200/50 p-4 rounded-2xl">
              <span className="text-xl">🗑️</span>
              <h3 className="font-bold text-slate-600 uppercase tracking-widest text-sm">
                Papelera de Reciclaje ({trash.length})
              </h3>
            </div>
            <AnimalTable
              animals={trash}
              isTrash={true}
              onRecover={recover}
              onPermanentDelete={permanentDelete}
            />
          </div>
        )}

        <AddAnimalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default AnimalsView;
