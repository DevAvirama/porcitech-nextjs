import { Suspense } from "react";
import AnimalProfileView from "@/features/animals/AnimalProfileView";

export const metadata = {
  title: "Hoja de Vida Porcina | Sistema Integral Porcino",
  description: "Expediente biológico integral, historial sanitario y trazabilidad del ejemplar.",
};

export default function AnimalProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Cargando expediente del porcino...</div>}>
      <AnimalProfileView />
    </Suspense>
  );
}
