import Link from "next/link";
import { CheckCircle2, Mail, ArrowRight, KeyRound } from "lucide-react";
import Button from "../../../../components/ui/Button.jsx";
import Input from "../../../../components/ui/Input.jsx";
import Card from "../../../../components/ui/Card.jsx";
import BrandMark from "../../../../components/BrandMark.jsx";

function ForgotPasswordForm({
  fields,
  onChange,
  onSubmit,
  isSubmitting = false,
  error = null,
  result = null,
}) {
  return (
    <Card className="w-full max-w-md rounded-4xl border border-slate-200 p-8 shadow-2xl shadow-slate-950/10 sm:p-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Recuperar acceso
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            Resetea tu contraseña
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

      {result ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold">Solicitud procesada</p>
                <p className="text-xs leading-relaxed text-emerald-800">
                  {result.message}
                </p>
              </div>
            </div>
          </div>

          {result.reset_url_preview && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800">
                <KeyRound className="h-4 w-4" />
                Modo desarrollo (SMTP local)
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                El servidor SMTP externo no está configurado en este entorno local. Puedes usar este enlace temporal válido por{" "}
                <strong>{result.expires_in_minutes} minutos</strong> para completar el restablecimiento:
              </p>
              <Link
                href={`/reset-password?token=${encodeURIComponent(result.reset_token_preview || "")}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 transition-colors"
              >
                <span>Abrir enlace de restablecimiento</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {result.email_sent && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Mail className="h-4 w-4 text-emerald-600" />
              <span>Revisa tu bandeja de entrada o carpeta de correo no deseado.</span>
            </div>
          )}
        </div>
      ) : (
        <form className="space-y-6" onSubmit={onSubmit}>
          <Input
            label="Correo electrónico registrado"
            name="email"
            type="email"
            placeholder="usuario@porcitech.com"
            value={fields.email}
            onChange={onChange}
            required={true}
            disabled={isSubmitting}
          />

          <Button
            className="w-full"
            tone="primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando instrucciones..." : "Enviar enlace de recuperación"}
          </Button>
        </form>
      )}

      <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-600 flex items-center justify-between">
        <div>
          <p>¿Recordaste tu contraseña?</p>
          <Link
            href="/login"
            className="mt-1.5 inline-flex font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Volver a iniciar sesión
          </Link>
        </div>
        <Link
          href="/reset-password"
          className="text-xs font-semibold text-slate-500 hover:text-emerald-700"
        >
          ¿Ya tienes un código?
        </Link>
      </div>
    </Card>
  );
}

export default ForgotPasswordForm;
