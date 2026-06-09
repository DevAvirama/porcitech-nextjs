# Estructura de Carpetas Profesional - Sistema Integral Porcino (Next.js App Router)

sistema-integral-porcino/
├── .gitignore # Filtros de Git
├── next.config.mjs # Configuración de Next.js (Reemplaza a vite.config.js)
├── package.json # Dependencias y scripts del proyecto con pnpm
├── postcss.config.js # Configuración de estilos PostCSS
├── tailwind.config.js # Configuración de utilidades de Tailwind CSS
├── jsconfig.json # Mapeo de alias de importación (ej: "@/components/...")
├── vercel.json # Configuración del despliegue en Vercel
├── README.md # Documentación general del repositorio
│
├── public/ # Archivos estáticos accesibles directamente por URL
│ ├── favicon.svg # Ícono de la pestaña del navegador
│ ├── icons.svg # Sprite o archivo de íconos compartidos
│ └── assets/ # ¡MEJORA! Recursos gráficos optimizados con rutas absolutas nativas
│ ├── SENA.png # Logotipo de la institución
│ ├── cerdito.jpg # Imagen ilustrativa del sistema porcino
│ └── hero.png # Imagen principal de la Landing View
│
└── src/
├── app/ # ENRUTADOR PRINCIPAL (Mapeo de rutas de la aplicación)
│ ├── globals.css # Estilos globales (Antes llamado index.css)
│ ├── layout.jsx # Layout raíz de la app (HTML, Body, carga de fuentes)
│ ├── page.jsx # LandingPage principal (Ruta: /)
│ ├── loading.jsx # ¡NUEVO! Estado de carga / Skeleton raíz global del sistema
│ ├── not-found.jsx # ¡NUEVO! Manejador nativo para capturar e interceptar errores 404
│ │
│ ├── login/ # Mapeo de ruta individual de Login
│ │ └── page.jsx # Renderiza <LoginView /> (Ruta: /login)
│ │
│ ├── forgot-password/ # Mapeo de ruta individual de Recuperación
│ │ └── page.jsx # Renderiza <ForgotPasswordView /> (Ruta: /forgot-password)
│ │
│ └── dashboard/ # Mapeo del Panel de Administración (Ruta base: /dashboard)
│ ├── layout.jsx # Layout del Dashboard (Sidebar fijo + estructura del contenedor)
│ ├── page.jsx # Vista principal del Dashboard (Métricas y acciones iniciales)
│ ├── loading.jsx # ¡NUEVO! Skeleton genérico de vistas internas del panel privado
│ │
│ ├── inventory/ # Ruta: /dashboard/inventory
│ │ ├── page.jsx # Renderiza <InventoryView />
│ │ └── profile/ # Subruta: /dashboard/inventory/profile
│ │ └── page.jsx # Renderiza <AnimalProfileView />
│ │
│ ├── animals/ # Ruta: /dashboard/animals
│ │ └── page.jsx # Renderiza <AnimalsView />
│ │
│ ├── feeding/ # Ruta: /dashboard/feeding
│ │ └── page.jsx # Renderiza <FeedingView />
│ │
│ ├── weight/ # Ruta: /dashboard/weight
│ │ └── page.jsx # Renderiza <WeightView />
│ │
│ ├── reproduction/ # Ruta protegida: /dashboard/reproduction
│ │ └── page.jsx # Renderiza <ReproductionView /> envuelto en <ProtectedRoute>
│ │
│ ├── health/ # Ruta protegida: /dashboard/health
│ │ └── page.jsx # Renderiza <HealthView /> envuelto en <ProtectedRoute>
│ │
│ ├── reports/ # Ruta protegida: /dashboard/reports
│ │ └── page.jsx # Renderiza <ReportsView /> envuelto en <ProtectedRoute>
│ │
│ └── settings/ # Ruta protegida: /dashboard/settings
│ └── page.jsx # Renderiza <SettingsView /> envuelto en <ProtectedRoute>
│
├── components/ # COMPONENTES GLOBALES TRANSVERSALES (Dumb)
│ ├── BrandMark.jsx # Identidad y logotipo visual del sistema
│ │
│ ├── auth/
│ │ └── ProtectedRoute.jsx # Validador de roles adaptado a Next.js ('use client')
│ │
│ ├── layout/
│ │ ├── AuthSplitLayout.jsx # Estructura dividida para pantallas de auth
│ │ ├── DashboardSidebar.jsx # Barra de navegación lateral ('use client')
│ │ └── PublicHeader.jsx # Barra superior pública de la landing
│ │
│ └── ui/ # UI Atómica (Componentes Presentacionales puros)
│ ├── Button.jsx # Componente de botón Tailwind
│ ├── Card.jsx # Tarjetas contenedoras reutilizables
│ ├── Input.jsx # Campo de entrada de formulario integrado
│ ├── Table.jsx # Base estructural paramétrica para tablas
│ └── Skeleton.jsx # ¡NUEVO! Componente atómico con animación 'animate-pulse' para armar las cargas
│
├── features/ # ARQUITECTURA POR DOMINIOS (Smart - Lógica aislada)
│ ├── animals/ # Control y registro de animales porcinos
│ │ ├── components/
│ │ │ ├── AddAnimalModal.jsx # Modal para el ingreso de porcinos
│ │ │ ├── AnimalStatusBadge.jsx # Distintivo de estado por etapa biológica
│ │ │ └── AnimalTable.jsx # Listado específico del lote
│ │ ├── AnimalsView.jsx # Contenedor del módulo de cerdos
│ │ └── index.js # Exportador
│ │
│ ├── auth/ # Gestión de perfiles y seguridad
│ │ ├── components/
│ │ │ ├── LoginForm.jsx # Captura de datos de acceso
│ │ │ └── LoginShowcase.jsx # Panel decorativo de la vista de login
│ │ ├── forgotPassword/
│ │ │ ├── components/
│ │ │ │ ├── ForgotPasswordForm.jsx # Formulario de recuperación
│ │ │ │ └── ForgotPasswordShowcase.jsx # Ilustración de recuperación
│ │ │ └── ForgotPasswordView.jsx # Interfaz de recuperación de claves
│ │ ├── LoginView.jsx # Pantalla de Login de la app
│ │ ├── SettingsView.jsx # Gestión de configuraciones del usuario
│ │ └── index.js # Exportador
│ │
│ ├── dashboard/ # Elementos exclusivos de la raíz de control privado
│ │ ├── components/
│ │ │ ├── QuickActions.jsx # Accesos directos a tareas comunes
│ │ │ ├── RecentActivityTable.jsx # Tabla de eventos recientes
│ │ │ ├── StatsGrid.jsx # Grid de tarjetas de KPIs principales
│ │ │ └── SystemSuggestion.jsx # Recomendaciones automatizadas por el sistema
│ │ └── index.js # Exportador
│ │
│ ├── feeding/ # Control nutricional y raciones por lote
│ │ ├── FeedingView.jsx # Interfaz operativa de alimentación
│ │ └── index.js # Exportador
│ │
│ ├── health/ # Gestión clínico-veterinaria y alertas
│ │ ├── components/
│ │ │ └── AddHealthRecordModal.jsx # Formulario modal de novedades médicas
│ │ ├── data/
│ │ │ ├── biosecurityProtocols.json # JSON estático de protocolos sanitarios
│ │ │ └── healthStandards.json # Rangos y estándares clínicos sanitarios
│ │ ├── BiosecurityView.jsx # Panel de protocolos de bioseguridad
│ │ ├── HealthView.jsx # Vista general de novedades de sanidad
│ │ └── index.js # Exportador
│ │
│ ├── inventory/ # Control de existencias de insumos y perfiles
│ │ ├── data/
│ │ │ └── inventoryConstants.json # Unidades de medida fijas para el stock
│ │ ├── AnimalProfileView.jsx # Hoja de vida y ficha técnica interna de cada porcino
│ │ └── InventoryView.jsx # Interfaz de stock de almacén
│ │
│ ├── landing/ # Presentación introductoria del aplicativo
│ │ ├── data.js # Configuración de textos dinámicos de marketing
│ │ └── LandingView.jsx # Estructura visual de cara al público externo
│ │
│ ├── reports/ # Analíticas y exportación de reportes
│ │ ├── ReportsView.jsx # Panel selector para descarga de informes
│ │ └── index.js # Exportador
│ │
│ ├── reproduction/ # Control de ciclos reproductivos y partos
│ │ ├── data/
│ │ │ └── reproductionStandards.json # Parámetros y constantes de gestación
│ │ └── ReproductionView.jsx # Vista operativa de control reproductivo
│ │
│ └── weight/ # Curvas de crecimiento y evolución de peso
│ ├── data/
│ │ └── weightStandards.json # Metas esperadas semanales de pesaje
│ └── WeightView.jsx # Vista de gráficas y pesaje de animales
│
├── hooks/ # Custom Hooks compartidos
│ └── useFormFields.js # Capturador genérico de inputs de formularios
│
├── services/ # Controladores de peticiones / Estado simulado
│ ├── auth/
│ │ └── authService.js # Control de sesiones y token de rol de usuario
│ └── dashboard/
│ └── dashboardService.js # Proveedor analítico para indicadores KPI
│
└── utils/ # Funciones utilitarias y formateadores puras
└── formatters.js # Formateador de fechas y pesajes (kg)
