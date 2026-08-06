import Link from "next/link";
import BrandMark from "../../../components/BrandMark.jsx";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Card from "../../../components/ui/Card.jsx";

function LoginForm({ fields, onChange, onSubmit }) {
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
        <Input
          label="Usuario"
          name="email"
          type="email"
          value={fields.email}
          onChange={onChange}
        />

        <Input
          label="Contrasena"
          name="password"
          type="password"
          value={fields.password}
          onChange={onChange}
        />

        <div className="flex items-center justify-between gap-4 text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-emerald-700 transition hover:text-emerald-800"
          >
            ¿Olvidaste tu contrasena?
          </Link>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-500">
            Demo
          </span>
        </div>

        <Button className="w-full" tone="primary" type="submit">
          Ingresar al dashboard
        </Button>
      </form>

      <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-600">
        <p>
          Vista basada en el modulo de inicio de sesion del repositorio
          original.
        </p>
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
