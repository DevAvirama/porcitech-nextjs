"use client";

import React, { useState } from "react";
import { UserPlus, Shield, Check, X, Tag } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import ModuleHeader from "@/components/layout/ModuleHeader";

const SettingsView = () => {
  // Team data with Email included
  const initialTeamData = [
    {
      id: 1,
      name: "Dr. Alejandro Ruiz",
      email: "alejandro.ruiz@porcitech.com",
      role: "Administrador",
      status: "Activo",
    },
    {
      id: 2,
      name: "Dra. María Silva",
      email: "maria.silva@porcitech.com",
      role: "Veterinario",
      status: "Activo",
    },
    {
      id: 3,
      name: "Carlos Mendoza",
      email: "carlos.m@porcitech.com",
      role: "Operativo",
      status: "Activo",
    },
    {
      id: 4,
      name: "Luis Fernando",
      email: "luis.f@porcitech.com",
      role: "Operativo",
      status: "Inactivo",
    },
  ];

  const [teamData, setTeamData] = useState(initialTeamData);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("Operativo");
  const [formStatus, setFormStatus] = useState("Activo");

  const handleToggleStatus = (id) => {
    setTeamData(
      teamData.map((u) => {
        if (u.id === id) {
          return {
            ...u,
            status: u.status === "Activo" ? "Inactivo" : "Activo",
          };
        }
        return u;
      }),
    );
  };

  const handleOpenModal = () => {
    setFormName("");
    setFormEmail("");
    setFormRole("Operativo");
    setFormStatus("Activo");
    setIsModalOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    const newUser = {
      id: Date.now(),
      name: formName || "Nuevo Usuario",
      email: formEmail || "usuario@porcitech.com",
      role: formRole,
      status: formStatus,
    };
    setTeamData([...teamData, newUser]);
    setIsModalOpen(false);
  };

  const teamCols = [
    {
      header: "Usuario",
      key: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-505 text-slate-500 text-sm">
            {row.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)}
          </div>
          <div>
            <span className="font-bold text-slate-800 block">{row.name}</span>
            <span className="text-xs text-slate-500">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Rol",
      key: "role",
      render: (row) => {
        const roleColors = {
          Administrador: "bg-indigo-100 text-indigo-700",
          Veterinario: "bg-emerald-100 text-emerald-700",
          Operativo: "bg-slate-100 text-slate-700",
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${roleColors[row.role] || roleColors["Operativo"]}`}
          >
            {row.role}
          </span>
        );
      },
    },
    {
      header: "Estado (Act/Inac)",
      key: "status",
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row.id)}
          className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${row.status === "Activo" ? "bg-emerald-500" : "bg-slate-200"}`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${row.status === "Activo" ? "translate-x-7" : "translate-x-1"}`}
          ></div>
        </button>
      ),
    },
  ];

  const permissionMatrix = [
    { module: "Inventario y Animales", admin: true, vet: true, op: true },
    { module: "Alimentación y Peso", admin: true, vet: false, op: true },
    { module: "Salud y Vacunación", admin: true, vet: true, op: false },
    { module: "Reproducción y Partos", admin: true, vet: true, op: false },
    { module: "Alertas y Reportes", admin: true, vet: true, op: false },
    { module: "Configuración de Usuarios", admin: true, vet: false, op: false },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="CONFIGURACIÓN"
        title="Ajustes del Sistema"
        description="Administración de usuarios, roles y parámetros generales del sistema."
        actions={
          <Button
            onClick={handleOpenModal}
            tone="primary"
            className="flex items-center justify-center gap-2 font-bold rounded-xl!"
          >
            <UserPlus size={18} /> Crear Nuevo Usuario
          </Button>
        }
      />

      {/* Tabla de Usuarios */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-slate-800">
          Directorio de Personal
        </h3>
        <div className="bg-white rounded-4xl shadow-sm overflow-hidden border border-slate-100 p-2">
          <Table columns={teamCols} rows={teamData} />
        </div>
      </section>

      {/* Matriz de Permisos */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-slate-800">
          Matriz de Permisos Visual
        </h3>
        <Card className="p-6 border border-slate-100 rounded-4xl bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 border-b border-slate-100 font-bold text-slate-650 text-slate-600 uppercase tracking-wider text-sm">
                  Módulo
                </th>
                <th className="p-4 border-b border-slate-100 font-bold text-indigo-600 uppercase tracking-wider text-sm text-center">
                  Administrador
                </th>
                <th className="p-4 border-b border-slate-100 font-bold text-emerald-600 uppercase tracking-wider text-sm text-center">
                  Veterinario
                </th>
                <th className="p-4 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider text-sm text-center">
                  Operativo
                </th>
              </tr>
            </thead>
            <tbody>
              {permissionMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 border-b border-slate-50 font-bold text-slate-800">
                    {row.module}
                  </td>
                  <td className="p-4 border-b border-slate-50 text-center">
                    {row.admin ? (
                      <Check className="inline text-emerald-500 h-5 w-5" />
                    ) : (
                      <X className="inline text-rose-500 h-5 w-5" />
                    )}
                  </td>
                  <td className="p-4 border-b border-slate-50 text-center">
                    {row.vet ? (
                      <Check className="inline text-emerald-500 h-5 w-5" />
                    ) : (
                      <X className="inline text-rose-500 h-5 w-5" />
                    )}
                  </td>
                  <td className="p-4 border-b border-slate-50 text-center">
                    {row.op ? (
                      <Check className="inline text-emerald-500 h-5 w-5" />
                    ) : (
                      <X className="inline text-rose-500 h-5 w-5" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Modal para Crear Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <Card
            as="form"
            onSubmit={handleSaveUser}
            className="w-full max-w-md p-8! rounded-[2.5rem] shadow-2xl relative border border-slate-100 bg-white"
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
              Nuevo Usuario
            </h2>

            <div className="space-y-4">
              <Input
                label="Nombre Completo"
                placeholder="Ej: Juan Pérez"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />

              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="Ej: juan@porcitech.com"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Rol</label>
                <div className="relative">
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Veterinario">Veterinario</option>
                    <option value="Operativo">Operativo</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>
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
                type="submit"
                tone="secondary"
                className="flex-1 font-black rounded-xl!"
              >
                Guardar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
