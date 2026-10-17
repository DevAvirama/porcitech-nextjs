"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Users, RefreshCw, Plus, Mail, Phone, Edit, Trash2 } from "lucide-react";
import { RoleBadge, StatusBadge } from "./SettingsBadges";

export default function UserListTab({
  usersList = [],
  loadingUsers = false,
  currentUser = null,
  fetchUsers,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteUser,
}) {
  return (
    <Card className="rounded-[2.5rem]! p-8 bg-white border border-slate-100 shadow-sm flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="text-purple-600 w-6 h-6" />
            Personal y Usuarios del Sistema
          </h3>
          <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">
            Directorio oficial sincronizado con base de datos PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            tone="soft"
            onClick={fetchUsers}
            disabled={loadingUsers}
            className="flex items-center gap-1.5 font-bold rounded-xl! py-3 px-4 text-xs"
            title="Actualizar lista de usuarios"
          >
            <RefreshCw
              size={14}
              className={loadingUsers ? "animate-spin text-emerald-600" : ""}
            />
            Recargar
          </Button>

          <Button
            type="button"
            onClick={onOpenCreateModal}
            tone="primary"
            className="flex items-center gap-1.5 font-bold rounded-xl! py-3 px-5 text-sm shadow-md"
          >
            <Plus size={16} />
            + Registrar Personal
          </Button>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="px-6 py-2">Nombre Completo</th>
              <th className="px-6 py-2">Email</th>
              <th className="px-6 py-2">Rol Asignado</th>
              <th className="px-6 py-2">Teléfono</th>
              <th className="px-6 py-2 text-center">Estado</th>
              <th className="px-6 py-2 text-right pr-8">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loadingUsers && usersList.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
                    <span className="text-sm font-semibold text-slate-500">
                      Consultando personal en PostgreSQL...
                    </span>
                  </div>
                </td>
              </tr>
            ) : usersList.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-slate-400 font-semibold"
                >
                  No se encontraron usuarios registrados en la base de datos.
                </td>
              </tr>
            ) : (
              usersList.map((usr) => {
                const fullName = `${usr.nombre || ""} ${usr.apellido || ""}`.trim();
                const isSelf =
                  usr.id === currentUser?.id || usr.email === currentUser?.email;

                return (
                  <tr
                    key={usr.id}
                    className="bg-white hover:bg-slate-50/80 transition-all shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] border border-slate-100 rounded-2xl"
                  >
                    {/* Nombre Completo */}
                    <td className="px-6 py-4 rounded-l-2xl font-black text-slate-900 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-xs uppercase">
                          {usr.nombre?.[0] || "U"}
                          {usr.apellido?.[0] || ""}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {fullName || "Sin nombre registrado"}
                          </div>
                          {isSelf && (
                            <span className="text-[10px] text-purple-600 font-black tracking-wider uppercase">
                              (Tu cuenta activa)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 font-semibold text-slate-600 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Mail size={14} className="text-slate-400 shrink-0" />
                        <span>{usr.email}</span>
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="px-6 py-4">
                      <RoleBadge rol={usr.rol} />
                    </td>

                    {/* Teléfono */}
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                      {usr.telefono ? (
                        <div className="flex items-center gap-1.5">
                          <Phone size={13} className="text-slate-400 shrink-0" />
                          <span>{usr.telefono}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-normal italic">
                          N/R
                        </span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 text-center">
                      <StatusBadge activo={usr.activo} />
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 rounded-r-2xl text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenEditModal(usr)}
                          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                          title="Editar usuario"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteUser(usr)}
                          disabled={isSelf}
                          className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title={
                            isSelf
                              ? "No puede eliminar su propio usuario administrador"
                              : "Desactivar usuario"
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
