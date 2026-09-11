# 🐷 PorciTech - Plataforma de Gestión y Trazabilidad Porcícola[cite: 2]

Sistema web integral desarrollado con **Next.js (App Router)** y **Tailwind CSS** para la administración técnica, productiva y sanitaria de granjas porcícolas[cite: 2]. Diseñado bajo una **arquitectura basada en características (Feature-Driven Architecture)**, permite la trazabilidad completa del ciclo de vida animal, control de bioseguridad, reproducción, alimentación, pesaje e inventarios[cite: 2].

---

## 🏗️ Arquitectura del Sistema

```text
[ Usuario / Administrador / Veterinario ]          [ Consumidor / Auditor ]
                   │                                          │
                   ▼ (Rutas Protegidas)                       ▼ (Acceso Público)
       [ Dashboard PorciTech ]                    [ Portal de Trazabilidad QR ]
  ├── 📊 Dashboard General                       └── /trace/[id]
  ├── 🐖 Gestión de Animales & Perfiles
  ├── ⚖️ Control de Pesaje & Rendimiento
  ├── 🧬 Manejo Reproductivo
  ├── 🧪 Sanidad & Bioseguridad
  ├── 🌾 Planes de Alimentación
  ├── 📦 Inventario de Insumos & Medicamentos
  └── 📈 Reportes & Analítica Operativa
```

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Rol en la Aplicación |
| :--- | :--- | :--- |
| **Framework Core** | Next.js (App Router) ⚛️ | Enrutamiento optimizado, Server & Client Components[cite: 2]. |
| **Diseño & UI** | Tailwind CSS / PostCSS 🎨 | Estilos utilitarios responsivos y componentes modulares[cite: 2]. |
| **Gestor de Paquetes** | `pnpm` ⚡ | Resolución determinista y rápida de dependencias[cite: 2]. |
| **Patrón Arquitectónico**| Feature-Driven Architecture 📁 | Organización modular por dominios de negocio (`src/features/*`)[cite: 2]. |
| **Identificación & QR** | Módulo de Trazabilidad Dinámica 🔍 | Consulta de historiales clínicos y origen animal mediante QR[cite: 2]. |
| **Control de Calidad** | ESLint 9+ 🧹 | Estandarización y linting estricto de código JavaScript[cite: 2]. |

---

## ✨ Módulos y Características Principales

* 🏷️ **Control de Animales & Trazabilidad QR:** Registro individual por lote o arete, generación de códigos QR, estados zootécnicos y perfiles detallados[cite: 2].
* 📊 **Dashboard Analítico:** Indicadores clave de rendimiento (KPIs), actividad reciente, alertas preventivas y sugerencias automáticas del sistema[cite: 2].
* 🧪 **Sanidad & Bioseguridad:** Registro de vacunaciones, tratamientos veterinarios, protocolos de desinfección y cumplimiento de estándares sanitarios[cite: 2].
* 🧬 **Reproducción & Ciclos:** Seguimiento de montas, inseminación artificial, control de gestación, fechas probables de parto y lechigadas[cite: 2].
* ⚖️ **Curvas de Pesaje:** Monitoreo de conversión alimenticia, ganancia diaria de peso (GDP) y comparativa frente a estándares porcícolas[cite: 2].
* 🌾 **Alimentación & Nutrición:** Asignación de dietas por etapas productivas (iniciación, levante, ceba, lactancia)[cite: 2].
* 📦 **Inventario Agropecuario:** Gestión de stock de medicamentos, alimentos balanceados e insumos generales con alertas de reabastecimiento[cite: 2].
* 🔐 **Seguridad & Sesión:** Rutas protegidas (`ProtectedRoute`), layout de autenticación dividido y recuperación de credenciales[cite: 2].

---

## 📂 Estructura del Directorio

```text
porcitech-nextjs/
├── public/                 # Recursos estáticos (logos, iconos, imágenes)[cite: 2]
├── src/
│   ├── app/                # App Router (Páginas, Layouts, Errores y Carga)[cite: 2]
│   │   ├── dashboard/      # Rutas del panel administrativo[cite: 2]
│   │   │   ├── animals/    # Gestión animal y perfiles[cite: 2]
│   │   │   ├── feeding/    # Alimentación[cite: 2]
│   │   │   ├── health/     # Sanidad y bioseguridad[cite: 2]
│   │   │   ├── inventory/  # Inventarios[cite: 2]
│   │   │   ├── reports/    # Reportes[cite: 2]
│   │   │   ├── reproduction/# Reproducción[cite: 2]
│   │   │   └── weight/     # Pesaje[cite: 2]
│   │   ├── login/          # Inicio de sesión[cite: 2]
│   │   ├── trace/[id]/     # Consulta pública de trazabilidad[cite: 2]
│   │   └── layout.jsx      # Root Layout[cite: 2]
│   ├── components/         # Componentes UI reutilizables (Botones, Tablas, Modales)[cite: 2]
│   ├── features/           # Vistas, componentes y datos agrupados por dominio[cite: 2]
│   ├── hooks/              # Custom hooks de React (formularios, UI)[cite: 2]
│   ├── services/           # Capa de consumo de API y autenticación[cite: 2]
│   └── utils/              # Funciones auxiliares y formateadores[cite: 2]
├── package.json            # Configuración de dependencias y scripts[cite: 2]
└── pnpm-lock.yaml          # Bloqueo de dependencias[cite: 2]
```

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone [https://github.com/tu-usuario/porcitech-nextjs.git](https://github.com/tu-usuario/porcitech-nextjs.git)
cd porcitech-nextjs
```

### 2. Instalar dependencias con `pnpm`
```bash
# Si no tienes pnpm instalado: npm install -g pnpm
pnpm install
```

### 3. Configurar variables de entorno (opcional)
Crea un archivo `.env.local` en la raíz del proyecto en caso de requerir conexión con una API externa:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 4. Iniciar el entorno de desarrollo
```bash
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## ⚙️ Scripts Disponibles

* `pnpm dev` - Inicia el servidor de desarrollo con Hot Module Replacement (HMR).
* `pnpm build` - Compila y optimiza la aplicación para entornos de producción.
* `pnpm start` - Ejecuta la versión compilada en modo producción.
* `pnpm lint` - Ejecuta ESLint para analizar la sintaxis y formato del código[cite: 2].
