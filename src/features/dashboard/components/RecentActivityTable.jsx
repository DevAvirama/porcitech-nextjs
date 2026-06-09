import Table from "@/components/ui/Table";
import Card from "@/components/ui/Card";

export default function RecentActivityTable() {
  const headers = ["Fecha", "Módulo", "Actividad", "Operario"];
  const logs = [
    { date: "16:15", module: "Pesaje", text: "Lote A pesó 95kg promedio", user: "Pedro" },
    { date: "15:30", module: "Sanidad", text: "Aplicación vacuna Triple Porcina", user: "Juan" },
    { date: "14:10", module: "Inventario", text: "Salida 2 bultos preiniciador", user: "María" },
    { date: "10:00", module: "Reproducción", text: "Nacimiento camada C-4", user: "Sonia" },
  ];

  return (
    <Card className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-white">Actividad Reciente</h3>
      </div>
      <Table headers={headers}>
        {logs.map((log, index) => (
          <tr key={index} className="hover:bg-zinc-900/40 transition-colors">
            <td className="px-4 py-3 text-zinc-400 text-xs">{log.date}</td>
            <td className="px-4 py-3 font-semibold text-zinc-200">{log.module}</td>
            <td className="px-4 py-3 text-zinc-300">{log.text}</td>
            <td className="px-4 py-3 text-zinc-400">{log.user}</td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}
