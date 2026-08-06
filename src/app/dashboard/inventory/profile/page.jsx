import { Suspense } from "react";
import AnimalProfileView from "@/features/inventory/AnimalProfileView";

export default function AnimalProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Cargando perfil del animal...</div>}>
      <AnimalProfileView />
    </Suspense>
  );
}
