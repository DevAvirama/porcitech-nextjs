"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package,
  ArrowLeft,
  Warehouse,
  AlertTriangle,
  DollarSign,
  Layers,
  Clock,
  RefreshCw,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import { formatDateTime } from "@/utils/formatters";
import {
  getItemById,
  getMovements,
  registerMovement,
} from "@/services/inventoryService";

const MOVEMENT_CONFIG = {
  entrada_compra: {
    label: "Entrada Compra",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: ArrowDownLeft,
    sign: "+",
    signColor: "text-emerald-600",
  },
  salida_consumo: {
    label: "Salida Consumo",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    icon: ArrowUpRight,
    sign: "-",
    signColor: "text-blue-600",
  },
  ajuste_merma: {
    label: "Ajuste Merma",
    badgeClass: "bg-rose-100 text-rose-700 border-rose-200",
    icon: TrendingDown,
    sign: "-",
    signColor: "text-rose-600",
  },
  devolucion: {
    label: "Devolución",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    icon: ArrowDownLeft,
    sign: "+",
    signColor: "text-amber-600",
  },
};

export default function InventoryProfileView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get("id");

  const [item, setItem] = useState(null);
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal de movimiento
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [movementForm, setMovementForm] = useState({
    tipo_movimiento: "salida_consumo",
    cantidad: "",
    costo_unitario: "",
    motivo: "",
  });

  const loadItemDetails = useCallback(async () => {
    if (!itemId) {
      setError("No se proporcionó un ID de insumo válido.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [itemData, movementsData] = await Promise.all([
        getItemById(itemId),
        getMovements({ item_id: itemId, limite: 20 }),
      ]);
      setItem(itemData);
      setMovements(Array.isArray(movementsData) ? movementsData : []);
      setMovementForm((prev) => ({
        ...prev,
        costo_unitario: itemData?.costo_unitario
          ? String(itemData.costo_unitario)
          : "",
      }));
    } catch (err) {
      console.error("Error al cargar ficha de insumo:", err);
      setError(
        err.message ||
          "No fue posible cargar el detalle del insumo desde PostgreSQL."
      );
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    loadItemDetails();
  }, [loadItemDetails]);

  const handleRegisterMovement = async (e) => {
    e.preventDefault();
    const qty = parseFloat(movementForm.cantidad);
    if (isNaN(qty) || qty <= 0) {
      toast.error("La cantidad debe ser un número positivo mayor a 0");
      return;
    }
    if (!movementForm.motivo.trim()) {
      toast.error("Debe ingresar un motivo o justificación");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerMovement({
        item_id: itemId,
        tipo_movimiento: movementForm.tipo_movimiento,
        cantidad: qty,
        costo_unitario: movementForm.costo_unitario
          ? parseFloat(movementForm.costo_unitario)
          : undefined,
        motivo: movementForm.motivo.trim(),
      });

      toast.success("Movimiento registrado en Kardex");
      setIsMovementModalOpen(false);
      setMovementForm({
        tipo_movimiento: "salida_consumo",
        cantidad: "",
        costo_unitario: item?.costo_unitario ? String(item.costo_unitario) : "",
        motivo: "",
      });
      await loadItemDetails();
    } catch (err) {
      console.error("Error al registrar movimiento:", err);
      toast.error(err.message || "Fallo al registrar el movimiento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const movementColumns = [
    {
      key: "fecha",
      header: "Fecha / Momento (COT)",
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
          {formatDateTime(row.fecha_movimiento)}
        </span>
      ),
    },
    {
      key: "tipo",
      header: "Operación",
      render: (row) => {
        const config =
          MOVEMENT_CONFIG[row.tipo_movimiento] || {
            label: row.tipo_movimiento || "Movimiento",
            badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
            icon: RefreshCw,
            sign: "",
            signColor: "text-slate-600",
          };
        const Icon = config.icon;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${config.badgeClass}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </span>
        );
      },
    },
    {
      key: "cantidad",
      header: "Cantidad",
      render: (row) => {
        const config = MOVEMENT_CONFIG[row.tipo_movimiento] || {
          sign: "",
          signColor: "text-slate-900",
        };
        return (
          <span className={`font-black text-sm ${config.signColor}`}>
            {config.sign}
            {Number(row.cantidad).toLocaleString("es-CO")}
          </span>
        );
      },
    },
    {
      key: "motivo",
      header: "Motivo / Justificación",
      render: (row) => (
        <span className="text-xs text-slate-600">{row.motivo}</span>
      ),
    },
    {
      key: "usuario",
      header: "Responsable",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
          {row.usuario_nombre || "Sistema"}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="w-full space-y-6 animate-pulse p-6">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-3xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-8">
        <EmptyState
          icon={AlertTriangle}
          title="Insumo no encontrado"
          description={error || "El insumo solicitado no existe en la base de datos."}
          actionLabel="Volver al Inventario"
          onAction={() => router.push("/dashboard/inventory")}
        />
      </div>
    );
  }

  const stockActual = Number(item.stock_actual) || 0;
  const stockMinimo = Number(item.stock_minimo) || 0;
  const costoUnitario = Number(item.costo_unitario) || 0;
  const valorTotal = stockActual * costoUnitario;
  const isCritical = stockActual <= stockMinimo;

  return (
    <div className="w-full flex flex-col gap-6 text-slate-900">
      {/* Botón Volver y Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push("/dashboard/inventory")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Volver al Inventario</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
              {item.codigo_sku}
            </span>
            <h1 className="text-3xl font-black text-slate-950">{item.nombre}</h1>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
            <Warehouse className="h-3.5 w-3.5" />
            Ubicación: <strong>{item.ubicacion_bodega || "Bodega Central"}</strong> · Categoría:{" "}
            <span className="capitalize font-bold text-indigo-600">
              {item.categoria_codigo || "General"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsMovementModalOpen(true)}
            tone="primary"
            className="flex items-center gap-2 font-bold rounded-xl! shadow-md"
          >
            <Plus size={16} />
            Registrar Movimiento
          </Button>
        </div>
      </div>

      {/* Alerta de Stock Crítico */}
      {isCritical && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-900 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <div>
            <p className="text-sm font-bold">Alerta: Nivel de Stock Crítico</p>
            <p className="text-xs text-rose-700 mt-0.5">
              La existencia actual ({stockActual} {item.unidad_medida}) está en o por debajo del umbral mínimo de seguridad ({stockMinimo} {item.unidad_medida}). Se requiere generar orden de reposición.
            </p>
          </div>
        </div>
      )}

      {/* KPIs del Insumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Stock Actual
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={`text-3xl font-black ${
                isCritical ? "text-rose-600" : "text-slate-900"
              }`}
            >
              {stockActual.toLocaleString("es-CO")}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {item.unidad_medida}
            </span>
          </div>
          <span
            className={`mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-black ${
              isCritical
                ? "bg-rose-100 text-rose-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isCritical ? "Requiere Compra" : "Stock Normal"}
          </span>
        </Card>

        <Card className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Stock Mínimo
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900">
              {stockMinimo.toLocaleString("es-CO")}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {item.unidad_medida}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Umbral de seguridad
          </p>
        </Card>

        <Card className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Costo Unitario
          </p>
          <h4 className="text-3xl font-black text-slate-900 mt-2">
            ${costoUnitario.toLocaleString("es-CO")}
          </h4>
          <p className="text-[11px] text-slate-400 mt-2">
            Por {item.unidad_medida}
          </p>
        </Card>

        <Card className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Valorización Total
          </p>
          <h4 className="text-3xl font-black text-emerald-600 mt-2">
            ${valorTotal.toLocaleString("es-CO")}
          </h4>
          <p className="text-[11px] text-slate-400 mt-2">
            Capital en inventario
          </p>
        </Card>
      </div>

      {/* Historial de Movimientos de este insumo */}
      <section className="bg-white rounded-3xl shadow-sm overflow-hidden p-2 border border-slate-100">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-900">
            Historial de Kardex para este Insumo
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de entradas por compras, consumos y mermas de este producto
          </p>
        </div>

        {movements.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">
              Sin movimientos registrados para este insumo
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Las entradas y salidas que se registren aparecerán aquí.
            </p>
          </div>
        ) : (
          <Table columns={movementColumns} rows={movements} />
        )}
      </section>

      {/* Modal de Movimiento */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <Card
            as="form"
            onSubmit={handleRegisterMovement}
            className="w-full max-w-md p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
          >
            <button
              type="button"
              onClick={() => setIsMovementModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-600" />
              Movimiento de Kardex
            </h3>
            <p className="text-xs text-slate-500 font-semibold mb-6">
              {item.nombre} ({item.unidad_medida})
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Tipo de Operación *
                </label>
                <select
                  value={movementForm.tipo_movimiento}
                  onChange={(e) =>
                    setMovementForm({
                      ...movementForm,
                      tipo_movimiento: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-sm cursor-pointer"
                  required
                >
                  <option value="entrada_compra">Entrada por Compra</option>
                  <option value="salida_consumo">Salida por Consumo</option>
                  <option value="ajuste_merma">Ajuste por Merma</option>
                  <option value="devolucion">Devolución</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Cantidad ({item.unidad_medida}) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="Ej: 10.00"
                  value={movementForm.cantidad}
                  onChange={(e) =>
                    setMovementForm({
                      ...movementForm,
                      cantidad: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Motivo / Justificación *
                </label>
                <Input
                  placeholder="Ej: Suministro dieta lote 42"
                  required
                  value={movementForm.motivo}
                  onChange={(e) =>
                    setMovementForm({
                      ...movementForm,
                      motivo: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                tone="soft"
                onClick={() => setIsMovementModalOpen(false)}
                className="flex-1 font-bold rounded-xl!"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                tone="primary"
                className="flex-1 font-black rounded-xl!"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Confirmar"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
