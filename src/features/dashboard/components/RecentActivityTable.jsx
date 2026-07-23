import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";

const DEFAULT_COLUMNS = [
  { key: "title", header: "Actividad" },
  { key: "meta", header: "Momento" },
  { key: "area", header: "Ubicación" },
];

const DEFAULT_ROWS = [
  { id: 1, title: "Nuevo lote registrado", meta: "Hace 2 horas", area: "Sector B-04" },
  { id: 2, title: "Vacunación completada", meta: "Hace 5 horas", area: "Sector A-12" },
  { id: 3, title: "Alerta de peso bajo", meta: "Ayer", area: "Corral 09" },
];

export default function RecentActivityTable({ rows = DEFAULT_ROWS }) {
  return (
    <Card>
      <h3 className="text-2xl font-black text-slate-950">Actividad reciente</h3>
      <div className="mt-6">
        <Table columns={DEFAULT_COLUMNS} rows={rows} />
      </div>
    </Card>
  );
}
