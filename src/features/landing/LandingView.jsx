import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  BellRing,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Video,
  Camera,
} from "lucide-react";
import PublicHeader from "../../components/layout/PublicHeader.jsx";
import BrandMark from "../../components/BrandMark.jsx";
import Button from "../../components/ui/Button.jsx";
import { landingFeatures, landingStats } from "./data.js";
import heroImg from "../../../public/assets/cerdito.jpg";

export default function LandingView() {
  return (
    <main className="min-h-screen text-slate-900 bg-white font-sans">
      <PublicHeader />

      {/* HERO SECTION */}
      <section
        id="inicio"
        className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 lg:px-10 lg:py-24 overflow-hidden"
      >
        {/* Dot pattern background for hero */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [bg-size:16px_16px] opacity-50"></div>

        <div className="flex flex-col justify-center space-y-8 z-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sena-green/20 bg-green-50 px-4 py-1.5 text-sm font-semibold text-sena-green">
            <span className="h-2 w-2 rounded-full bg-sena-green"></span>
            Innovacion SENA
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tight text-sena-blue sm:text-[3.5rem] leading-[1.1]">
              El futuro de la <br /> porcicultura es <br />
              <span className="text-sena-green relative">
                Inteligente
                <div className="absolute -bottom-2 left-0 h-1.5 w-full bg-sena-green/20 rounded-full"></div>
              </span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-slate-500 font-medium">
              Optimiza la produccion porcicola con tecnologia de precision.
              Analisis de datos y alertas tempranas para un campo mas productivo
              y sostenible.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button
              to="/login"
              tone="primary"
              className="rounded-full px-8 py-3 text-base shadow-xl shadow-sena-green/30"
            >
              Comenzar Ahora <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="relative flex items-center justify-center lg:justify-end">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-linear-to-tr from-green-100/40 via-yellow-100/20 to-blue-50/40 blur-3xl -z-10 rounded-full"></div>

          <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/40 bg-white/40 p-3 shadow-2xl backdrop-blur-md overflow-hidden">
            <div className="rounded-2xl border border-black/5 bg-slate-100 overflow-hidden relative aspect-4/3">
              {/* Fake dashboard header details */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur border border-white p-4 rounded-xl shadow-lg z-20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Estado del Lote
                  </span>
                  <span className="bg-green-100 text-sena-green text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Activo
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-3xl font-black text-sena-blue">98%</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Eficiencia productiva
                    </p>
                  </div>
                  <div className="flex items-end gap-1 h-8">
                    <div className="w-2.5 bg-blue-200 rounded-t-sm h-3"></div>
                    <div className="w-2.5 bg-blue-300 rounded-t-sm h-4"></div>
                    <div className="w-2.5 bg-blue-400 rounded-t-sm h-6"></div>
                    <div className="w-2.5 bg-sena-green rounded-t-sm h-8"></div>
                  </div>
                </div>
              </div>

              {/* Using hero image as the mock content if it corresponds, otherwise a stylized slate box */}
              <Image
                src={heroImg}
                alt="Cerdito PorciTech"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="bg-sena-blue border-b-4 border-sena-yellow overflow-hidden relative z-10">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-10 divide-y sm:divide-y-0 sm:divide-x divide-white/10 text-center">
          {landingStats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center p-4"
            >
              <p className="text-4xl font-black text-white">{stat.value}</p>
              <p className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/70">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION (Ecosistema Integral) */}
      <section
        id="caracteristicas"
        className="relative bg-[#f8fcf9] py-24 overflow-hidden"
      >
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-b from-white to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-linear-to-t from-sena-green/5 to-transparent blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-sena-green mb-3">
              ECOSISTEMA INTEGRAL
            </p>
            <h2 className="text-4xl font-black tracking-tight text-sena-blue">
              Soluciones para cada etapa
            </h2>
            <p className="mt-4 text-slate-500 font-medium">
              Nuestra plataforma integra las mejores practicas zootecnicas con
              tecnologia de vanguardia.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                ...landingFeatures[0],
                icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
                iconBg: "bg-purple-100",
                border: "border-t-purple-500",
              },
              {
                ...landingFeatures[1],
                icon: <ShieldCheck className="h-6 w-6 text-cyan-500" />,
                iconBg: "bg-cyan-100",
                border: "border-t-cyan-400",
              },
              {
                ...landingFeatures[2],
                icon: <BellRing className="h-6 w-6 text-yellow-500" />,
                iconBg: "bg-yellow-100",
                border: "border-t-sena-yellow",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 border-t-4 ${feature.border} hover:-translate-y-1 transition-transform duration-300`}
              >
                <div
                  className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconBg}`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-sena-blue mb-3">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-sm text-slate-500 font-medium">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INFO SECTION (Tecnología Adaptada) */}
      <section
        id="impacto"
        className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10"
      >
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div className="relative h-full min-h-100">
            {/* The underlying rounded box */}
            <div className="absolute inset-0 bg-sena-green/10 rounded-3xl -z-10 transform scale-95 translate-y-4"></div>
            <div className="absolute top-10 -left-6 h-20 w-20 rounded-full bg-sena-yellow z-0"></div>

            <div className="relative h-full flex flex-col justify-end items-center px-8 pt-8 pb-0">
              {/* Mockup laptop representation */}
              <div className="w-full relative z-10 max-w-md mx-auto aspect-video bg-white rounded-t-xl border-[6px] border-b-0 border-slate-800 shadow-xl overflow-hidden p-4">
                <div className="flex gap-4 h-full">
                  <div className="w-1/3 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-12 border-sena-blue border-r-sena-green"></div>
                  </div>
                  <div className="w-2/3 flex items-end gap-2 px-2 pb-2">
                    <div className="w-full bg-slate-200 h-1/3 rounded-sm"></div>
                    <div className="w-full bg-sena-green h-2/3 rounded-sm"></div>
                    <div className="w-full bg-sena-blue h-full rounded-sm"></div>
                    <div className="w-full bg-slate-300 h-1/2 rounded-sm"></div>
                    <div className="w-full bg-slate-200 h-1/4 rounded-sm"></div>
                  </div>
                </div>
              </div>
              <div className="w-[110%] h-4 bg-slate-900 rounded-b-xl z-0 shadow-2xl relative"></div>

              <div className="absolute bottom-4 left-0 w-full bg-slate-900/60 backdrop-blur pb-4 pt-12 -mt-16 text-center text-white z-0 rounded-b-xl px-4 text-sm font-medium">
                <strong className="font-bold">Control Total</strong> Desde
                cualquier dispositivo
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tight text-sena-blue sm:text-4xl">
                Tecnología adaptada para la porcicultura colombiana
              </h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Entendemos los retos del campo nacional. Nuestra plataforma esta
                diseñada para funcionar en zonas con conectividad variable y
                adaptarse a las necesidades especificas del pequeño y mediano
                productor.
              </p>
            </div>

            <ul className="space-y-4">
              {[
                "Soporte tecnico especializado SENA",
                "Integracion con programas de fomento agropecuario",
                "Reportes automaticos",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-sena-green" />
                  <span className="font-semibold text-sena-blue">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-sena-green relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"></div>
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center lg:px-10">
          <h2 className="text-3xl font-black tracking-tight text-white mb-4">
            ¿Listo para transformar tu produccion?
          </h2>
          <p className="text-green-50 mb-10 text-lg">
            Unete a la red de productores que ya estan optimizando sus recursos
            con PorciTech.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              to="/login"
              tone="secondary"
              className="w-full sm:w-auto px-8"
            >
              Registrar mi Granja
            </Button>
            <Button
              to="/login"
              tone="outline"
              className="w-full sm:w-auto px-8"
            >
              Contactar Asesor
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contacto" className="bg-sena-blue text-slate-300">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5 border-b border-white/10 pb-12">
            <div className="lg:col-span-2 space-y-6">
              <BrandMark light />
              <p className="text-sm leading-relaxed max-w-xs text-slate-400">
                Plataforma de gestion inteligente alineada con los estandares de
                calidad y sostenibilidad del sector agropecuario.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition"
                >
                  <Globe className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition"
                >
                  <Video className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition"
                >
                  <Camera className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-white mb-6">Plataforma</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#caracteristicas"
                    className="hover:text-green-400 transition"
                  >
                    Caracteristicas
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition">
                    Precios
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition">
                    Casos de Exito
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition">
                    Integraciones
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-white mb-6">Recursos</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="hover:text-green-400 transition">
                    Blog SENA
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition">
                    Guias de Usuario
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition">
                    Soporte Tecnico
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition">
                    Normativa
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-white mb-6">Contacto</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                  <span>Bogota D.C., Colombia</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-slate-400 shrink-0" />
                  <span>+57 (1) 5461500</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-400 shrink-0" />
                  <span>contacto@porcitech.co</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-slate-500">
            <p>© 2026 PorciTech. Todos los derechos reservados.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-slate-300">
                Politica de Privacidad
              </a>
              <a href="#" className="hover:text-slate-300">
                Terminos de Uso
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
