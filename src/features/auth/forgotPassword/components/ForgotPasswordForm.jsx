import Link from "next/link";
import Button from "../../../../components/ui/Button.jsx";
import Input from "../../../../components/ui/Input.jsx";
import Card from "../../../../components/ui/Card.jsx";
import BrandMark from "../../../../components/BrandMark.jsx";

function ForgotPasswordForm({ fields, onChange, onSubmit }) {
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

      <form className="space-y-6" onSubmit={onSubmit}>
        <Input
          label="Usuario o correo electrónico"
          name="email"
          type="email"
          value={fields.email}
          onChange={onChange}
          required={true}
        />

        <Button className="w-full" tone="primary" type="submit">
          Enviar instrucciones
        </Button>
      </form>

      <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-600">
        <p>¿Recordaste tu contraseña?</p>
        <Link
          href="/login"
          className="mt-3 inline-flex font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    </Card>
  );
}

export default ForgotPasswordForm;
