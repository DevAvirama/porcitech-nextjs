"use client";

import { useState } from "react";
import AnimalTable from "./components/AnimalTable";
import AddAnimalModal from "./components/AddAnimalModal";
import Button from "@/components/ui/Button";

const dummyAnimals = [
  { id: 1, code: "SIP-001", breed: "Landrace", weight: 85, status: "activo", lastRecord: "2026-06-08" },
  { id: 2, code: "SIP-002", breed: "Duroc", weight: 92, status: "activo", lastRecord: "2026-06-07" },
  { id: 3, code: "SIP-003", breed: "Yorkshire", weight: 78, status: "cuarentena", lastRecord: "2026-06-09" },
  { id: 4, code: "SIP-004", breed: "Landrace", weight: 110, status: "gestacion", lastRecord: "2026-06-05" },
];

export default function AnimalsView() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Control de Porcinos</h1>
          <p className="text-zinc-400 text-sm">Registro, estado y trazabilidad biológica de los lotes.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} variant="primary">
          Registrar Animal
        </Button>
      </div>

      <AnimalTable animals={dummyAnimals} />

      <AddAnimalModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
