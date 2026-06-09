"use client";

import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import inventoryConstants from "./data/inventoryConstants.json";

export default function InventoryView() {
  const headers = ["Insumo", "Categoría", "Stock Actual", "Unidad", "Estado Alerta"];
  const stockItems = [
    { name: "Alimento Preiniciador", category: "alimento", quantity: 1200, unit: inventoryConstants.units.alimento },
    { name: "Vacuna Triple Porcina", category: "vacunas", quantity: 45, unit: inventoryConstants.units.vacunas },
    { name: "Antibiótico Oxitetraciclina", category: "medicamentos", quantity: 150, unit: inventoryConstants.units.medicamentos },
    { name: "Detergente Granja", category: "limpieza", quantity: 15, unit: inventoryConstants.units.limpieza },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">Control de Inventario</h1>
        <p className="text-zinc-400 text-sm">Monitoreo de existencias de insumos, medicamentos y raciones.</p>
      </div>

      <Card className="space-y-4">
        <h3 className="text-base font-bold text-white">Existencias de Almacén</h3>
        <Table headers={headers}>
          {stockItems.map((item, idx) => {
            const minStock = inventoryConstants.minStockThresholds[item.category];
            const isAlert = item.quantity <= minStock;

            return (
              <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                <td className="px-4 py-3.5 font-medium text-white">{item.name}</td>
                <td className="px-4 py-3.5 capitalize">{item.category}</td>
                <td className="px-4 py-3.5 font-semibold text-zinc-100">{item.quantity}</td>
                <td className="px-4 py-3.5 text-zinc-400 text-xs">{item.unit}</td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      isAlert
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {isAlert ? "Stock Crítico" : "Óptimo"}
                  </span>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}
