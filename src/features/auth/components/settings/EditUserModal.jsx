"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { X, Edit } from "lucide-react";

export default function EditUserModal({
  isOpen = false,
  editingUser = null,
  onClose,
  editUserForm = {},
  setEditUserForm,
  isEditing = false,
  onSubmit,
}) {
  if (!isOpen || !editingUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <Card
        as="form"
        onSubmit={onSubmit}
        className="w-full max-w-lg p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white my-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-2xl font-black mb-2 text-slate-900 flex items-center gap-2">
          <Edit className="text-indigo-500 w-6 h-6" />
          Editar Usuario
        </h2>
        <p className="text-xs text-slate-400 font-bold mb-6 uppercase tracking-wider">
          Modifica la información y estado de la cuenta
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={editUserForm.nombre}
              onChange={(e) =>
                setEditUserForm({ ...editUserForm, nombre: e.target.value })
              }
              required
            />
            <Input
              label="Apellido"
              value={editUserForm.apellido}
              onChange={(e) =>
                setEditUserForm({ ...editUserForm, apellido: e.target.value })
              }
              required
            />
          </div>

          <Input
            label="Correo Electrónico"
            type="email"
            value={editUserForm.email}
            onChange={(e) =>
              setEditUserForm({ ...editUserForm, email: e.target.value })
            }
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Rol
              </label>
              <select
                value={editUserForm.rol}
                onChange={(e) =>
                  setEditUserForm({ ...editUserForm, rol: e.target.value })
                }
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none font-bold text-slate-700 text-sm cursor-pointer"
              >
                <option value="administrador">Administrador</option>
                <option value="veterinario">Veterinario</option>
                <option value="operario">Operario</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Estado de la Cuenta
              </label>
              <select
                value={editUserForm.activo ? "true" : "false"}
                onChange={(e) =>
                  setEditUserForm({
                    ...editUserForm,
                    activo: e.target.value === "true",
                  })
                }
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none font-bold text-slate-700 text-sm cursor-pointer"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          <Input
            label="Teléfono"
            placeholder="+57 310..."
            value={editUserForm.telefono}
            onChange={(e) =>
              setEditUserForm({ ...editUserForm, telefono: e.target.value })
            }
          />

          <Input
            label="Nueva Contraseña (Opcional)"
            type="password"
            placeholder="Dejar en blanco para conservar la actual"
            value={editUserForm.password}
            onChange={(e) =>
              setEditUserForm({ ...editUserForm, password: e.target.value })
            }
          />
        </div>

        <div className="flex gap-4 mt-8">
          <Button
            type="button"
            tone="soft"
            onClick={onClose}
            className="flex-1 font-bold rounded-xl!"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            tone="primary"
            isLoading={isEditing}
            className="flex-1 font-black rounded-xl!"
          >
            Actualizar Cambios
          </Button>
        </div>
      </Card>
    </div>
  );
}
