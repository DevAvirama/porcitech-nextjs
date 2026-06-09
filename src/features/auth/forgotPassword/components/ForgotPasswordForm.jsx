"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight">Recuperar Clave</h2>
        <p className="text-zinc-400 text-sm">Enviaremos un enlace de restauración a tu correo institucional.</p>
      </div>

      {success ? (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
          Se ha enviado un enlace a tu correo. Revisa tu bandeja de entrada.
        </div>
      ) : (
        <>
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="nombre@sena.edu.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Enviar Enlace"}
          </Button>
        </>
      )}

      <div className="text-center">
        <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
          Volver al Login
        </Link>
      </div>
    </form>
  );
}
