import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  Layers,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  QrCode,
  ShieldCheck,
  Smartphone,
  Utensils,
  WifiOff,
} from "lucide-react";
import PublicHeader from "../../components/layout/PublicHeader.jsx";
import BrandMark from "../../components/BrandMark.jsx";
import Button from "../../components/ui/Button.jsx";
import { landingModules, landingStats, workflowSteps } from "./data.js";
import heroImg from "../../../public/assets/cerdito.jpg";

const MODULE_VISUALS = {
  hato: {
    icon: Layers,
    iconColor: "text-emerald-300",
    iconBg: "bg-emerald-500/15 ring-1 ring-emerald-400/25",
  },
  qr: {
    icon: QrCode,
    iconColor: "text-sky-300",
    iconBg: "bg-sky-500/15 ring-1 ring-sky-400/25",
  },
  peso: {
    icon: Camera,
    iconColor: "text-amber-300",
    iconBg: "bg-amber-500/15 ring-1 ring-amber-400/25",
  },
  alimentacion: {
    icon: Utensils,
    iconColor: "text-lime-300",
    iconBg: "bg-lime-500/15 ring-1 ring-lime-400/25",
  },
  sanidad: {
    icon: ShieldCheck,
    iconColor: "text-rose-300",
    iconBg: "bg-rose-500/15 ring-1 ring-rose-400/25",
  },
  reproduccion: {
    icon: HeartPulse,
    iconColor: "text-purple-300",
    iconBg: "bg-purple-500/15 ring-1 ring-purple-400/25",
  },
  inventario: {
    icon: PackageCheck,
    iconColor: "text-teal-300",
    iconBg: "bg-teal-500/15 ring-1 ring-teal-400/25",
  },
  reportes: {
    icon: BarChart3,
    iconColor: "text-indigo-300",
    iconBg: "bg-indigo-500/15 ring-1 ring-indigo-400/25",
  },
};

export default function LandingView() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-clip">
      <PublicHeader />

      {/* HERO SECTION: comparte la atmósfera y paleta de AuthSplitLayout para transición fluida al Login */}
      <section id="inicio" className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(16,185,129,0.22),transparent_36%),radial-gradient(circle_at_82%_26%,rgba(250,204,21,0.14),transparent_32%),linear-gradient(180deg,#020617_0%,#081426_65%,#0a192f_100%)]" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:px-10 lg:py-22">
          <div className="flex flex-col justify-center space-y-6 sm:space-y-7 lg:col-span-6">
            <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-sena-green animate-pulse" />
              Innovación Agroindustrial SENA • Web y Móvil
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-[3.35rem] leading-[1.08]">
                Control total de tu{" "}
                <span className="text-sena-green">granja porcina</span> en un
                solo ecosistema
              </h1>
              <p className="max-w-xl text-base sm:text-lg leading-relaxed text-slate-300">
                Gestiona el hato, corrales, pasaportes QR, estimación de peso
                por fotografía, alimentación, sanidad, reproducción e inventario
                desde la web o desde el celular en galpón, incluso sin internet.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3.5 pt-1">
              <Button
                to="/login"
                tone="primary"
                className="w-full sm:w-auto rounded-full px-7 py-3.5 text-sm sm:text-base shadow-xl shadow-sena-green/25"
              >
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <a
                href="#modulos"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm sm:text-base font-semibold text-slate-100 transition hover:border-emerald-400/40 hover:bg-white/10"
              >
                Explorar Módulos
              </a>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1 text-xs font-semibold text-slate-300">
              {[
                "Trazabilidad por QR",
                "Pesaje sin estrés",
                "Modo campo sin señal",
              ].map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/70 px-3 py-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative mx-auto w-full max-w-xl rounded-3xl border border-white/15 bg-slate-900/60 p-3 sm:p-4 shadow-2xl backdrop-blur-xl">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                <Image
                  src={heroImg}
                  alt="Porcicultura inteligente con PorciTech"
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/25 to-slate-950/35" />

                <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-950/75 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Operación en Tiempo Real
                  </span>
                  <span className="rounded-full bg-sena-green/90 px-2.5 py-1 text-[11px] font-bold text-white shadow">
                    Web + App Móvil
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 rounded-2xl border border-white/15 bg-slate-950/85 p-3.5 sm:p-4 backdrop-blur-md">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-left">
                    <div>
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-300">
                        Hato
                      </p>
                      <p className="mt-0.5 text-sm sm:text-lg font-black text-white">
                        QR + Ficha
                      </p>
                    </div>
                    <div className="border-x border-white/10 px-2 sm:px-3">
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-300">
                        Pesaje
                      </p>
                      <p className="mt-0.5 text-sm sm:text-lg font-black text-white">
                        Por Foto
                      </p>
                    </div>
                    <div className="pl-1 sm:pl-2">
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-sky-300">
                        Bodega
                      </p>
                      <p className="mt-0.5 text-sm sm:text-lg font-black text-white">
                        Lotes + ICA
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS BAR */}
      <section className="border-y border-white/10 bg-[#002235]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-white/10 px-4 py-6 sm:px-6 lg:px-10">
          {landingStats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center px-3 py-4 text-center"
            >
              <p className="text-2xl sm:text-3xl font-black text-white">
                {stat.value}
              </p>
              <p className="mt-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-300/90">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FULL MODULES SECTION */}
      <section id="modulos" className="relative bg-[#071120] py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/40 to-transparent" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto mb-12 sm:mb-16 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
              Ecosistema Completo
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Un software completo para cada etapa productiva
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300">
              Desde la recepción de insumos y el nacimiento de lechones hasta el
              pesaje, control sanitario y pasaporte individual de salida.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {landingModules.map((mod) => {
              const visual = MODULE_VISUALS[mod.id] || MODULE_VISUALS.hato;
              const Icon = visual.icon;
              return (
                <article
                  key={mod.id}
                  className="group rounded-2xl border border-white/10 bg-slate-900/75 p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-slate-900"
                >
                  <div
                    className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl ${visual.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${visual.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2.5">
                    {mod.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    {mod.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* WEB + MOBILE APP ECOSYSTEM SECTION */}
      <section
        id="ecosistema"
        className="relative border-t border-white/10 bg-linear-to-b from-[#041527] to-slate-950 py-16 sm:py-24"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-10">
          {/* Device composition (responsive without overflow) */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-lg">
              <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-emerald-500/10 blur-2xl" />

              {/* Web dashboard card */}
              <div className="relative rounded-3xl border border-white/15 bg-slate-900/90 p-5 sm:p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <BrandMark light compact />
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-300">
                    Panel Web
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3.5">
                    <p className="text-[11px] font-semibold text-slate-400">
                      Alertas de Retiro
                    </p>
                    <p className="mt-1 text-base sm:text-lg font-black text-amber-300">
                      Control Activo
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3.5">
                    <p className="text-[11px] font-semibold text-slate-400">
                      Kárdex e Insumos
                    </p>
                    <p className="mt-1 text-base sm:text-lg font-black text-emerald-300">
                      Lotes al Día
                    </p>
                  </div>
                </div>

                {/* Integrated Mobile Field Preview */}
                <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-[#002235] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sena-green/20 text-sena-green">
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          PorciTech Mobile
                        </p>
                        <p className="text-xs text-slate-300">
                          Operación en galpón y campo
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                      <WifiOff className="h-3.5 w-3.5" />
                      Sin señal
                    </span>
                  </div>

                  <div className="mt-3.5 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-slate-200">
                    <div className="rounded-xl bg-white/5 px-2 py-2">
                      Escáner QR
                    </div>
                    <div className="rounded-xl bg-white/5 px-2 py-2">
                      Peso por Foto
                    </div>
                    <div className="rounded-xl bg-white/5 px-2 py-2">
                      Sync Auto
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Explanation & Value points */}
          <div className="space-y-7 lg:col-span-6">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
                Web y Aplicación Móvil Conectadas
              </p>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Diseñada para la realidad de la porcicultura colombiana
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-slate-300">
                Sabemos que en los galpones no siempre hay internet estable. Por
                eso PorciTech combina una consola web completa con una app móvil
                de alto contraste para registrar el trabajo diario en terreno.
              </p>
            </div>

            <ul className="space-y-3.5">
              {[
                "Escaneo inmediato de chapetas QR para abrir ficha o pasaporte sanitario",
                "Estimación visual de peso mediante fotografía desde el teléfono",
                "Cola de sincronización sin pérdida de datos al recuperar conexión",
                "Reportes gerenciales listos para imprimir y auditorías de corral",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sena-green" />
                  <span className="text-sm sm:text-base font-medium text-slate-200">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <Button
                to="/login"
                tone="primary"
                className="w-full sm:w-auto rounded-full px-7 py-3 text-sm sm:text-base"
              >
                Acceder a mi Granja
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3-STEP WORKFLOW SECTION */}
      <section
        id="flujo"
        className="border-t border-white/10 bg-[#081324] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
              Puesta en Marcha Ágil
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              ¿Cómo funciona en el día a día?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {workflowSteps.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 sm:p-7"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sena-green/20 text-sm font-black text-emerald-300 ring-1 ring-emerald-400/30">
                  {item.step}
                </span>
                <h3 className="mt-5 text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION (Puente visual directo hacia /login) */}
      <section className="border-t border-white/10 bg-slate-950 py-14 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-emerald-400/25 bg-[radial-gradient(circle_at_15%_20%,rgba(57,169,0,0.28),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(255,192,0,0.16),transparent_45%),linear-gradient(135deg,#00324D_0%,#081426_100%)] px-6 py-12 sm:px-12 sm:py-16 text-center shadow-2xl">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
            <ClipboardList className="h-3.5 w-3.5" />
            Listo para operar
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-4xl">
            Empieza a gestionar tu granja con trazabilidad real
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
            Inicia sesión con tu cuenta asignada para acceder al panel web o
            sincronizar tu dispositivo móvil de campo.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button
              to="/login"
              tone="primary"
              className="w-full sm:w-auto rounded-full px-8 py-3.5 text-sm sm:text-base"
            >
              Iniciar Sesión
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              to="/forgot-password"
              tone="outline"
              className="w-full sm:w-auto rounded-full border-white/25 px-8 py-3.5 text-sm sm:text-base"
            >
              Recuperar Acceso
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="contacto"
        className="border-t border-white/10 bg-slate-950 text-slate-300"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 border-b border-white/10 pb-10">
            <div className="sm:col-span-2 lg:col-span-1 space-y-4">
              <BrandMark light compact />
              <p className="text-sm leading-relaxed text-slate-400">
                Sistema Integral de Gestión Porcina orientado a la productividad,
                sanidad y trazabilidad en granjas colombianas.
              </p>
            </div>

            <div className="space-y-3.5">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                Plataforma
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>
                  <a href="#inicio" className="hover:text-emerald-300 transition">
                    Inicio
                  </a>
                </li>
                <li>
                  <a href="#modulos" className="hover:text-emerald-300 transition">
                    Módulos del Sistema
                  </a>
                </li>
                <li>
                  <a
                    href="#ecosistema"
                    className="hover:text-emerald-300 transition"
                  >
                    Consola Web y Móvil
                  </a>
                </li>
                <li>
                  <a href="#flujo" className="hover:text-emerald-300 transition">
                    Cómo Funciona
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3.5">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                Acceso
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>
                  <Link href="/login" className="hover:text-emerald-300 transition">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link
                    href="/forgot-password"
                    className="hover:text-emerald-300 transition"
                  >
                    Restablecer Contraseña
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3.5">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                Contacto SENA
              </h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Bogotá D.C., Colombia</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>+57 (1) 5461500</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>contacto@porcitech.co</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-7 text-xs text-slate-500 text-center sm:text-left">
            <p>© 2026 PorciTech • Servicio Nacional de Aprendizaje (SENA).</p>
            <p>Gestión Porcina Inteligente y Trazabilidad en Campo.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
