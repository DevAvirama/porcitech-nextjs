import Link from "next/link";
import BrandMark from "../../../components/BrandMark.jsx";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Card from "../../../components/ui/Card.jsx";

function LoginForm({ fields, onChange, onSubmit, isLoading = false, error = "" }) {
  return (
    <Card className="w-full max-w-md rounded-4xl border border-slate-200 p-8 shadow-2xl shadow-slate-950/10 sm:p-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Iniciar sesion
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            Ingresa a tu cuenta
          </h2>
        </div>
        <div className="lg:hidden">
          <BrandMark compact />
        </div>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm"
          >
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        <Input
          label="Usuario"
          name="email"
          type="email"
          value={fields.email}
          onChange={onChange}
          required
          disabled={isLoading}
        />

        <Input
          label="Contrasena"
          name="password"
          type="password"
          value={fields.password}
          onChange={onChange}
          required
          disabled={isLoading}
        />

        <div className="flex items-center justify-between gap-4 text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-emerald-700 transition hover:text-emerald-800"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          className="w-full"
          tone="primary"
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Iniciando sesión..." : "Ingresar al dashboard"}
        </Button>
      </form>

      <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-600">
        <Link
          href="/"
          className="mt-3 inline-flex font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Volver a la landing
        </Link>
      </div>
    </Card>
  );
}

export default LoginForm;
