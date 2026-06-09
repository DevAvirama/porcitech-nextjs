"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SettingsView() {
  const [name, setName] = useState("Usuario Demo");
  const [email, setEmail] = useState("admin@sena.edu.co");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Configuración</h1>
        <p className="text-zinc-400 text-sm">Gestiona la seguridad y configuraciones del perfil de usuario.</p>
      </div>

      <div className="max-w-2xl">
        <Card className="space-y-6">
          <div className="border-b border-zinc-900 pb-4">
            <h3 className="text-lg font-semibold text-white">Detalles del Perfil</h3>
            <p className="text-xs text-zinc-500">Actualiza tu información personal de contacto.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Correo Institucional"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="primary">Guardar Cambios</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
