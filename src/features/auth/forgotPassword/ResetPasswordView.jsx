"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import AuthSplitLayout from "../../../components/layout/AuthSplitLayout.jsx";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Card from "../../../components/ui/Card.jsx";
import BrandMark from "../../../components/BrandMark.jsx";
import { confirmPasswordReset } from "@/services/auth/authService";
import ForgotPasswordShowcase from "./components/ForgotPasswordShowcase.jsx";

export default function ResetPasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError("Se requiere el código o enlace de recuperación válido.");
      return;
    }
    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await confirmPasswordReset(token.trim(), newPassword);
      const msg = resp?.message || "Contraseña restablecida exitosamente.";
      setSuccessMsg(msg);
      toast.success("Contraseña actualizada con cifrado Bcrypt");
      setTimeout(() => {
        router.push("/login");
      }, 2200);
    } catch (err) {
      const msg = err?.message || "El enlace de recuperación es inválido o ha caducado.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout aside={<ForgotPasswordShowcase />}>
      <Card className="w-full max-w-md rounded-4xl border border-slate-200 p-8 shadow-2xl shadow-slate-950/10 sm:p-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              Nueva credencial
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Define tu contraseña
            </h2>
          </div>
          <div className="lg:hidden">
            <BrandMark compact />
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {successMsg ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">¡Contraseña actualizada!</p>
                  <p className="text-xs text-emerald-800 mt-1">{successMsg}</p>
                </div>
              </div>
            </div>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {!tokenFromUrl && (
              <Input
                label="Código / Token de recuperación"
                name="token"
                type="text"
                placeholder="Pega aquí el token recibido"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required={true}
                disabled={isSubmitting}
              />
            )}

            <Input
              label="Nueva contraseña"
              name="newPassword"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required={true}
              disabled={isSubmitting}
            />

            <Input
              label="Confirmar nueva contraseña"
              name="confirmPassword"
              type="password"
              placeholder="Repite la nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required={true}
              disabled={isSubmitting}
            />

            <Button
              className="w-full flex items-center justify-center gap-2"
              tone="primary"
              type="submit"
              disabled={isSubmitting}
            >
              <Lock className="h-4 w-4" />
              <span>{isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}</span>
            </Button>
          </form>
        )}

        <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-600 flex items-center justify-between">
          <Link
            href="/login"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Volver a iniciar sesión
          </Link>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-slate-500 hover:text-emerald-700"
          >
            Solicitar otro enlace
          </Link>
        </div>
      </Card>
    </AuthSplitLayout>
  );
}
