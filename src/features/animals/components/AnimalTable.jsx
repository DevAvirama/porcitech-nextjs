import Table from "@/components/ui/Table";
import AnimalStatusBadge from "./AnimalStatusBadge";

export default function AnimalTable({ animals = [] }) {
  const headers = ["Código", "Raza", "Peso", "Estado", "Último Registro"];

  return (
    <Table headers={headers}>
      {animals.length === 0 ? (
        <tr>
          <td colSpan={headers.length} className="px-4 py-8 text-center text-zinc-500 text-sm">
            No hay porcinos registrados en este lote.
          </td>
        </tr>
      ) : (
        animals.map((animal) => (
          <tr key={animal.id} className="hover:bg-zinc-900/40 transition-colors">
            <td className="px-4 py-3.5 font-medium text-white">{animal.code}</td>
            <td className="px-4 py-3.5">{animal.breed}</td>
            <td className="px-4 py-3.5">{animal.weight} kg</td>
            <td className="px-4 py-3.5">
              <AnimalStatusBadge status={animal.status} />
            </td>
            <td className="px-4 py-3.5 text-zinc-400 text-xs">{animal.lastRecord}</td>
          </tr>
        ))
      )}
    </Table>
  );
}
