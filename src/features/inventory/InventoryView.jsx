"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingDown,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Edit3,
  Archive,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import ModuleHeader from "@/components/layout/ModuleHeader";
import inventoryConstants from "./data/inventoryConstants.json";

const initialSupplies = [
  {
    id: "INS-001",
    nombre: "Iniciación Lechones Precebo 1",
    categoria: "alimento",
    stock: 85,
    unidad: "Bultos (40kg)",
    stockMinimo: 20,
    lote: "LOT-AL-2026-08",
    fechaVencimiento: "2026-11-30",
    valorUnitario: 98000,
  },
  {
    id: "INS-002",
    nombre: "Ceba Finalización Harina Forte",
    categoria: "alimento",
    stock: 120,
    unidad: "Bultos (40kg)",
    stockMinimo: 30,
    lote: "LOT-AL-2026-12",
    fechaVencimiento: "2026-12-15",
    valorUnitario: 89000,
  },
  {
    id: "INS-003",
    nombre: "Lactancia Cerda Reproductora",
    categoria: "alimento",
    stock: 40,
    unidad: "Bultos (40kg)",
    stockMinimo: 15,
    lote: "LOT-AL-2026-05",
    fechaVencimiento: "2026-10-20",
    valorUnitario: 105000,
  },
  {
    id: "INS-004",
    nombre: "Ivermectina 1% Antiparasitario",
    categoria: "medicamento",
    stock: 6,
    unidad: "Frascos (250ml)",
    stockMinimo: 10,
    lote: "FAR-IV-889",
    fechaVencimiento: "2026-09-15",
    valorUnitario: 45000,
  },
  {
    id: "INS-005",
    nombre: "Vacuna Peste Porcina Clásica (PPC)",
    categoria: "medicamento",
    stock: 25,
    unidad: "Frascos (100ml)",
    stockMinimo: 15,
    lote: "VAC-PPC-202",
    fechaVencimiento: "2027-03-30",
    valorUnitario: 135000,
  },
  {
    id: "INS-006",
    nombre: "Oxitetraciclina L.A. 200mg",
    categoria: "medicamento",
    stock: 14,
    unidad: "Frascos (250ml)",
    stockMinimo: 8,
    lote: "FAR-OXI-774",
    fechaVencimiento: "2027-01-10",
    valorUnitario: 62000,
  },
  {
    id: "INS-007",
    nombre: "Hierro Dextrano 200mg + B12",
    categoria: "medicamento",
    stock: 18,
    unidad: "Frascos (100ml)",
    stockMinimo: 10,
    lote: "FAR-HD-109",
    fechaVencimiento: "2026-12-05",
    valorUnitario: 38000,
  },
  {
    id: "INS-008",
    nombre: "Desinfectante Glutaraldehído 50%",
    categoria: "bioseguridad",
    stock: 8,
    unidad: "Litros",
    stockMinimo: 12,
    lote: "BIO-GL-334",
    fechaVencimiento: "2027-06-20",
    valorUnitario: 55000,
  },
  {
    id: "INS-009",
    nombre: "Cal Viva Especial Desinfección",
    categoria: "bioseguridad",
    stock: 50,
    unidad: "Bultos (25kg)",
    stockMinimo: 20,
    lote: "BIO-CAL-04",
    fechaVencimiento: "2028-01-01",
    valorUnitario: 22000,
  },
  {
    id: "INS-010",
    nombre: "Electrolitos y Vitaminas Solubles",
    categoria: "suplemento",
    stock: 35,
    unidad: "Kg",
    stockMinimo: 15,
    lote: "SUP-VIT-901",
    fechaVencimiento: "2026-10-15",
    valorUnitario: 42000,
  },
];

export default function InventoryView() {
  const [supplies, setSupplies] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStockStatus, setFilterStockStatus] = useState("");

  // Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState("");

  // Formulario nuevo insumo
  const [newSupply, setNewSupply] = useState({
    nombre: "",
    categoria: "alimento",
    stock: "",
    unidad: "Bultos (40kg)",
    stockMinimo: "",
    lote: "",
    fechaVencimiento: "",
    valorUnitario: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("sip_warehouse_supplies");
    if (stored) {
      setSupplies(JSON.parse(stored));
    } else {
      setSupplies(initialSupplies);
      localStorage.setItem(
        "sip_warehouse_supplies",
        JSON.stringify(initialSupplies),
      );
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(
        "sip_warehouse_supplies",
        JSON.stringify(supplies),
      );
    }
  }, [supplies, isMounted]);

  // Cálculos de estado y vencimiento
  const getItemStatus = (item) => {
    if (item.stock <= 0) return { label: "Agotado", tone: "critical" };
    if (item.stock <= item.stockMinimo * 0.5)
      return { label: "Crítico", tone: "critical" };
    if (item.stock <= item.stockMinimo)
      return { label: "Por Agotarse", tone: "warning" };
    return { label: "Óptimo", tone: "optimal" };
  };

  const isExpiringSoon = (dateStr) => {
    if (!dateStr) return false;
    const now = new Date("2026-09-03"); // Fecha de referencia del sistema
    const exp = new Date(dateStr);
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 15 && diffDays >= 0;
  };

  const isExpired = (dateStr) => {
    if (!dateStr) return false;
    const now = new Date("2026-09-03");
    const exp = new Date(dateStr);
    return exp < now;
  };

  // KPIs
  const totalValue = useMemo(() => {
    return supplies.reduce(
      (acc, curr) => acc + (curr.stock || 0) * (curr.valorUnitario || 0),
      0,
    );
  }, [supplies]);

  const lowStockCount = useMemo(() => {
    return supplies.filter((s) => s.stock <= s.stockMinimo).length;
  }, [supplies]);

  const expiringCount = useMemo(() => {
    return supplies.filter((s) => isExpiringSoon(s.fechaVencimiento) || isExpired(s.fechaVencimiento)).length;
  }, [supplies]);

  // Filtrado de la tabla
  const filteredSupplies = supplies.filter((item) => {
    const matchesSearch =
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lote.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory ? item.categoria === filterCategory : true;
    const status = getItemStatus(item);
    const matchesStatus = filterStockStatus
      ? status.label.toLowerCase() === filterStockStatus.toLowerCase()
      : true;
    return matchesSearch && matchesCat && matchesStatus;
  });

  // Manejo de nuevo insumo
  const handleAddSupply = (e) => {
    e.preventDefault();
    if (!newSupply.nombre.trim()) {
      toast.error("El nombre del insumo es obligatorio");
      return;
    }
    const stockNum = parseFloat(newSupply.stock);
    const minNum = parseFloat(newSupply.stockMinimo);
    const valNum = parseFloat(newSupply.valorUnitario) || 0;

    if (isNaN(stockNum) || stockNum < 0) {
      toast.error("El stock debe ser un número mayor o igual a 0");
      return;
    }

    const created = {
      id: `INS-${Math.floor(100 + Math.random() * 900)}`,
      nombre: newSupply.nombre.trim(),
      categoria: newSupply.categoria,
      stock: stockNum,
      unidad: newSupply.unidad,
      stockMinimo: isNaN(minNum) ? 10 : minNum,
      lote: newSupply.lote.trim() || `LOT-${new Date().getFullYear()}-01`,
      fechaVencimiento: newSupply.fechaVencimiento || "2027-12-31",
      valorUnitario: valNum,
    };

    setSupplies([created, ...supplies]);
    setIsAddModalOpen(false);
    setNewSupply({
      nombre: "",
      categoria: "alimento",
      stock: "",
      unidad: "Bultos (40kg)",
      stockMinimo: "",
      lote: "",
      fechaVencimiento: "",
      valorUnitario: "",
    });
    toast.success("Insumo registrado en bodega con éxito");
  };

  // Ajuste rápido de stock
  const handleAdjustStock = (e) => {
    e.preventDefault();
    const qty = parseFloat(adjustQty);
    if (isNaN(qty)) {
      toast.error("Ingresa una cantidad válida");
      return;
    }

    setSupplies((prev) =>
      prev.map((item) => {
        if (item.id === adjustingItem.id) {
          const updated = Math.max(0, item.stock + qty);
          return { ...item, stock: updated };
        }
        return item;
      }),
    );

    toast.success(`Stock de ${adjustingItem.nombre} actualizado`);
    setAdjustingItem(null);
    setAdjustQty("");
  };

  const handleDeleteSupply = (id) => {
    if (window.confirm("¿Seguro de retirar este insumo del inventario?")) {
      setSupplies(supplies.filter((s) => s.id !== id));
      toast.success("Insumo eliminado de bodega");
    }
  };

  // Columnas para componente Table
  const columns = [
    {
      key: "nombre",
      header: "Insumo / Referencia",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.nombre}</span>
          <span className="text-[11px] font-mono text-slate-400">ID: #{row.id}</span>
        </div>
      ),
    },
    {
      key: "categoria",
      header: "Categoría",
      render: (row) => {
        const cat = inventoryConstants.categorias.find((c) => c.id === row.categoria);
        const label = cat?.label || row.categoria;
        const color = cat?.color || "slate";

        const badgeColors = {
          blue: "bg-blue-100 text-blue-700 border-blue-200",
          emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
          purple: "bg-purple-100 text-purple-700 border-purple-200",
          orange: "bg-amber-100 text-amber-700 border-amber-200",
          slate: "bg-slate-100 text-slate-700 border-slate-200",
        };

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeColors[color] || badgeColors.slate}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      key: "stock",
      header: "Stock Actual",
      render: (row) => (
        <div>
          <span className="text-base font-black text-slate-900">
            {row.stock}{" "}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {row.unidad}
          </span>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Mínimo: {row.stockMinimo} {row.unidad}
          </div>
        </div>
      ),
    },
    {
      key: "loteVence",
      header: "Lote / Vencimiento",
      render: (row) => {
        const expiring = isExpiringSoon(row.fechaVencimiento);
        const expired = isExpired(row.fechaVencimiento);

        return (
          <div>
            <span className="font-mono text-xs font-bold text-slate-700 block">
              {row.lote}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={`text-xs font-semibold ${
                  expired
                    ? "text-red-600 font-black"
                    : expiring
                      ? "text-amber-600 font-bold"
                      : "text-slate-500"
                }`}
              >
                {row.fechaVencimiento}
              </span>
              {expiring && (
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-700">
                  ¡Por Vencer!
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "estado",
      header: "Estado",
      render: (row) => {
        const status = getItemStatus(row);
        const toneStyles = {
          optimal: "bg-emerald-100 text-emerald-700 border-emerald-200",
          warning: "bg-amber-100 text-amber-700 border-amber-200",
          critical: "bg-red-100 text-red-700 border-red-200 animate-pulse",
        };

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${toneStyles[status.tone]}`}
          >
            {status.label}
          </span>
        );
      },
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setAdjustingItem(row);
              setAdjustQty("");
            }}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            title="Ajustar existencia"
          >
            <RefreshCw size={13} />
            <span>Entrada / Ajuste</span>
          </button>
          <button
            type="button"
            onClick={() => handleDeleteSupply(row.id)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
            title="Eliminar insumo"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-900">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="BODEGA Y LOGÍSTICA"
        title="Inventario de Insumos y Almacén"
        description="Control físico de existencias de alimentos balanceados, medicamentos, vacunas y material sanitario."
        actions={
          <Button
            onClick={() => setIsAddModalOpen(true)}
            tone="primary"
            className="flex items-center justify-center gap-2 font-black rounded-xl! shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            Registrar Entrada de Insumo
          </Button>
        }
      />

      {/* TARJETAS DE KPI SUPERIORES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Valor Total en Bodega */}
        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Valor Total en Bodega
              </p>
              <h4 className="text-2xl font-black text-slate-900 mt-2">
                ${totalValue.toLocaleString("es-CO")}
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Estimado en inventario físico
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
        </Card>

        {/* Total de Referencias */}
        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total de Referencias
              </p>
              <h4 className="text-2xl font-black text-slate-900 mt-2">
                {supplies.length} Insumos
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                4 categorías activas
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={24} />
            </div>
          </div>
        </Card>

        {/* Alertas de Bajo Stock */}
        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Stock Bajo / Crítico
              </p>
              <h4 className="text-2xl font-black text-rose-600 mt-2">
                {lowStockCount} Insumos
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Requieren orden de compra
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
          </div>
        </Card>

        {/* Insumos por Vencer */}
        <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Próximos a Vencer
              </p>
              <h4 className="text-2xl font-black text-amber-600 mt-2">
                {expiringCount} Lotes
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Alerta &lt; 15 días o vencidos
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* BARRA DE FILTROS */}
      <Card className="rounded-3xl p-5 flex flex-col md:flex-row gap-4 items-end bg-white border border-slate-100 shadow-sm">
        <div className="w-full md:w-1/3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Search size={14} className="text-indigo-400" />
            Buscar Insumo o Lote
          </label>
          <Input
            placeholder="Ej: Iniciación, Ivermectina, LOT-2026..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full shadow-sm text-sm"
          />
        </div>

        <div className="w-full md:w-1/3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Filter size={14} className="text-indigo-400" />
            Categoría de Insumo
          </label>
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm appearance-none cursor-pointer text-sm"
            >
              <option value="">Todas las Categorías</option>
              {inventoryConstants.categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers size={14} className="text-indigo-400" />
            Estado de Existencias
          </label>
          <div className="relative">
            <select
              value={filterStockStatus}
              onChange={(e) => setFilterStockStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm appearance-none cursor-pointer text-sm"
            >
              <option value="">Todos los Estados</option>
              {inventoryConstants.estados_stock.map((est) => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>
      </Card>

      {/* TABLA MAESTRA DE EXISTENCIAS DE BODEGA */}
      <section className="bg-white rounded-3xl shadow-sm overflow-hidden p-2 border border-slate-100">
        <Table columns={columns} rows={filteredSupplies} />

        {filteredSupplies.length === 0 && (
          <div className="text-center py-16">
            <Archive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">
              No se encontraron insumos
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Ajusta los filtros o añade un nuevo insumo a la bodega.
            </p>
          </div>
        )}
      </section>

      {/* MODAL REGISTRO DE NUEVO INSUMO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <Card
            as="form"
            onSubmit={handleAddSupply}
            className="w-full max-w-xl p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
          >
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-2xl font-black mb-6 text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                <Package className="w-6 h-6" />
              </div>
              Registrar Entrada de Insumo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input
                  label="Nombre del Insumo / Producto"
                  placeholder="Ej: Iniciación Lechones Precebo 1"
                  required
                  value={newSupply.nombre}
                  onChange={(e) =>
                    setNewSupply({ ...newSupply, nombre: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Categoría
                </label>
                <select
                  value={newSupply.categoria}
                  onChange={(e) =>
                    setNewSupply({ ...newSupply, categoria: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-sm cursor-pointer"
                >
                  {inventoryConstants.categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Unidad de Medida
                </label>
                <select
                  value={newSupply.unidad}
                  onChange={(e) =>
                    setNewSupply({ ...newSupply, unidad: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-sm cursor-pointer"
                >
                  {inventoryConstants.unidades.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Cantidad / Stock Inicial"
                type="number"
                step="0.5"
                placeholder="Ej: 50"
                required
                value={newSupply.stock}
                onChange={(e) =>
                  setNewSupply({ ...newSupply, stock: e.target.value })
                }
              />

              <Input
                label="Stock Mínimo de Seguridad"
                type="number"
                step="0.5"
                placeholder="Ej: 15"
                required
                value={newSupply.stockMinimo}
                onChange={(e) =>
                  setNewSupply({ ...newSupply, stockMinimo: e.target.value })
                }
              />

              <Input
                label="Lote de Fabricación"
                placeholder="Ej: LOT-AL-2026"
                value={newSupply.lote}
                onChange={(e) =>
                  setNewSupply({ ...newSupply, lote: e.target.value })
                }
              />

              <Input
                label="Fecha de Vencimiento"
                type="date"
                required
                value={newSupply.fechaVencimiento}
                onChange={(e) =>
                  setNewSupply({
                    ...newSupply,
                    fechaVencimiento: e.target.value,
                  })
                }
              />

              <div className="col-span-2">
                <Input
                  label="Valor Unitario Estimado ($ COP)"
                  type="number"
                  placeholder="Ej: 95000"
                  value={newSupply.valorUnitario}
                  onChange={(e) =>
                    setNewSupply({
                      ...newSupply,
                      valorUnitario: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                tone="soft"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 font-bold rounded-xl!"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                tone="primary"
                className="flex-1 font-black rounded-xl!"
              >
                Guardar en Bodega
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL AJUSTE RÁPIDO DE STOCK */}
      {adjustingItem && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <Card
            as="form"
            onSubmit={handleAdjustStock}
            className="w-full max-w-md p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
          >
            <button
              type="button"
              onClick={() => setAdjustingItem(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              Entrada / Ajuste de Stock
            </h3>
            <p className="text-xs text-slate-500 font-semibold mb-6">
              {adjustingItem.nombre} ({adjustingItem.unidad})
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">
                  Stock Actual
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {adjustingItem.stock} {adjustingItem.unidad}
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-white border border-slate-300 text-slate-600">
                {adjustingItem.lote}
              </span>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase block">
                Cantidad a Ingresar o Ajustar (+ / -)
              </label>
              <input
                type="number"
                step="0.5"
                required
                placeholder="Ej: +10 para entrada, -5 para salida o merma"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                className="w-full p-3 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none font-black text-slate-900 text-base"
                autoFocus
              />
              <p className="text-[11px] text-slate-400">
                Usa números positivos para registrar compras/entradas y negativos para consumos o descartes.
              </p>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                tone="soft"
                onClick={() => setAdjustingItem(null)}
                className="flex-1 font-bold rounded-xl!"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                tone="primary"
                className="flex-1 font-black rounded-xl!"
              >
                Actualizar Stock
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
