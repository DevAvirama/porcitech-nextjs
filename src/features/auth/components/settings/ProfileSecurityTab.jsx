"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Shield, Key, Lock } from "lucide-react";
import { RoleBadge } from "./SettingsBadges";

export default function ProfileSecurityTab({
  currentUser = {},
  nombre = "",
  setNombre,
  apellido = "",
  setApellido,
  email = "",
  telefono = "",
  setTelefono,
  isSavingProfile = false,
  onSaveProfile,
  currentPassword = "",
  setCurrentPassword,
  newPassword = "",
  setNewPassword,
  confirmPassword = "",
  setConfirmPassword,
  isSavingPassword = false,
  onUpdatePassword,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Formulario de Perfil */}
      <Card
        as="form"
        onSubmit={onSaveProfile}
        className="p-8 bg-white border border-slate-100 shadow-sm rounded-4xl flex flex-col gap-6 justify-between"
      >
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 border-b pb-3 border-slate-100">
            <Shield className="text-emerald-500 w-6 h-6" /> Información de Perfil
          </h3>

          {/* Rol actual */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Rol asignado en el sistema
            </span>
            <div className="inline-flex">
              <RoleBadge rol={currentUser.rol || currentUser.role} />
            </div>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre..."
              required
            />
            <Input
              label="Apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Tu apellido..."
            />
          </div>

          {/* Teléfono */}
          <Input
            label="Teléfono de Contacto"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+57 300 1234567"
          />

          {/* Correo Institucional */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Correo Institucional
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 font-semibold cursor-not-allowed outline-none text-sm"
            />
            <span className="text-[10px] text-slate-400 font-bold block">
              El correo institucional está vinculado a tus credenciales y no puede modificarse libremente.
            </span>
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            tone="primary"
            isLoading={isSavingProfile}
            className="w-full py-4 font-black rounded-xl!"
          >
            Guardar Cambios de Perfil
          </Button>
        </div>
      </Card>

      {/* Formulario de Cambio de Contraseña */}
      <Card
        as="form"
        onSubmit={onUpdatePassword}
        className="p-8 bg-white border border-slate-100 shadow-sm rounded-4xl flex flex-col gap-6 justify-between"
      >
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 border-b pb-3 border-slate-100">
            <Key className="text-indigo-500 w-6 h-6" /> Seguridad y Credenciales
          </h3>

          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs font-semibold text-indigo-900 flex items-start gap-3">
            <Lock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              Asegúrate de utilizar una contraseña robusta con al menos 6 caracteres que combine letras y números.
            </p>
          </div>

          {/* Contraseña Actual */}
          <Input
            label="Contraseña Actual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {/* Nueva Contraseña */}
          <Input
            label="Nueva Contraseña"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
          />

          {/* Confirmar Nueva Contraseña */}
          <Input
            label="Confirmar Nueva Contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la nueva contraseña"
            required
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            tone="secondary"
            isLoading={isSavingPassword}
            className="w-full py-4 font-black rounded-xl!"
          >
            Actualizar Contraseña
          </Button>
        </div>
      </Card>
    </div>
  );
}
