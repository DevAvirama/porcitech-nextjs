"use client";

import React, { useState } from "react";
import AnimalTable from "./components/AnimalTable";
import AddAnimalModal from "./components/AddAnimalModal";
import Card from "../../components/ui/Card";
import { PiggyBank } from "lucide-react";

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
    <div className="space-y-8 max-w-400 mx-auto pb-10">
      {/* Cabecera */}
      <Card
        as="header"
        className="flex flex-col gap-4 rounded-4xl lg:flex-row lg:items-center lg:justify-between border-t-4 border-sena-yellow"
      >
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <PiggyBank className="bg-sena-green h-7 w-7" />
            Registro de animales
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            Gestión y control del inventario porcino.
          </p>
        </div>
      </Card>

      <div className="space-y-10">
        {/* SECCIÓN PRINCIPAL */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-6 rounded-4xl shadow-sm">
            <div className="flex gap-3">
              <input
                placeholder="Buscar por Lote..."
                className="border rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-400 text-slate-900"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-sena-yellow text-slate-950 font-bold px-6 py-2 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                + Añadir Cerdo
              </button>
            </div>
          </div>
          <AnimalTable animals={filtered} onDelete={moveToTrash} />
        </div>

        {/* SECCIÓN PAPELERA (Solo aparece si hay algo) */}
        {trash.length > 0 && (
          <div className="space-y-4 opacity-80">
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
