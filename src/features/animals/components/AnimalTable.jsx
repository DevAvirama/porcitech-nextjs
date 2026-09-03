import Table from "../../../components/ui/Table";
import AnimalStatusBadge from "./AnimalStatusBadge";
import { QrCode, FileText } from "lucide-react";
import Link from "next/link";

const AnimalTable = ({
  animals,
  onDelete,
  isTrash,
  onRecover,
  onPermanentDelete,
  onOpenQr,
}) => {
  const columns = [
    {
      key: "id",
      header: "ID",
      render: (row) => (
        <span className="font-bold text-slate-800">#{row.id || "N/A"}</span>
      ),
    },
    { key: "lote", header: "LOTE" },
    { key: "raza", header: "RAZA" },
    {
      key: "estado",
      header: "ESTADO",
      render: (row) => <AnimalStatusBadge status={row.estado} />,
    },
    {
      key: "acciones",
      header: isTrash ? "ACCIONES PAPELERA" : "ACCIONES",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          {isTrash ? (
            <>
              <button
                onClick={() => onRecover(row.id)}
                title="Recuperar"
                className="text-xl hover:scale-120 transition-transform cursor-pointer"
              >
                🔄
              </button>
              <button
                onClick={() => onPermanentDelete(row.id)}
                title="Eliminar para siempre"
                className="text-xl hover:scale-120 transition-transform text-red-500 cursor-pointer"
              >
                ❌
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/dashboard/animals/profile?id=${row.id}`}
                title="Ver Hoja de Vida / Expediente"
                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all shadow-xs cursor-pointer flex items-center gap-1 text-xs font-bold"
              >
                <FileText size={15} />
                <span className="hidden sm:inline">Ficha</span>
              </Link>
              {onOpenQr && (
                <button
                  type="button"
                  onClick={() => onOpenQr(row)}
                  title="Ver / Imprimir Chapeta QR"
                  className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-xs cursor-pointer"
                >
                  <QrCode size={16} />
                </button>
              )}
              <button
                onClick={() => onDelete(row.id)}
                title="Mover a papelera"
                className="text-slate-300 hover:text-red-500 text-xl transition-all cursor-pointer"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return <Table columns={columns} rows={animals} />;
};

export default AnimalTable;
