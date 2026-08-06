"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  FileText,
  Activity,
  Layers,
  Tag,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Input from "../../components/ui/Input";
import inventoryConstants from "./data/inventoryConstants.json";
import { useRouter } from "next/navigation";

const initialInventory = [
  {
    id: "L-042",
    raza: "Large White",
    sexo: "Hembra",
    etapa: "reproduccion",
    ultimoPeso: 150,
    estadoSalud: "Óptimo",
  },
  {
    id: "C-089",
    raza: "Duroc",
    sexo: "Macho",
    etapa: "ceba",
    ultimoPeso: 95,
    estadoSalud: "En Tratamiento",
  },
  {
    id: "P-112",
    raza: "Pietrain",
    sexo: "Macho",
    etapa: "levante",
    ultimoPeso: 45,
    estadoSalud: "Óptimo",
  },
  {
    id: "L-015",
    raza: "Landrace",
    sexo: "Hembra",
    etapa: "lactancia",
    ultimoPeso: 6,
    estadoSalud: "Crítico",
  },
  {
    id: "H-003",
    raza: "Hampshire",
    sexo: "Macho",
    etapa: "precebo",
    ultimoPeso: 18,
    estadoSalud: "Observación",
  },
];

const Badge = ({ children, colorTheme }) => {
  const themeMap = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    rose: "bg-rose-100 text-rose-700 border-rose-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const colorClass = themeMap[colorTheme] || themeMap.slate;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}
    >
      {children}
    </span>
  );
};

const InventoryView = () => {
  const router = useRouter();
  const [inventory, setInventory] = useState(initialInventory);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEtapa, setFilterEtapa] = useState("");
  const [filterSalud, setFilterSalud] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRaza, setSelectedRaza] = useState("");

  const handleAddAnimal = () => {
    const newAnimal = {
      id: `N-${Math.floor(Math.random() * 1000)}`,
      raza: selectedRaza || "Cruce",
      sexo: "Macho",
      etapa: "lactancia",
      ultimoPeso: 1.5,
      estadoSalud: "Óptimo",
    };
    setInventory([newAnimal, ...inventory]);
    setIsModalOpen(false);
  };

  const filteredInventory = inventory.filter((animal) => {
    const matchId = animal.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEtapa = filterEtapa ? animal.etapa === filterEtapa : true;
    const matchSalud = filterSalud ? animal.estadoSalud === filterSalud : true;
    return matchId && matchEtapa && matchSalud;
  });

  const getEtapaColor = (etapaId) => {
    const etapaInfo = inventoryConstants.etapas.find((e) => e.id === etapaId);
    return etapaInfo ? etapaInfo.color : "slate";
  };

  const getEtapaLabel = (etapaId) => {
    const etapaInfo = inventoryConstants.etapas.find((e) => e.id === etapaId);
    return etapaInfo ? etapaInfo.label : etapaId;
  };

  const getSaludColor = (estado) => {
    switch (estado) {
      case "Óptimo":
        return "eserald";
      case "En Tratamiento":
        return "orange";
      case "Observación":
        return "yellow";
      case "Crítico":
        return "rose";
      default:
        return "slate";
    }
  };

  const columns = [
    {
      key: "id",
      header: "ID Animal",
      render: (row) => (
        <span className="font-black text-slate-800">#{row.id}</span>
      ),
    },
    { key: "raza", header: "Raza" },
    { key: "sexo", header: "Sexo" },
    {
      key: "etapa",
      header: "Etapa Actual",
      render: (row) => (
        <Badge colorTheme={getEtapaColor(row.etapa)}>
          {getEtapaLabel(row.etapa)}
        </Badge>
      ),
    },
    {
      key: "ultimoPeso",
      header: "Último Peso",
      render: (row) => (
        <span className="font-bold text-slate-700">{row.ultimoPeso} kg</span>
      ),
    },
    {
      key: "estadoSalud",
      header: "Estado de Salud",
      render: (row) => (
        <Badge colorTheme={getSaludColor(row.estadoSalud)}>
          {row.estadoSalud}
        </Badge>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (row) => (
        <Button
          tone="soft"
          className="px-3! py-1.5! text-xs flex items-center gap-1.5 font-bold rounded-lg hover:bg-slate-200 text-slate-600 border border-slate-200 shadow-sm cursor-pointer"
          onClick={() =>
            router.push(`/dashboard/inventory/profile?id=${row.id}`)
          }
        >
          <FileText size={14} /> Perfil
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-400 mx-auto pb-10">
      {/* Header */}
      <Card
        as="header"
        className="flex flex-col gap-6 rounded-4xl! lg:flex-row lg:items-center lg:justify-between border-t-4 border-sena-blue"
      >
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-sena-blue rounded-xl shadow-sm border border-sena-blue/50">
              <Layers className="text-white w-7 h-7" />
            </div>
            Inventario y Activos
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            Gestión centralizada del plantel porcino.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-sena-green hover:bg-sena-green-hover hover:-translate-y-1 hover:shadow-xl text-white border-none shadow-lg shadow-sena-green/30 transition-all duration-200 cursor-pointer font-bold"
          >
            <Plus size={20} />
            Añadir Animal
          </Button>
        </div>
      </Card>

      {/* Filtros */}
      <Card className="rounded-2xl! p-5 flex flex-col md:flex-row gap-5 items-end bg-white border border-slate-100 shadow-sm">
        <div className="w-full md:w-1/3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Search size={14} className="text-indigo-400" /> Buscar ID
          </label>
          <Input
            placeholder="Ej: L-042..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full shadow-sm"
          />
        </div>

        <div className="w-full md:w-1/3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Filter size={14} className="text-indigo-400" /> Etapa Productiva
          </label>
          <div className="relative">
            <select
              value={filterEtapa}
              onChange={(e) => setFilterEtapa(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm appearance-none cursor-pointer"
            >
              <option value="">Todas las Etapas</option>
              {inventoryConstants.etapas.map((etapa) => (
                <option key={etapa.id} value={etapa.id}>
                  {etapa.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              ▼
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity size={14} className="text-indigo-400" /> Estado de Salud
          </label>
          <div className="relative">
            <select
              value={filterSalud}
              onChange={(e) => setFilterSalud(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm appearance-none cursor-pointer"
            >
              <option value="">Todos los Estados</option>
              {inventoryConstants.estados_salud.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              ▼
            </div>
          </div>
        </div>
      </Card>

      {/* Tabla Maestra */}
      <section>
        <div className="bg-white rounded-4xl shadow-sm overflow-hidden p-2 border border-slate-100">
          <Table columns={columns} rows={filteredInventory} />

          {filteredInventory.length === 0 && (
            <div className="text-center py-16">
              <Layers className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">
                No se encontraron animales
              </h3>
              <p className="text-slate-500 mt-1 font-medium">
                Intenta ajustando los filtros de búsqueda.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modal Básico de Registro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <Card
            as="form"
            className="w-full max-w-lg p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-2xl font-black mb-6 text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                <Tag className="w-6 h-6" />
              </div>
              Registrar Nuevo Animal
            </h2>

            <div className="grid grid-cols-2 gap-5">
              <Input label="ID Animal" placeholder="Ej: L-045" required />
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Raza</label>
                <div className="space-y-3">
                  <div className="relative">
                    <select
                      value={selectedRaza}
                      onChange={(e) => setSelectedRaza(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="">Seleccione una raza</option>
                      {inventoryConstants.razas.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                      <option value="Otra">Otra raza...</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                      ▼
                    </div>
                  </div>

                  {selectedRaza === "Otra" && (
                    <input
                      type="text"
                      placeholder="Ingrese la nueva raza"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Sexo</label>
                <div className="relative">
                  <select className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer">
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>
              <Input
                label="Peso Inicial (kg)"
                type="number"
                step="0.1"
                placeholder="Ej: 1.5"
                required
              />
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                tone="soft"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 font-bold rounded-xl!"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleAddAnimal}
                className="flex-1 font-black bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-md shadow-indigo-500/30 rounded-xl!"
              >
                Guardar Registro
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
