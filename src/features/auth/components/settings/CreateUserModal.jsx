"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { X, Plus } from "lucide-react";

export default function CreateUserModal({
  isOpen = false,
  onClose,
  newUserForm = {},
  setNewUserForm,
  isCreating = false,
  onSubmit,
}) {
  if (!isOpen) return null;

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
          <Plus className="text-emerald-500 w-7 h-7" />
          Registrar Personal
        </h2>
        <p className="text-xs text-slate-400 font-bold mb-6 uppercase tracking-wider">
          Crea una nueva cuenta técnica con acceso al sistema
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              placeholder="Ej: Laura"
              value={newUserForm.nombre}
              onChange={(e) =>
                setNewUserForm({ ...newUserForm, nombre: e.target.value })
              }
              required
            />
            <Input
              label="Apellido"
              placeholder="Ej: Sánchez"
              value={newUserForm.apellido}
              onChange={(e) =>
                setNewUserForm({ ...newUserForm, apellido: e.target.value })
              }
              required
            />
          </div>

          <Input
            label="Correo Institucional"
            type="email"
            placeholder="ejemplo@sigep.com"
            value={newUserForm.email}
            onChange={(e) =>
              setNewUserForm({ ...newUserForm, email: e.target.value })
            }
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Rol en Granja
              </label>
              <select
                value={newUserForm.rol}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, rol: e.target.value })
                }
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none font-bold text-slate-700 text-sm cursor-pointer"
              >
                <option value="administrador">Administrador</option>
                <option value="veterinario">Veterinario</option>
                <option value="operario">Operario</option>
              </select>
            </div>

            <Input
              label="Teléfono (Opcional)"
              placeholder="+57 310..."
              value={newUserForm.telefono}
              onChange={(e) =>
                setNewUserForm({ ...newUserForm, telefono: e.target.value })
              }
            />
          </div>

          <Input
            label="Contraseña Temporal"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={newUserForm.password}
            onChange={(e) =>
              setNewUserForm({ ...newUserForm, password: e.target.value })
            }
            required
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
            isLoading={isCreating}
            className="flex-1 font-black rounded-xl!"
          >
            Registrar Usuario
          </Button>
        </div>
      </Card>
    </div>
  );
}
