"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import AddHealthRecordModal from "./components/AddHealthRecordModal";

const dummyRecords = [
  { id: 1, animalCode: "SIP-003", type: "Vacunación", details: "Dosis Triple Porcina", date: "2026-06-09", veterinarian: "Dr. Carlos Rojas" },
  { id: 2, animalCode: "SIP-002", type: "Tratamiento", details: "Antibiótico por fiebre leve", date: "2026-06-08", veterinarian: "Dr. Carlos Rojas" },
];

export default function HealthView() {
  const [isOpen, setIsOpen] = useState(false);
  const headers = ["Animal", "Tipo Evento", "Detalles", "Fecha", "Veterinario"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Novedades Clínicas</h1>
          <p className="text-zinc-400 text-sm">Registro de historial médico, vacunas y alertas clínicas.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} variant="primary">
          Registrar Novedad
        </Button>
      </div>

      <Card className="space-y-4">
        <h3 className="text-base font-bold text-white">Historial de Eventos Médicos</h3>
        <Table headers={headers}>
          {dummyRecords.map((rec) => (
            <tr key={rec.id} className="hover:bg-zinc-900/40 transition-colors">
              <td className="px-4 py-3.5 font-medium text-white">{rec.animalCode}</td>
              <td className="px-4 py-3.5">{rec.type}</td>
              <td className="px-4 py-3.5">{rec.details}</td>
              <td className="px-4 py-3.5 text-zinc-400 text-xs">{rec.date}</td>
              <td className="px-4 py-3.5 text-zinc-400">{rec.veterinarian}</td>
            </tr>
          ))}
        </Table>
      </Card>

      <AddHealthRecordModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
